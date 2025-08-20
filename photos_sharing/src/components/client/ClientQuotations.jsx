// src/components/client/ClientQuotations.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import './ClientDashboard.css';

export default function ClientQuotations({ user }) {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'quotations'), where('clientEmail', '==', user.email));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuotations(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const handleResponse = async (id, response) => {
    const quoteRef = doc(db, 'quotations', id);
    await updateDoc(quoteRef, { status: response });
  };

  if (loading) return <div className="spinner-container"><Spinner /></div>;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Quotations Received</h2>
      <div className="quotations-list">
        {quotations.length === 0 ? (
          <div className="empty-state">
            <h3>No quotations have been sent to you yet.</h3>
          </div>
        ) : (
          <div className="album-grid">
  {quotations.map((quote) => (
    <div key={quote.id} className="card album-card">
      <div className="album-card-body">
        <h3>{quote.title}</h3>
        
        <ul className="quotation-items-list-condensed">
          {quote.items?.map(item => (
            <li key={item.id || item.title}><span>{item.title}</span><span>${item.price}</span></li>
          ))}
        </ul>

        <p><strong>Total: ${quote.totalPrice?.toFixed(2)}</strong></p>
        {quote.notes && <p className="quotation-notes">Notes: {quote.notes}</p>}
        <p>Status: <span className={`status-badge status-${quote.status}`}>{quote.status}</span></p>
        
        <div className="album-actions">
          {quote.status === 'sent' && (
            <>
              <button onClick={() => handleResponse(quote.id, 'accepted')} className="btn btn-success">Accept</button>
              <button onClick={() => handleResponse(quote.id, 'declined')} className="btn btn-danger">Decline</button>
            </>
          )}
        </div>
      </div>
    </div>
  ))}
</div>
        )}
      </div>
    </div>
  );
}