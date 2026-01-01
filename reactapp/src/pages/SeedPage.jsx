import React, { useState } from 'react';
import axios from 'axios';
import './SeedPage.css';

const BASE_URL = process.env.REACT_APP_URL;

const SeedPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleSeedClick = (force = false) => {
    setPendingAction(force ? 'force' : 'run');
    setShowPasswordPrompt(true);
    setPassword('');
    setResult(null);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setResult({
        success: false,
        message: 'Please enter the seed password'
      });
      return;
    }

    setLoading(true);
    setShowPasswordPrompt(false);
    setResult(null);
    
    try {
      const endpoint = pendingAction === 'force' ? '/api/seed/force' : '/api/seed/run';
      const response = await axios.post(`${BASE_URL}${endpoint}`, { password });
      setResult({
        success: response.data.success,
        message: response.data.message
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setResult({
          success: false,
          message: 'Invalid password. Access denied.'
        });
      } else {
        setResult({
          success: false,
          message: error.response?.data?.message || error.message || 'Failed to connect to server'
        });
      }
    } finally {
      setLoading(false);
      setPassword('');
      setPendingAction(null);
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordPrompt(false);
    setPassword('');
    setPendingAction(null);
  };

  return (
    <div className="seed-page">
      {/* Password Modal */}
      {showPasswordPrompt && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>🔐 Enter Seed Password</h3>
            <p>This action requires administrator authorization.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="password-modal-actions">
              <button className="cancel-btn" onClick={handleCancelPassword}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handlePasswordSubmit} disabled={loading}>
                {loading ? '⏳ Processing...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="seed-container">
        <h1>🌱 Database Seeder</h1>
        <p className="warning">⚠️ This page is for admin use only. Use with caution!</p>
        
        <div className="seed-actions">
          <div className="seed-card">
            <h3>Seed Data</h3>
            <p>Seeds comprehensive demo data including vendors, brands, food trucks, applications with various statuses, reviews, inspections, and menu items.</p>
            <p className="hint">Safe to use - won't create duplicates if already seeded this session.</p>
            <button 
              className="seed-btn primary"
              onClick={() => handleSeedClick(false)}
              disabled={loading || showPasswordPrompt}
            >
              {loading ? '⏳ Seeding...' : '🚀 Run Seeder'}
            </button>
          </div>
          
          <div className="seed-card danger">
            <h3>Force Seed Data</h3>
            <p>Forces re-seeding even if already run.</p>
            <p className="hint warning-text">⚠️ May create duplicate data! Use only on empty DB.</p>
            <button 
              className="seed-btn danger"
              onClick={() => handleSeedClick(true)}
              disabled={loading || showPasswordPrompt}
            >
              {loading ? '⏳ Seeding...' : '⚡ Force Seed'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className={`result-box ${result.success ? 'success' : 'error'}`}>
            <h4>{result.success ? '✅ Success' : '❌ Error'}</h4>
            <p>{result.message}</p>
          </div>
        )}

        <div className="seed-info">
          <h4>📊 What Gets Seeded:</h4>
          <ul className="seed-list">
            <li>🏪 <strong>7 Vendors</strong> - Multiple food business owners</li>
            <li>🏷️ <strong>21 Brands</strong> - Various food truck brands per vendor</li>
            <li>🚚 <strong>50+ Food Trucks</strong> - Multiple trucks per brand with applications</li>
            <li>📋 <strong>Applications:</strong>
              <ul>
                <li>~30% Approved (with completed reviews)</li>
                <li>~10% Rejected (with completed reviews)</li>
                <li>~15% In Review (reviewer assigned, pending decision)</li>
                <li>~45% Submitted (no reviewer - for demo testing)</li>
              </ul>
            </li>
            <li>🔍 <strong>Inspections</strong> (for approved trucks):
              <ul>
                <li>~30% Passed</li>
                <li>~15% Failed</li>
                <li>~15% In Progress</li>
                <li>~40% No inspector assigned (for demo testing)</li>
              </ul>
            </li>
            <li>🍔 <strong>Menu Items</strong> - For trucks that passed inspection</li>
          </ul>
        </div>
        
        <div className="seed-info">
          <h4>👤 Demo Accounts Created:</h4>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Email</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              <tr className="section-header"><td colSpan="3">Vendors (Login via Vendor Portal)</td></tr>
              <tr><td>Vendor</td><td>vendor@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>maria.kitchen@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>chen.flavors@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>rodriguez.foods@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>gourmet.group@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>street.eats@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Vendor</td><td>urban.bites@gmail.com</td><td>Demo@12345</td></tr>
              
              <tr className="section-header"><td colSpan="3">System Users (Login via Admin Portal)</td></tr>
              <tr><td>Super Admin</td><td>superadmin@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Admin</td><td>admin1@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Admin</td><td>admin2@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Inspector</td><td>inspector1@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Inspector</td><td>inspector2@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Inspector</td><td>inspector3@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Reviewer</td><td>reviewer1@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Reviewer</td><td>reviewer2@gmail.com</td><td>Demo@12345</td></tr>
              <tr><td>Reviewer</td><td>reviewer3@gmail.com</td><td>Demo@12345</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeedPage;
