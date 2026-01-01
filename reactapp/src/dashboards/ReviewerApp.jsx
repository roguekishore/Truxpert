import React, { useState, useEffect } from 'react';
import ReviewerNavigation from '../navigation/ReviewerNavigation';
import '../css/ReviewerApp.css';

const ReviewerApp = ({ user, onLogout, onProfileUpdate }) => {
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
        return <ReviewerDashboard user={user} />;
      case 'pending':
        return <PendingReviews user={user} />;
      case 'approved':
        return <ApprovedApplications user={user} />;
      case 'rejected':
        return <RejectedApplications user={user} />;

      default:
        return <ReviewerDashboard user={user} />;
    }
  };

  return (
    <div>
      <ReviewerNavigation
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

const ReviewerDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/reviews/reviewer/${user.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      console.log('Stats data:', data); // Debug log
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely format approval rate
  const formatApprovalRate = (rate) => {
    if (rate === null || rate === undefined || isNaN(rate)) {
      return '0.0';
    }
    return Number(rate).toFixed(1);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Reviewer Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Pending Reviews</h3>
          <p className="stat-number">{stats?.pendingReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p className="stat-number">{stats?.totalReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number">{stats?.approvedReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Approval Rate</h3>
          <p className="stat-number">{formatApprovalRate(stats?.approvalRate)}%</p>
        </div>
      </div>
    </div>
  );
};

const PendingReviews = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    sortBy: 'reviewDate',
    sortDirection: 'asc'
  });

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchPendingReviews();
  }, [pagination.page, filters]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      });

      const response = await fetch(`${BASE_URL}/api/reviews/reviewer/${user.id}/pending?${params}`);
      if (!response.ok) throw new Error('Failed to fetch pending reviews');
      
      const data = await response.json();
      setReviews(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reviewId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/api/reviews/${reviewId}/status/${status}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review status');
      }
      
      // Refresh the reviews list
      fetchPendingReviews();
      alert(`Review ${status.toLowerCase()} successfully!`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleApprove = (reviewId) => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      handleStatusUpdate(reviewId, 'APPROVED');
    }
  };

  const handleReject = (reviewId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      handleStatusUpdate(reviewId, 'REJECTED');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 }));
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
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
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

  if (loading && reviews.length === 0) return <div className="loading">Loading pending reviews...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assign-reviewers">
      <h1>Pending Document Reviews</h1>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="reviewDate">Review Date</option>
            <option value="id">Review ID</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Order:</label>
          <select
            value={filters.sortDirection}
            onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="applications-list">
        {reviews.length === 0 ? (
          <div className="no-applications">No pending reviews found</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="application-item">
              <div className="application-header">
                <h3>Review #{review.id} - Application #{review.application?.id}</h3>
                <span className={`status-badge ${review.reviewStatus?.toLowerCase()}`}>
                  {review.reviewStatus}
                </span>
              </div>
              
              <div className="application-details">
                <p><strong>Brand Name:</strong> {review.application?.foodTruck?.brandName || 'N/A'}</p>
                {/* <p><strong>Food Truck:</strong> {review.application?.foodTruck?.name || 'N/A'}</p> */}
                <p><strong>Operating Region:</strong> {review.application?.foodTruck?.operatingRegion || 'N/A'}</p>
                <p><strong>Location:</strong> {review.application?.foodTruck?.location || 'N/A'}</p>
                <p><strong>Assigned Date:</strong> {formatDate(review.reviewDate)}</p>
                <p><strong>Application Status:</strong> {review.application?.status || 'N/A'}</p>
              </div>
              
              {review.reviewStatus === 'IN_PROGRESS' && (
                <div className="reviewer-assignment">
                  <div className="review-actions">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(review.id)}
                    >
                      Approve Application
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => handleReject(review.id)}
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
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
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ApprovedApplications = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchApprovedReviews();
  }, [pagination.page]);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: 'reviewDate',
        sortDirection: 'desc',
        status: 'APPROVED'
      });
//passing as approved
      const response = await fetch(`${BASE_URL}/api/reviews/reviewer/${user.id}/paginated?${params}`);
      if (!response.ok) throw new Error('Failed to fetch approved reviews');
      
      const data = await response.json();
      setReviews(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && reviews.length === 0) return <div className="loading">Loading approved applications...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assign-reviewers">
      <h1>Approved Applications</h1>

      <div className="applications-list">
        {reviews.length === 0 ? (
          <div className="no-applications">No approved applications found</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="application-item">
              <div className="application-header">
                <h3>Application #{review.application?.id} - {review.application?.foodTruck?.brandName}</h3>
                <span className="status-badge approved">APPROVED</span>
              </div>
              
              <div className="application-details">
                <p><strong>Food Truck:</strong> {review.application?.foodTruck?.brandName || 'N/A'}</p>
                <p><strong>Operating Region:</strong> {review.application?.foodTruck?.operatingRegion || 'N/A'}</p>
                <p><strong>Approved Date:</strong> {formatDate(review.reviewDate)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
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
        >
          Next
        </button>
      </div>
    </div>
  );
};

const RejectedApplications = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  const BASE_URL = process.env.REACT_APP_URL;

  useEffect(() => {
    fetchRejectedReviews();
  }, [pagination.page]);

  const fetchRejectedReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sortBy: 'reviewDate',
        sortDirection: 'desc',
        status: 'REJECTED'
      });
//fetch rejected reviews
      const response = await fetch(`${BASE_URL}/api/reviews/reviewer/${user.id}/paginated?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rejected reviews');
      
      const data = await response.json();
      setReviews(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && reviews.length === 0) return <div className="loading">Loading rejected applications...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="assign-reviewers">
      <h1>Rejected Applications</h1>

      <div className="applications-list">
        {reviews.length === 0 ? (
          <div className="no-applications">No rejected applications found</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="application-item">
              <div className="application-header">
                <h3>Application #{review.application?.id} - {review.application?.foodTruck?.brandName}</h3>
                <span className="status-badge rejected">REJECTED</span>
              </div>
              
              <div className="application-details">
                <p><strong>Food Truck:</strong> {review.application?.foodTruck?.brandName || 'N/A'}</p>
                <p><strong>Operating Region:</strong> {review.application?.foodTruck?.operatingRegion || 'N/A'}</p>
                <p><strong>Rejected Date:</strong> {formatDate(review.reviewDate)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
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
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReviewerApp;