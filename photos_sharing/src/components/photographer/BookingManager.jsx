// src/components/photographer/BookingManager.jsx

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../common/Spinner';
import './BookingManager.css'; // Import the new CSS file

export default function BookingManager({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clientEmail, setClientEmail] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('photographerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'bookings'), {
      photographerId: user.uid,
      clientEmail,
      eventType,
      eventDate,
      totalAmount: parseFloat(totalAmount),
      paidAmount: 0,
      createdAt: serverTimestamp(),
    });
    setClientEmail('');
    setEventType('');
    setEventDate('');
    setTotalAmount('');
  };

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Manage Bookings</h2>
      <div className="card booking-form-card">
        <h3>Add a New Booking</h3>
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Client Email</label>
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Enter client's email" required className="form-input" />
          </div>
          <div className="form-group">
            <label>Event Type</label>
            <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="e.g., Wedding, Birthday" required className="form-input" />
          </div>
          <div className="form-group">
            <label>Event Date</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label>Total Amount ($)</label>
            <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g., 1500" required className="form-input" />
          </div>
          <button type="submit" className="btn btn-primary">Add Booking</button>
        </form>
      </div>

      <div className="bookings-list card">
        <h3>Current Bookings</h3>
        {bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="table bookings-table">
              <thead>
                <tr>
                  <th>Client Email</th>
                  <th>Event Type</th>
                  <th>Event Date</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(book => (
                  <tr key={book.id}>
                    <td>{book.clientEmail}</td>
                    <td>{book.eventType}</td>
                    <td>{book.eventDate}</td>
                    <td>${book.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>No bookings yet.</p>}
      </div>
    </div>
  );
}