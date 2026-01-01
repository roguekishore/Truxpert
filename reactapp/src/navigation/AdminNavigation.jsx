import React, { useState } from 'react';
import { Shield, Users, MapPin, FileText, LogOut, Search, User, Menu, X } from 'lucide-react';
import EditProfile from '../components/EditProfile';
import '../css/Navigation.css';

const AdminNavigation = ({ activeSection, setActiveSection, onLogout, onProfileUpdate, user }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileUpdate = (updatedUser) => {
    setShowEditProfile(false);
    
    // Call the onProfileUpdate callback to update the parent state
    if (onProfileUpdate) {
      onProfileUpdate(updatedUser);
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="truck-icon" />
            <span>Admin</span>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {[
              { key: 'dashboard', label: 'Dashboard', icon: FileText },
              { key: 'reviewers', label: 'Assign Reviewers', icon: Users },
              { key: 'inspectors', label: 'Assign Inspectors', icon: Search },
              { key: 'regions', label: 'Regional View', icon: MapPin },
              { key: 'applications', label: 'Applications', icon: FileText }
            ].map((section) => (
              <button
                key={section.key}
                onClick={() => handleNavClick(section.key)}
                className={`nav-link ${activeSection === section.key ? 'active' : ''}`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </div>
          {user && (
            <div className="nav-user">
              <button 
                onClick={() => setShowEditProfile(true)} 
                className="profile-btn"
                title="Edit Profile"
              >
                <User size={18} className="profile-icon" />
              </button>
              <button 
                onClick={onLogout} 
                className="logout-btn"
                title="Logout"
              >
                <LogOut size={18} className="logout-icon" />
              </button>
            </div>
          )}
        </div>
      </nav>
      
      {showEditProfile && (
        <EditProfile
          user={user}
          userType="user"
          onSave={handleProfileUpdate}
          onCancel={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
};

export default AdminNavigation;