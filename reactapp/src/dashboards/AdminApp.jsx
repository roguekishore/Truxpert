import React, { useState, useEffect } from 'react';
import AdminNavigation from '../navigation/AdminNavigation';
import '../css/AdminApp.css';

const AdminApp = ({ user, onLogout, onProfileUpdate }) => {
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
        return <AdminDashboard />;
      case 'reviewers':
        return <AssignReviewers />;
      case 'inspectors':
        return <AssignInspectors />;
      case 'regions':
        return <RegionalView />;
      case 'applications':
        return <ApplicationsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div>
      <AdminNavigation
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

// Updated AdminDashboard with real data
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    activeFoodTrucks: 0,
    availableReviewers: 0,
    totalInspections: 0,
    regions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data in parallel
      const [
        pendingAppsResponse,
        allAppsResponse,
        reviewersResponse,
        inspectionsResponse,
        foodTrucksResponse
      ] = await Promise.all([
        fetch(`${BASE_URL}/api/applications/by-status?status=SUBMITTED&page=0&size=1`),
        fetch(`${BASE_URL}/api/applications/by-status?status=APPROVED&page=0&size=1`),
        fetch(`${BASE_URL}/api/users/role/REVIEWER`),
        fetch(`${BASE_URL}/api/inspections`),
        fetch(`${BASE_URL}/api/foodtrucks`)
      ]);

      if (!pendingAppsResponse.ok || !allAppsResponse.ok || !reviewersResponse.ok || 
          !inspectionsResponse.ok || !foodTrucksResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [pendingApps, allApps, reviewers, inspections, foodTrucks] = await Promise.all([
        pendingAppsResponse.json(),
        allAppsResponse.json(),
        reviewersResponse.json(),
        inspectionsResponse.json(),
        foodTrucksResponse.json()
      ]);

      // Extract unique regions from food trucks
      const uniqueRegions = [...new Set(foodTrucks.map(truck => truck.operatingRegion).filter(Boolean))];

      setStats({
        pendingApplications: pendingApps.totalElements || 0,
        activeFoodTrucks: allApps.totalElements || 0,
        availableReviewers: reviewers.length || 0,
        totalInspections: inspections.length || 0,
        regions: uniqueRegions.length || 0
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Applications</h3>
          <p className="stat-number">{stats.pendingApplications}</p>
        </div>
        <div className="stat-card">
          <h3>Active Food Trucks</h3>
          <p className="stat-number">{stats.activeFoodTrucks}</p>
        </div>
        <div className="stat-card">
          <h3>Available Reviewers</h3>
          <p className="stat-number">{stats.availableReviewers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Inspections</h3>
          <p className="stat-number">{stats.totalInspections}</p>
        </div>
        <div className="stat-card">
          <h3>Regions Covered</h3>
          <p className="stat-number">{stats.regions}</p>
        </div>
      </div>
    </div>
  );
};

const AssignReviewers = () => {
  const [applications, setApplications] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'submissionDate',
    sortDirection: 'desc'
  });
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(true);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchApplications();
    fetchReviewers();
  }, [pagination.page, filters, showUnassignedOnly]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      });

      if (filters.status && filters.status !== '') {
        params.append('status', filters.status.toUpperCase());
      }

      // Use the new endpoint with details
      const url = `${BASE_URL}/api/applications/with-details?${params}`;

      console.log('Fetching applications from:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched applications data:', data);
      
      let filteredContent = data.content || [];
      
      // Filter for unassigned applications if checkbox is checked
      if (showUnassignedOnly) {
        filteredContent = filteredContent.filter(app => 
          !app.reviewerName
        );
      }
      
      setApplications(filteredContent);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/role/REVIEWER`);
      if (!response.ok) throw new Error('Failed to fetch reviewers');
      const data = await response.json();
      setReviewers(data);
      console.log('Fetched reviewers:', data);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const handleAssignReviewer = async (applicationId, reviewerId) => {
    if (!reviewerId) {
      alert('Please select a reviewer');
      return;
    }

    try {
      console.log(`Assigning reviewer ${reviewerId} to application ${applicationId}`);
      
      const response = await fetch(`${BASE_URL}/api/applications/${applicationId}/assign-reviewer/${reviewerId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Assignment error:', errorText);
        throw new Error(`Failed to assign reviewer: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Assignment result:', result);
      
      alert('Reviewer assigned successfully');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error assigning reviewer:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && applications.length === 0) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assign-reviewers">
      <h1>Assign Reviewers to Applications</h1>
      
      <div className="filters">
        <select 
          className="status-filter"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select 
          className="sort-filter"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="submissionDate">Sort by Date</option>
          <option value="id">Sort by ID</option>
        </select>
        
        <select 
          className="direction-filter"
          value={filters.sortDirection}
          onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        
        <label className="checkbox-filter">
          <input 
            type="checkbox" 
            checked={showUnassignedOnly}
            onChange={(e) => setShowUnassignedOnly(e.target.checked)}
          />
          Show unassigned only
        </label>
      </div>

      <div className="applications-table">
        {applications.length === 0 ? (
          <div className="no-applications">No applications found</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food Truck</th>
                  <th>Owner</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Current Reviewer</th>
                  <th>Assign Reviewer</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>#{application.id}</td>
                    <td>
                      <div>
                        <strong>{application.brandName || 'N/A'}</strong>
                        <br />
                        <small>{application.foodTruckLocation || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {application.vendorName || 'N/A'}
                        <br />
                        <small>{application.vendorEmail || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{formatDate(application.submissionDate)}</td>
                    <td>
                      <span className={`status-badge ${application.status?.toLowerCase()}`}>
                        {application.status}
                      </span>
                    </td>
                    <td>
                      {application.reviewerName ? (
                        <span className="assigned-reviewer">
                          {application.reviewerName}
                        </span>
                      ) : (
                        <span className="no-reviewer">Not assigned</span>
                      )}
                    </td>
                    <td>
                      {/* Disable assignment if already reviewed (APPROVED/REJECTED) */}
                      {application.status === 'APPROVED' || application.status === 'REJECTED' ? (
                        <div className="reviewer-assignment-disabled">
                          <span className="assignment-locked">
                            {application.status === 'APPROVED' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                        </div>
                      ) : (
                        <div className="reviewer-assignment">
                          <select 
                            className="reviewer-select"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignReviewer(application.id, e.target.value);
                                e.target.value = ''; // Reset select after assignment
                              }
                            }}
                            defaultValue=""
                          >
                            <option value="">{application.reviewerName ? 'Reassign Reviewer' : 'Select Reviewer'}</option>
                            {reviewers.map(reviewer => (
                              <option key={reviewer.id} value={reviewer.id}>
                                {reviewer.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
          className="pagination-btn"
        >
          Previous
        </button>
        
        <span className="page-info">
          Page {pagination.page + 1} of {pagination.totalPages} 
          ({pagination.totalElements} total)
        </span>
        
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages - 1}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const AssignInspectors = () => {
  const [inspections, setInspections] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [foodTrucks, setFoodTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    showUnassignedOnly: false,
    inspectionStatus: 'all',
    sortBy: 'brandName',
    sortDirection: 'asc'
  });

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [inspectorsResponse, foodTrucksResponse, inspectionsResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/users/role/INSPECTOR`),
        // Use the new endpoint for approved food trucks
        fetch(`${BASE_URL}/api/applications/foodtrucks/status/APPROVED`),
        fetch(`${BASE_URL}/api/inspections`)
      ]);

      if (!inspectorsResponse.ok || !foodTrucksResponse.ok || !inspectionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [inspectorsData, foodTrucksData, inspectionsData] = await Promise.all([
        inspectorsResponse.json(),
        foodTrucksResponse.json(),
        inspectionsResponse.json()
      ]);

      setInspectors(inspectorsData);
      setFoodTrucks(foodTrucksData);
      setInspections(inspectionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignInspector = async (foodTruckId, inspectorId) => {
    if (!inspectorId) {
      alert('Please select an inspector');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/inspections/assign/${foodTruckId}/inspector/${inspectorId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to assign inspector');
      }

      alert('Inspector assigned successfully');
      fetchData(); // Refresh the data
    } catch (err) {
      console.error('Error assigning inspector:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Filter and sort food trucks
  const getFilteredTrucks = () => {
    let filtered = [...foodTrucks];
    
    // Filter by inspection status
    if (filters.showUnassignedOnly) {
      filtered = filtered.filter(truck => 
        !inspections.find(i => i.foodTruck?.id === truck.id)
      );
    } else if (filters.inspectionStatus !== 'all') {
      filtered = filtered.filter(truck => {
        const inspection = inspections.find(i => i.foodTruck?.id === truck.id);
        if (filters.inspectionStatus === 'unassigned') {
          return !inspection;
        }
        return inspection?.result?.toLowerCase() === filters.inspectionStatus.toLowerCase();
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[filters.sortBy] || '';
      let bVal = b[filters.sortBy] || '';
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (filters.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredTrucks = getFilteredTrucks();

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assign-inspectors">
      <h1>Assign Inspectors to Food Trucks</h1>
      
      <div className="filters">
        <select 
          className="status-filter"
          value={filters.inspectionStatus}
          onChange={(e) => handleFilterChange('inspectionStatus', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="unassigned">Unassigned</option>
          <option value="in_progress">In Progress</option>
          <option value="pass">Passed</option>
          <option value="fail">Failed</option>
        </select>
        
        <select 
          className="sort-filter"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="brandName">Sort by Brand</option>
          <option value="vendorName">Sort by Owner</option>
          <option value="operatingRegion">Sort by Region</option>
          <option value="location">Sort by Location</option>
        </select>
        
        <select 
          className="direction-filter"
          value={filters.sortDirection}
          onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        
        <label className="checkbox-filter">
          <input 
            type="checkbox" 
            checked={filters.showUnassignedOnly}
            onChange={(e) => handleFilterChange('showUnassignedOnly', e.target.checked)}
          />
          Show unassigned only
        </label>
      </div>

      <div className="applications-table">
        {filteredTrucks.length === 0 ? (
          <div className="no-applications">No food trucks found</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand / Location</th>
                  <th>Owner</th>
                  <th>Region</th>
                  <th>Cuisine</th>
                  <th>Inspector</th>
                  <th>Status</th>
                  <th>Assign Inspector</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.map((truck) => {
                  const existingInspection = inspections.find(
                    inspection => inspection.foodTruck?.id === truck.id
                  );

                  return (
                    <tr key={truck.id}>
                      <td>#{truck.id}</td>
                      <td>
                        <div>
                          <strong>{truck.brandName || 'N/A'}</strong>
                          <br />
                          <small>{truck.location || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          {truck.vendorName || 'N/A'}
                          <br />
                          <small>{truck.vendorEmail || 'N/A'}</small>
                        </div>
                      </td>
                      <td>{truck.operatingRegion || 'N/A'}</td>
                      <td>{truck.cuisineSpecialties || 'N/A'}</td>
                      <td>
                        {existingInspection?.inspector?.name ? (
                          <span className="assigned-reviewer">
                            {existingInspection.inspector.name}
                          </span>
                        ) : (
                          <span className="no-reviewer">Not assigned</span>
                        )}
                      </td>
                      <td>
                        {existingInspection ? (
                          <span className={`status-badge ${existingInspection.result?.toLowerCase()}`}>
                            {existingInspection.result}
                          </span>
                        ) : (
                          <span className="status-badge submitted">Pending</span>
                        )}
                      </td>
                      <td>
                        {existingInspection?.result === 'PASS' || existingInspection?.result === 'FAIL' ? (
                          <span className="status-action-badge approved">
                            {existingInspection.result === 'PASS' ? '✓ Passed' : '✗ Failed'}
                          </span>
                        ) : (
                          <select 
                            className="inspector-select"
                            onChange={(e) => handleAssignInspector(truck.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">{existingInspection ? 'Reassign' : 'Assign Inspector'}</option>
                            {inspectors.map(inspector => (
                              <option key={inspector.id} value={inspector.id}>
                                {inspector.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Updated RegionalView with real data
const RegionalView = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchRegionalData();
  }, []);

  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      
      // Fetch approved food trucks and all applications
      const [foodTrucksResponse, applicationsResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/applications/foodtrucks/status/APPROVED`),
        fetch(`${BASE_URL}/api/applications`)
      ]);

      if (!foodTrucksResponse.ok || !applicationsResponse.ok) {
        throw new Error('Failed to fetch regional data');
      }

      const [foodTrucks, applications] = await Promise.all([
        foodTrucksResponse.json(),
        applicationsResponse.json()
      ]);

      // Group food trucks by operating region
      const regionStats = {};
      
      foodTrucks.forEach(truck => {
        const region = truck.operatingRegion || 'Unknown';
        if (!regionStats[region]) {
          regionStats[region] = {
            name: region,
            activeFoodTrucks: 0,
            pendingApplications: 0,
            totalApplications: 0
          };
        }
        
        regionStats[region].activeFoodTrucks++;
      });

      // Count pending applications by region
      applications.forEach(app => {
        if (app.status === 'SUBMITTED' && app.foodTruck?.operatingRegion) {
          const region = app.foodTruck.operatingRegion;
          if (!regionStats[region]) {
            regionStats[region] = {
              name: region,
              activeFoodTrucks: 0,
              pendingApplications: 0,
              totalApplications: 0
            };
          }
          regionStats[region].pendingApplications++;
        }
        
        if (app.foodTruck?.operatingRegion) {
          const region = app.foodTruck.operatingRegion;
          if (!regionStats[region]) {
            regionStats[region] = {
              name: region,
              activeFoodTrucks: 0,
              pendingApplications: 0,
              totalApplications: 0
            };
          }
          regionStats[region].totalApplications++;
        }
      });

      setRegions(Object.values(regionStats));
    } catch (err) {
      console.error('Error fetching regional data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading regional data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="regional-view">
      <h1>Food Trucks by Operating Region</h1>
      <div className="regions-grid">
        {regions.length === 0 ? (
          <div className="no-data">No regional data available</div>
        ) : (
          regions.map((region) => (
            <div key={region.name} className="region-card">
              <h3>{region.name}</h3>
              <p>Active Food Trucks: {region.activeFoodTrucks}</p>
              <p>Pending Applications: {region.pendingApplications}</p>
              <p>Total Applications: {region.totalApplications}</p>
              <button 
                className="view-details-btn"
                onClick={() => alert(`Detailed view for ${region.name} region will be implemented`)}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Updated ApplicationsManagement with only delete and assign reviewer options
const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchApplications();
    fetchReviewers();
  }, [pagination.page, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: 'submissionDate',
        sortDirection: 'desc'
      });

      // Add status filter if specified
      if (filters.status !== 'all') {
        params.append('status', filters.status.toUpperCase());
      }

      // Use the same endpoint as AssignReviewers for consistent data
      const url = `${BASE_URL}/api/applications/with-details?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      
      // Filter by region if specified
      let filteredContent = data.content || [];
      if (filters.region !== 'all') {
        filteredContent = filteredContent.filter(app => 
          app.foodTruckOperatingRegion?.toLowerCase() === filters.region.toLowerCase()
        );
      }
      
      setApplications(filteredContent);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/role/REVIEWER`);
      if (!response.ok) throw new Error('Failed to fetch reviewers');
      const data = await response.json();
      setReviewers(data);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      alert('Application deleted successfully');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAssignReviewer = async (applicationId, reviewerId) => {
    if (!reviewerId) {
      alert('Please select a reviewer');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/applications/${applicationId}/assign-reviewer/${reviewerId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to assign reviewer');
      }

      alert('Reviewer assigned successfully');
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error('Error assigning reviewer:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="applications-management">
      <h1>Applications Management</h1>
      
      <div className="filters">
        <select 
          className="status-filter"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select 
          className="region-filter"
          value={filters.region}
          onChange={(e) => handleFilterChange('region', e.target.value)}
        >
          <option value="all">All Regions</option>
          <option value="chennai">Chennai</option>
          <option value="bangalore">Bangalore</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="hyderabad">Hyderabad</option>
          <option value="pune">Pune</option>
        </select>
      </div>

      <div className="applications-table">
        {applications.length === 0 ? (
          <div className="no-applications">No applications found</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food Truck</th>
                  <th>Owner</th>
                  <th>Region</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Reviewer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>#{application.id}</td>
                    <td>
                      <div>
                        <strong>{application.brandName || 'N/A'}</strong>
                        <br />
                        <small>{application.foodTruckLocation || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {application.vendorName || 'N/A'}
                        <br />
                        <small>{application.vendorEmail || 'N/A'}</small>
                      </div>
                    </td>
                    
                    <td>{application.operatingRegion || 'N/A'}</td>
                    <td>{formatDate(application.submissionDate)}</td>
                    <td>
                      <span className={`status-badge ${application.status?.toLowerCase()}`}>
                        {application.status}
                      </span>
                    </td>
                    <td>
                      {application.reviewerName ? (
                        <span className="assigned-reviewer">
                          {application.reviewerName}
                        </span>
                      ) : (
                        <span className="no-reviewer">Not assigned</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {/* Only show assign reviewer for SUBMITTED status */}
                        {application.status === 'SUBMITTED' ? (
                          <div className="reviewer-assignment">
                            <select 
                              className="reviewer-select-small"
                              onChange={(e) => handleAssignReviewer(application.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Assign Reviewer</option>
                              {reviewers.map(reviewer => (
                                <option key={reviewer.id} value={reviewer.id}>
                                  {reviewer.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : application.status === 'IN_REVIEW' ? (
                          <select 
                            className="reviewer-select-small"
                            onChange={(e) => handleAssignReviewer(application.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Reassign Reviewer</option>
                            {reviewers.map(reviewer => (
                              <option key={reviewer.id} value={reviewer.id}>
                                {reviewer.name}
                              </option>
                            ))}
                          </select>
                        ) : application.status === 'APPROVED' ? (
                          <span className="status-action-badge approved">✓ Approved</span>
                        ) : application.status === 'REJECTED' ? (
                          <span className="status-action-badge rejected">✗ Rejected</span>
                        ) : null}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteApplication(application.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
          className="pagination-btn"
        >
          Previous
        </button>
        
        <span className="page-info">
          Page {pagination.page + 1} of {pagination.totalPages} 
          ({pagination.totalElements} total)
        </span>
        
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages - 1}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminApp;