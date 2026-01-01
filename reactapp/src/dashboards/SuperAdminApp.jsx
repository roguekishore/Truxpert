import React, { useState, useEffect } from 'react';
import SuperAdminNavigation from '../navigation/SuperAdminNavigation';
import '../css/SuperAdminApp.css';

const SuperAdminApp = ({ user, onLogout, onProfileUpdate }) => {
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
        return <SuperAdminDashboard />;
      case 'users':
        return <UserManagement />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div>
      <SuperAdminNavigation
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

// Dashboard component with API integration
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalInspectors: 0,
    totalReviewers: 0,
    totalVendors: 0,
    totalApplications: 0,
    submittedApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalFoodTrucks: 0,
    totalInspections: 0,
    passedInspections: 0,
    failedInspections: 0,
    pendingInspections: 0,
    totalReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    pendingReviews: 0,
    applicationApprovalRate: 0,
    inspectionPassRate: 0,
    reviewApprovalRate: 0,
    activeSessions: 0,
    systemHealth: 0,
    securityAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/superadmin/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Super Admin Dashboard</h1>
      
      {/* User Statistics */}
      <div className="analytics-section">
        <h2>User Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Admins</h3>
            <p className="stat-number">{stats.totalAdmins}</p>
          </div>
          <div className="stat-card">
            <h3>Inspectors</h3>
            <p className="stat-number">{stats.totalInspectors}</p>
          </div>
          <div className="stat-card">
            <h3>Reviewers</h3>
            <p className="stat-number">{stats.totalReviewers}</p>
          </div>
          <div className="stat-card">
            <h3>Vendors</h3>
            <p className="stat-number">{stats.totalVendors}</p>
          </div>
        </div>
      </div>

      {/* Application Statistics */}
      <div className="analytics-section">
        <h2>Application Analytics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Applications</h3>
            <p className="stat-number">{stats.totalApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Submitted</h3>
            <p className="stat-number">{stats.submittedApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number success">{stats.approvedApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p className="stat-number critical">{stats.rejectedApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Approval Rate</h3>
            <p className="stat-number">{stats.applicationApprovalRate}%</p>
          </div>
        </div>
      </div>

      {/* Inspection Statistics */}
      <div className="analytics-section">
        <h2>Inspection Analytics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Inspections</h3>
            <p className="stat-number">{stats.totalInspections}</p>
          </div>
          <div className="stat-card">
            <h3>Passed</h3>
            <p className="stat-number success">{stats.passedInspections}</p>
          </div>
          <div className="stat-card">
            <h3>Failed</h3>
            <p className="stat-number critical">{stats.failedInspections}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number warning">{stats.pendingInspections}</p>
          </div>
          <div className="stat-card">
            <h3>Pass Rate</h3>
            <p className="stat-number">{stats.inspectionPassRate}%</p>
          </div>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="analytics-section">
        <h2>Review Analytics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Reviews</h3>
            <p className="stat-number">{stats.totalReviews}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p className="stat-number success">{stats.approvedReviews}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p className="stat-number critical">{stats.rejectedReviews}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number warning">{stats.pendingReviews}</p>
          </div>
          <div className="stat-card">
            <h3>Approval Rate</h3>
            <p className="stat-number">{stats.reviewApprovalRate}%</p>
          </div>
        </div>
      </div>

      {/* Food Truck & System Overview */}
      <div className="analytics-section">
        <h2>System Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Food Trucks</h3>
            <p className="stat-number">{stats.totalFoodTrucks}</p>
          </div>
          <div className="stat-card">
            <h3>Active Sessions</h3>
            <p className="stat-number">{stats.activeSessions}</p>
          </div>
          <div className="stat-card">
            <h3>System Health</h3>
            <p className="stat-number">{stats.systemHealth}%</p>
          </div>
          <div className="stat-card">
            <h3>Security Alerts</h3>
            <p className="stat-number critical">{stats.securityAlerts}</p>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="system-overview">
        <h2>Quick Insights</h2>
        <div className="overview-grid">
          <div className="overview-item">
            <h3>Application Workflow</h3>
            <div className="insight-metric">
              <span>Applications in Pipeline:</span>
              <span className="metric-value">{stats.submittedApplications}</span>
            </div>
            <div className="insight-metric">
              <span>Success Rate:</span>
              <span className="metric-value">{stats.applicationApprovalRate}%</span>
            </div>
            <div className="insight-metric">
              <span>Total Processed:</span>
              <span className="metric-value">{stats.approvedApplications + stats.rejectedApplications}</span>
            </div>
          </div>
          <div className="overview-item">
            <h3>Inspection Overview</h3>
            <div className="insight-metric">
              <span>Inspection Backlog:</span>
              <span className="metric-value">{stats.pendingInspections}</span>
            </div>
            <div className="insight-metric">
              <span>Quality Pass Rate:</span>
              <span className="metric-value">{stats.inspectionPassRate}%</span>
            </div>
            <div className="insight-metric">
              <span>Total Completed:</span>
              <span className="metric-value">{stats.passedInspections + stats.failedInspections}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Management component with API integration
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const BASE_URL = process.env.REACT_APP_URL;

  // Demo emails that should be protected from editing/deletion (all seeded accounts)
  const DEMO_EMAILS = [
    // System Users
    'superadmin@gmail.com',
    'admin1@gmail.com',
    'admin2@gmail.com',
    'inspector1@gmail.com',
    'inspector2@gmail.com',
    'inspector3@gmail.com',
    'reviewer1@gmail.com',
    'reviewer2@gmail.com',
    'reviewer3@gmail.com',
    // Vendors
    'vendor@gmail.com',
    'maria.kitchen@gmail.com',
    'chen.flavors@gmail.com',
    'rodriguez.foods@gmail.com',
    'gourmet.group@gmail.com',
    'street.eats@gmail.com',
    'urban.bites@gmail.com'
  ];

  const isDemoAccount = (email) => {
    return DEMO_EMAILS.includes(email?.toLowerCase());
  };

  useEffect(() => {
    fetchUsersAndVendors();
  }, []);

  const fetchUsersAndVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/superadmin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching users and vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, isVendor = false, email) => {
    // Check if this is a demo account
    if (isDemoAccount(email)) {
      alert('This is a protected demo account and cannot be deleted.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const endpoint = isVendor ? 
          `${BASE_URL}/api/superadmin/vendors/${userId}` : 
          `${BASE_URL}/api/superadmin/users/${userId}`;
        
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (response.ok) {
          fetchUsersAndVendors(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/superadmin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'toggle' })
      });
      if (response.ok) {
        fetchUsersAndVendors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUserData) => {
    try {
      const endpoint = editingUser.userType === 'vendor' ? 
        `${BASE_URL}/api/superadmin/vendors/${editingUser.id}` : 
        `${BASE_URL}/api/superadmin/users/${editingUser.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData)
      });
      
      if (response.ok) {
        fetchUsersAndVendors(); // Refresh the list
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  // Filter users and vendors based on search and role
  const filteredData = () => {
    let allData = [];
    
    // Add users with userType flag
    if (roleFilter === 'all' || roleFilter !== 'VENDOR') {
      allData = allData.concat(
        users
          .filter(user => roleFilter === 'all' || user.role === roleFilter)
          .filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(user => ({ ...user, userType: 'user' }))
      );
    }
    
    // Add vendors with userType flag
    if (roleFilter === 'all' || roleFilter === 'VENDOR') {
      allData = allData.concat(
        vendors
          .filter(vendor => 
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(vendor => ({ ...vendor, userType: 'vendor', role: 'VENDOR' }))
      );
    }
    
    return allData;
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <div className="user-controls">
        <button 
          className="add-user-btn"
          onClick={() => setShowAddUserModal(true)}
        >
          Add New User
        </button>
        <div className="user-filters">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="user-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="VENDOR">Vendors</option>
            <option value="ADMIN">Admins</option>
            <option value="INSPECTOR">Inspectors</option>
            <option value="REVIEWER">Reviewers</option>
          </select>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="users-table desktop-view">
        <div className="table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>
        {filteredData().map((item) => (
          <div key={`${item.userType}-${item.id}`} className="table-row">
            <span className="user-name">{item.name}</span>
            <span className="user-email">{item.email}</span>
            <span>
              <span className={`role-badge ${item.role.toLowerCase()}`}>
                {item.role}
              </span>
            </span>
            <div className="action-buttons">
              <button 
                className={`btn-edit ${isDemoAccount(item.email) ? 'disabled' : ''}`}
                onClick={() => handleEditUser(item)}
                disabled={isDemoAccount(item.email)}
                title={isDemoAccount(item.email) ? 'Demo account' : 'Edit user'}
              >
                {isDemoAccount(item.email) ? 'Protected' : 'Edit'}
              </button>
              <button 
                className={`btn-delete ${isDemoAccount(item.email) ? 'disabled' : ''}`}
                onClick={() => handleDeleteUser(item.id, item.userType === 'vendor', item.email)}
                disabled={isDemoAccount(item.email)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredData().length === 0 && (
          <div className="no-data">No users found matching the criteria.</div>
        )}
      </div>
      
      {/* Mobile Card View */}
      <div className="users-cards mobile-view">
        {filteredData().map((item) => (
          <div key={`mobile-${item.userType}-${item.id}`} className="user-card">
            <div className="user-card-header">
              <span className="user-card-name">{item.name}</span>
              <span className={`role-badge ${item.role.toLowerCase()}`}>
                {item.role}
              </span>
            </div>
            <div className="user-card-email">{item.email}</div>
            <div className="user-card-actions">
              <button 
                className={`btn-edit ${isDemoAccount(item.email) ? 'disabled' : ''}`}
                onClick={() => handleEditUser(item)}
                disabled={isDemoAccount(item.email)}
              >
                {isDemoAccount(item.email) ? 'Protected' : 'Edit'}
              </button>
              <button 
                className={`btn-delete ${isDemoAccount(item.email) ? 'disabled' : ''}`}
                onClick={() => handleDeleteUser(item.id, item.userType === 'vendor', item.email)}
                disabled={isDemoAccount(item.email)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredData().length === 0 && (
          <div className="no-data">No users found matching the criteria.</div>
        )}
      </div>
      
      {showAddUserModal && (
        <AddUserModal 
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={fetchUsersAndVendors}
        />
      )}
      
      {showEditModal && editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onUserUpdated={handleUpdateUser}
        />
      )}
    </div>
  );
};

// Simple Add User Modal
const AddUserModal = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
  });
  const BASE_URL = process.env.REACT_APP_URL;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/superadmin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onUserAdded();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="INSPECTOR">Inspector</option>
              <option value="REVIEWER">Reviewer</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit">Create User</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal
const EditUserModal = ({ user, onClose, onUserUpdated }) => {
  // Demo emails that should be protected
  const DEMO_EMAILS = [
    'vendor@gmail.com',
    'admin1@gmail.com',
    'admin2@gmail.com',
    'superadmin@gmail.com',
    'inspector1@gmail.com',
    'inspector2@gmail.com',
    'reviewer1@gmail.com',
    'reviewer2@gmail.com'
  ];

  const isDemoAccount = DEMO_EMAILS.includes(user?.email?.toLowerCase());

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'ADMIN',
    // For vendors, we might have additional fields
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || ''
  });

  const handleInputChange = (field, value) => {
    // Prevent any changes for demo accounts
    if (isDemoAccount) return;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission for demo accounts
    if (isDemoAccount) {
      alert('Demo accounts cannot be modified.');
      return;
    }
    
    // Prepare data based on user type
    let updateData = {
      name: formData.name,
      email: formData.email
    };

    if (user.userType === 'vendor') {
      // For vendors, include additional fields but not role
      updateData.phoneNumber = formData.phoneNumber;
      updateData.address = formData.address;
    } else {
      // For regular users, include role
      updateData.role = formData.role;
    }

    onUserUpdated(updateData);
  };

  // If demo account, show read-only view
  if (isDemoAccount) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>View {user.userType === 'vendor' ? 'Vendor' : 'User'}</h2>
          <div style={{ 
            background: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '6px', 
            padding: '0.75rem', 
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            🔒 This is a protected demo account. Editing is disabled.
          </div>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" value={formData.name} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={formData.email} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <input type="text" value={formData.role} disabled style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit {user.userType === 'vendor' ? 'Vendor' : 'User'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          {user.userType === 'vendor' ? (
            // Vendor-specific fields
            <>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </>
          ) : (
            // Regular user role field
            <div className="form-group">
              <label>Role:</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="ADMIN">Admin</option>
                <option value="INSPECTOR">Inspector</option>
                <option value="REVIEWER">Reviewer</option>
              </select>
            </div>
          )}
          
          <div className="modal-actions">
            <button type="submit">Update {user.userType === 'vendor' ? 'Vendor' : 'User'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminApp;