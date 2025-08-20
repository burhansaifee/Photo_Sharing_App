// src/components/client/ClientPayments.jsx

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Spinner from '../common/Spinner';
import './ClientPayments.css'; // Import the new CSS file

export default function ClientPayments({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('clientEmail', '==', user.email));
    const unsub = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user.email]);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">My booking and Payments</h2>
      <div className="card">
        {bookings.length > 0 ? (
          <div className="table-responsive">
            {/* Add the new CSS class to the table */}
            <table className="table payments-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Event Date</th>
                  <th>Total ($)</th>
                  <th>Paid ($)</th>
                  <th>Due ($)</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(book => {
                  const due = (book.totalAmount || 0) - (book.paidAmount || 0);
                  return (
                    <tr key={book.id}>
                      <td>{book.eventType}</td>
                      <td>{book.eventDate}</td>
                      <td>${book.totalAmount?.toFixed(2)}</td>
                      <td>${book.paidAmount?.toFixed(2)}</td>
                      <td>
                        {/* Use a styled span for the due amount */}
                        <span className={`amount-due ${due > 0 ? 'due-positive' : 'due-zero'}`}>
                          ${due.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>You have no bookings yet.</h3>
            <p>Once your photographer creates a booking for you, it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}