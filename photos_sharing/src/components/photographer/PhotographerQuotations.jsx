// src/components/photographer/PhotographerQuotations.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import deleteDoc
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import CreateQuotationForm from './CreateQuotationForm';
import { generateQuotationPDF } from '../../utils/pdfGenerator';
import './PhotographerQuotations.css';

export default function PhotographerQuotations({ user }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photographerData, setPhotographerData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (doc) => {
      setPhotographerData(doc.data());
    });
    
    const q = query(collection(db, 'quotations'), where('photographerId', '==', user.uid));
    const unsubQuotations = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotations(list);
      setLoading(false);
    });

    return () => {
        unsubUser();
        unsubQuotations();
    };
  }, [user]);

  const handleStatusChange = async (id, newStatus) => {
    const quoteRef = doc(db, 'quotations', id);
    await updateDoc(quoteRef, { status: newStatus });
  };
  
  // NEW: Function to handle deleting a quotation
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the quotation "${title}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'quotations', id));
        alert('Quotation deleted successfully.');
      } catch (error) {
        console.error("Error deleting quotation: ", error);
        alert('Failed to delete quotation.');
      }
    }
  };

  const handleDownloadPDF = (quotation) => {
      if (!photographerData) {
          alert("Photographer details not loaded yet. Please wait a moment and try again.");
          return;
      }
      generateQuotationPDF(quotation, photographerData);
  };

  if (loading) return <div className="spinner-container"><Spinner /></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="page-title">My Quotations</h2>
      </div>
      <CreateQuotationForm photographerId={user.uid} />
      <div className="quotations-list card">
        <h3>Sent Quotations</h3>
        {quotations.length === 0 ? (
          <p>No quotations sent yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table quotations-table">
              <thead>
                <tr>
                  <th>Client Email</th>
                  <th>Title</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map(quote => (
                  <tr key={quote.id}>
                    <td>{quote.clientEmail}</td>
                    <td>{quote.title}</td>
                    <td>${quote.totalPrice?.toFixed(2)}</td>
                    <td><span className={`status-badge status-${quote.status}`}>{quote.status}</span></td>
                    <td className="action-buttons">
                      <button onClick={() => handleDownloadPDF(quote)} className="btn btn-secondary btn-sm">Download</button>
                      {quote.status === 'sent' && (
                        <button onClick={() => handleStatusChange(quote.id, 'withdrawn')} className="btn btn-warning btn-sm">Withdraw</button>
                      )}
                      {/* NEW: Delete button */}
                      <button onClick={() => handleDelete(quote.id, quote.title)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}