// src/pages/DashboardPage.jsx

import { useState } from 'react';
import PhotographerDashboard from '../components/photographer/PhotographerDashboard';
import ClientDashboard from '../components/client/ClientDashboard';
import PhotographerQuotations from '../components/photographer/PhotographerQuotations';
import ClientQuotations from '../components/client/ClientQuotations';
import ServiceManager from '../components/photographer/ServiceManager'; 
import EventCalendar from '../components/photographer/EventCalendar';
import BookingManager from '../components/photographer/BookingManager'; 
import PaymentManager from '../components/photographer/PaymentManager'; 
import Spinner from '../components/common/Spinner';

export default function DashboardPage({ user, userData }) {
  const [activeTab, setActiveTab] = useState('albums');

  if (!userData) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    );
  }

  const isPhotographer = userData.role === 'photographer';

  return (
    <div>
      <div className="dashboard-nav">
        <button onClick={() => setActiveTab('albums')} className={activeTab === 'albums' ? 'active' : ''}>Albums</button>
        {isPhotographer && (
          <>
            <button onClick={() => setActiveTab('schedule')} className={activeTab === 'schedule' ? 'active' : ''}>Schedule</button>
            <button onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>Bookings</button>
            <button onClick={() => setActiveTab('payments')} className={activeTab === 'payments' ? 'active' : ''}>Payments</button>
            <button onClick={() => setActiveTab('quotations')} className={activeTab === 'quotations' ? 'active' : ''}>Quotations</button>
            <button onClick={() => setActiveTab('services')} className={activeTab === 'services' ? 'active' : ''}>Services</button>
          </>
        )}
         {!isPhotographer && (
             <button onClick={() => setActiveTab('quotations')} className={activeTab === 'quotations' ? 'active' : ''}>Quotations</button>
         )}
      </div>

      {activeTab === 'albums' && (isPhotographer ? <PhotographerDashboard user={user} /> : <ClientDashboard user={user} />)}
      {activeTab === 'quotations' && (isPhotographer ? <PhotographerQuotations user={user} /> : <ClientQuotations user={user} />)}
      
      {/* Add routes for new photographer tabs */}
      {isPhotographer && activeTab === 'schedule' && <EventCalendar user={user} />}
      {isPhotographer && activeTab === 'bookings' && <BookingManager user={user} />}
      {isPhotographer && activeTab === 'payments' && <PaymentManager user={user} />}
      {isPhotographer && activeTab === 'services' && <ServiceManager user={user} />}
    </div>
  );
}