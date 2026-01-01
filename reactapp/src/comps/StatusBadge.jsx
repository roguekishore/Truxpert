import React from 'react';
import '../css/StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'IN_REVIEW':
      case 'UNDER_REVIEW':
        return 'warning';
      case 'SUBMITTED':
        return 'info';
      case 'PENDING_DOCUMENTS':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'IN_REVIEW':
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'SUBMITTED':
        return 'Submitted';
      case 'PENDING_DOCUMENTS':
        return 'Pending Documents';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`status-badge status-${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;