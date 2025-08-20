// src/components/client/ClientDashboard.jsx

import { useState } from 'react';
import ClientAlbumList from './ClientAlbumList';
import ClientPayments from './ClientPayments'; // Make sure you've created this file
import './ClientDashboard.css';

export default function ClientDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('albums');

  return (
    <div className="dashboard-container">
      <div className="info-box">
        <p>Your User ID (for sharing albums):</p>
        <strong>{user.uid}</strong>
      </div>

      {/* Navigation buttons for the tabs */}
      <div className="dashboard-nav">
        <button
          onClick={() => setActiveTab('albums')}
          className={activeTab === 'albums' ? 'active' : ''}
        >
          My Albums
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={activeTab === 'payments' ? 'active' : ''}
        >
          My Payments
        </button>
      </div>

      {/* Conditionally render the component based on the active tab */}
      {activeTab === 'albums' && <ClientAlbumList user={user} />}
      {activeTab === 'payments' && <ClientPayments user={user} />}
    </div>
  );
}