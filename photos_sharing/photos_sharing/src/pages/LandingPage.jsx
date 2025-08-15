// src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage({ user }) { // Receive the user prop
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to PhotoShare</h1>
        <p>The best place for photographers and clients to connect and share beautiful moments.</p>
        
        {/* --- NEW: Conditional Rendering --- */}
        {/* Only show the "Get Started" button if the user is NOT logged in */}
        {!user && (
          <Link to="/login" className="btn btn-accent">Get Started</Link>
        )}
      </div>
      
      <div className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Easy Uploads</h3>
            <p>Effortlessly upload and organize your photos into beautiful, private albums.</p>
          </div>
          <div className="feature-card">
            <h3>Secure Sharing</h3>
            <p>Share albums with specific clients using unique IDs, ensuring privacy and security.</p>
          </div>
          <div className="feature-card">
            <h3>Client Collaboration</h3>
            <p>Allow clients to view, download, and even share albums with their family and friends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}