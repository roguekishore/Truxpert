import React, { useState, useEffect } from 'react';
import InspectorNavigation from '../navigation/InspectorNavigation';
import '../css/InspectorApp.css';

const InspectorApp = ({ user, onLogout, onProfileUpdate }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleNavLinkClick = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    setActiveSection('dashboard');
    onLogout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <InspectorDashboard user={user} />;
      case 'tasks':
        return <AssignedTasks user={user} />;
      case 'locations':
        return <InspectionLocations user={user} />;
      case 'reports':
        return <InspectionReports user={user} />;
      default:
        return <InspectorDashboard user={user} />;
    }
  };

  return (
    <div>
      <InspectorNavigation
        activeSection={activeSection}
        setActiveSection={handleNavLinkClick}
        onLogout={handleLogout}
        onProfileUpdate={onProfileUpdate}
        user={user}
      />
      <div className='app-wrapper'>
        <div className="app-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const InspectorDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [todayInspections, setTodayInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchStats();
    fetchTodayInspections();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/inspector/${user.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    }
  };

  const fetchTodayInspections = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/inspector/${user.id}/pending`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      setTodayInspections(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(dateString);
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Inspector Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Assigned Tasks</h3>
          <p className="stat-number">{stats?.pendingInspections || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Inspections</h3>
          <p className="stat-number">{stats?.totalInspections || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Passed Inspections</h3>
          <p className="stat-number">{stats?.passedInspections || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Success Rate</h3>
          <p className="stat-number">{stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}</p>
        </div>
      </div>
      <div className="today-schedule">
        <h2>Pending Inspections</h2>
        {todayInspections.length === 0 ? (
          <p>No pending inspections</p>
        ) : (
          todayInspections.map((inspection) => (
            <div key={inspection.id} className="schedule-item">
              <div className="time">{formatDate(inspection.inspectionDate)}</div>
              <div className="task">
                Inspect {inspection.foodTruck?.brandName || 'Unknown'} - {inspection.foodTruck?.location || 'Unknown Location'}
              </div>
              <div className="status pending">{inspection.result}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AssignedTasks = ({ user }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/inspector/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      setInspections(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const updateInspectionResult = async (inspectionId, result, notes = '') => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/${inspectionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result, notes })
      });

      if (!response.ok) throw new Error('Failed to update inspection');
      
      alert(`Inspection marked as ${result}`);
      fetchInspections(); // Refresh the list
    } catch (err) {
      console.error('Error updating inspection:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(dateString);
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) return <div className="loading">Loading inspections...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assigned-tasks">
      <h1>Assigned Inspection Tasks</h1>
      <div className="tasks-list">
        {inspections.length === 0 ? (
          <p>No inspections assigned</p>
        ) : (
          inspections.map((inspection) => (
            <div key={inspection.id} className="task-card">
              <h3>{inspection.foodTruck?.brandName || 'Unknown'} Inspection</h3>
              {/* <p><strong>Food Truck:</strong> {inspection.foodTruck?.name || 'N/A'}</p> */}
              <p><strong>Location:</strong> {inspection.foodTruck?.location || 'N/A'}</p>
              <p><strong>Operating Region:</strong> {inspection.foodTruck?.operatingRegion || 'N/A'}</p>
              <p><strong>Assigned Date:</strong> {formatDate(inspection.inspectionDate)}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${inspection.result?.toLowerCase()}`}>
                  {inspection.result}
                </span>
              </p>
              {/* <p><strong>Owner:</strong> {inspection.foodTruck?.brand?.vendor?.name || 'N/A'}</p>
              <p><strong>Contact:</strong> {inspection.foodTruck?.owner?.email || 'N/A'}</p> */}
              
              <div className="task-checklist">
                <h4>Inspection Checklist:</h4>
                <ul>
                  <li>Food storage temperature compliance</li>
                  <li>Cleanliness and sanitation standards</li>
                  <li>Equipment functionality and safety</li>
                  <li>Staff hygiene practices</li>
                  <li>License and permits display</li>
                  <li>Fire safety equipment</li>
                </ul>
              </div>
              
              {inspection.result === 'IN_PROGRESS' && (
                <div className="task-actions">
                  <button 
                    className="pass-btn"
                    onClick={() => updateInspectionResult(inspection.id, 'PASS')}
                  >
                    Mark as PASS
                  </button>
                  <button 
                    className="fail-btn"
                    onClick={() => updateInspectionResult(inspection.id, 'FAIL')}
                  >
                    Mark as FAIL
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const InspectionLocations = ({ user }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/inspector/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      setInspections(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading locations...</div>;

  return (
    <div className="inspection-locations">
      {/* <h1>Inspection Locations</h1> */}
      <h1>Your Assigned Locations</h1>
      <div className="locations-list">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="location-item">
            <h3>{inspection.foodTruck?.location || 'Unknown Location'}</h3>
            <p><strong>Food Truck:</strong> {inspection.foodTruck?.brandName || 'N/A'}</p>
            <p><strong>Operating Region:</strong> {inspection.foodTruck?.operatingRegion || 'N/A'}</p>
            {/* <p><strong>Owner:</strong> {inspection.foodTruck?.owner?.name || 'N/A'}</p> */}
            <p><strong>Status:</strong> 
              <span className={`status-badge ${inspection.result?.toLowerCase()}`}>
                {inspection.result}
              </span>
            </p>
            {/* <div className="location-actions">
              <button className="contact-btn">
                Contact: {inspection.foodTruck?.owner?.email || 'N/A'}
              </button>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

const InspectionReports = ({ user }) => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inspections/inspector/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      setInspections(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let date;
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute);
      } else {
        date = new Date(dateString);
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    if (filter === 'all') return true;
    return inspection.result?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="inspection-reports">
      <h1>Inspection Reports</h1>
      <div className="report-actions">
        <select 
          className="report-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Reports</option>
          <option value="in_progress">In Progress</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
        </select>
      </div>
      
      <div className="reports-list">
        {filteredInspections.length === 0 ? (
          <p>No inspection reports found</p>
        ) : (
          filteredInspections.map((inspection) => (
            <div key={inspection.id} className="report-card">
              <h3>{inspection.foodTruck?.brandName || 'Unknown'} - Inspection Report</h3>
              <p><strong>Inspection Date:</strong> {formatDate(inspection.inspectionDate)}</p>
              <p><strong>Inspector:</strong> {user.name}</p>
              <p><strong>Location:</strong> {inspection.foodTruck?.location || 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span className={`status-badge ${inspection.result?.toLowerCase()}`}>
                  {inspection.result}
                </span>
              </p>
              {/* <div className="report-summary">
                <p><strong>Food Truck Details:</strong></p>
                <ul>
                  <li>Name: {inspection.foodTruck?.vendor?.name || 'N/A'}</li>
                  <li>Operating Region: {inspection.foodTruck?.operatingRegion || 'N/A'}</li>
                  <li>Owner: {inspection.foodTruck?.vendor?.name || 'N/A'}</li>
                  <li>Contact: {inspection.foodTruck?.vendor?.email || 'N/A'}</li>
                </ul>
              </div> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InspectorApp;