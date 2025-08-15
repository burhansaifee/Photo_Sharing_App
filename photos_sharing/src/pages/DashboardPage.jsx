// src/pages/DashboardPage.jsx

import PhotographerDashboard from '../components/photographer/PhotographerDashboard';
import ClientDashboard from '../components/client/ClientDashboard';

export default function DashboardPage({ user, userData }) {
  // This page is protected, so we can assume user and userData exist.
  if (userData?.role === 'photographer') {
    return <PhotographerDashboard user={user} />;
  }
  
  return <ClientDashboard user={user} />;
}