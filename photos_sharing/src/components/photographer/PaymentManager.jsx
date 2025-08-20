// src/components/photographer/PaymentManager.jsx

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import Spinner from '../common/Spinner';
import './PaymentManager.css';

const BookingPaymentRow = ({ booking }) => {
  const [paidAmount, setPaidAmount] = useState(booking.paidAmount);

  const handleUpdatePayment = async () => {
    const bookingRef = doc(db, 'bookings', booking.id);
    await updateDoc(bookingRef, {
      paidAmount: parseFloat(paidAmount) || 0
    });
    alert('Payment updated!');
  };

  // NEW: Function to handle deleting the booking
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the booking for ${booking.clientEmail}? This will permanently remove the record.`)) {
      try {
        await deleteDoc(doc(db, 'bookings', booking.id));
        alert('Booking record deleted successfully.');
      } catch (error) {
        console.error("Error deleting booking: ", error);
        alert('Failed to delete booking record.');
      }
    }
  };

  const amountDue = booking.totalAmount - paidAmount;

  return (
    <tr>
      <td>{booking.clientEmail}</td>
      <td>{booking.eventDate}</td>
      <td>${booking.totalAmount.toFixed(2)}</td>
      <td>
        <div className="payment-update-cell">
          <input 
            type="number" 
            value={paidAmount} 
            onChange={(e) => setPaidAmount(e.target.value)} 
            className="form-input payment-input"
          />
          <button onClick={handleUpdatePayment} className="btn btn-primary btn-sm">Update</button>
        </div>
      </td>
      <td>
        <span className={`amount-due ${amountDue > 0 ? 'due-positive' : 'due-zero'}`}>
          ${amountDue.toFixed(2)}
        </span>
      </td>
      {/* New column for actions */}
      <td className="action-buttons">
        {/* The Delete button will only appear when the booking is fully paid */}
        {amountDue <= 0 && (
          <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
        )}
      </td>
    </tr>
  );
};


export default function PaymentManager({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('photographerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsData);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Manage Payments</h2>
      <div className="card">
        {bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="table payments-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total ($)</th>
                  <th>Paid ($)</th>
                  <th>Due ($)</th>
                  <th>Actions</th> {/* New column header */}
                </tr>
              </thead>
              <tbody>
                {bookings.map(book => <BookingPaymentRow key={book.id} booking={book} />)}
              </tbody>
            </table>
          </div>
        ) : <p>You have no bookings to manage payments for.</p>}
      </div>
    </div>
  );
}