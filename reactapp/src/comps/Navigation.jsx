import React from 'react';
import { Truck, LogOut } from 'lucide-react';
import '../css/Navigation.css';

const Navigation = ({ activeSection, setActiveSection, onLogout, vendorId }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          {/* <Truck className="truck-icon" /> */}
          <span>FoodTruck Pro</span>
        </div>
        <div className="nav-links">
          {['home', 'brands', 'trucks', 'menu'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`nav-link ${activeSection === section ? 'active' : ''}`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
        {vendorId && (
          <div className="nav-user">
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={18} className="logout-icon" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
