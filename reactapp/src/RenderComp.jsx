import React, { useState, useEffect } from 'react';
import FoodTruckVendorApp from './dashboards/FoodTruckVendorApp';
import AdminApp from './dashboards/AdminApp';
import InspectorApp from './dashboards/InspectorApp';
import ReviewerApp from './dashboards/ReviewerApp';
import SuperAdminApp from './dashboards/SuperAdminApp';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import './App.css';

const RenderComp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userId'));
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userId && userName && userRole) {
      return {
        id: userId,
        name: userName,
        role: userRole,
        email: userEmail
      };
    }
    return null;
  });

  const handleLogin = (userData) => {
    // Assuming userData has structure: { id, name, role, email }
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    
    setUser({
      id: userData.id,
      name: userData.name,
      role: userData.role,
      email: userData.email
    });
    setIsAuthenticated(true);
  };

  const handleRegister = (userData) => {
    // Assuming userData has structure: { id, name, role, email }
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userEmail', userData.email);
    
    setUser({
      id: userData.id,
      name: userData.name,
      role: userData.role,
      email: userData.email
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setUser(null);
    setIsAuthenticated(false);
    setShowLogin(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update localStorage
    localStorage.setItem('userId', updatedUser.id);
    localStorage.setItem('userName', updatedUser.name);
    localStorage.setItem('userRole', updatedUser.role || user.role);
    localStorage.setItem('userEmail', updatedUser.email);
    
    // Update the user state
    setUser({
      id: updatedUser.id,
      name: updatedUser.name,
      role: updatedUser.role || user.role,
      email: updatedUser.email
    });
  };

  const switchToRegister = () => {
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  const renderRoleBasedApp = () => {
    if (!user || !user.role) {
      return <div>Error: User role not found</div>;
    }

    switch (user.role.toUpperCase()) {
      case 'VENDOR':
        return <FoodTruckVendorApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      case 'ADMIN':
        return <AdminApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      case 'INSPECTOR':
        return <InspectorApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      case 'REVIEWER':
        return <ReviewerApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      case 'SUPER_ADMIN':
        return <SuperAdminApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />;
      default:
        return (
          <div className="role-app">
            <h1>Unknown Role</h1>
            <p>Role "{user.role}" is not recognized.</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container-wrapper">
        {showLogin ? (
          <Login
            onLogin={handleLogin}
            switchToRegister={switchToRegister}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            switchToLogin={switchToLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {renderRoleBasedApp()}
    </div>
  );
};

export default RenderComp;