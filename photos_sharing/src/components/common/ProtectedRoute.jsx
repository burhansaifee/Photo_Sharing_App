import React from 'react';
import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

export default function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner />
      </div>
    );
  }

  // If the user is not logged in, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, show the page content
  return children;
}