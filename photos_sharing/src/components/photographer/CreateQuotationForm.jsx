// src/components/photographer/CreateQuotationForm.jsx

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';

export default function CreateQuotationForm({ photographerId }) {
  // Form state
  const [clientEmail, setClientEmail] = useState('');
  const [quotationTitle, setQuotationTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  // Services state
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [quotationItems, setQuotationItems] = useState([]);

  // UI state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch photographer's services
  useEffect(() => {
    const q = query(collection(db, 'services'), where('photographerId', '==', photographerId));
    const unsub = onSnapshot(q, (snapshot) => {
      setAvailableServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [photographerId]);

  const total = useMemo(() => {
    return quotationItems.reduce((sum, item) => sum + item.price, 0);
  }, [quotationItems]);

  const handleAddService = () => {
    if (!selectedServiceId) return;
    const serviceToAdd = availableServices.find(s => s.id === selectedServiceId);
    if (serviceToAdd && !quotationItems.find(item => item.id === serviceToAdd.id)) {
      setQuotationItems([...quotationItems, serviceToAdd]);
    }
  };

  const handleRemoveItem = (itemId) => {
    setQuotationItems(quotationItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!clientEmail || !quotationTitle || quotationItems.length === 0) {
      setError('Client Email, Title, and at least one service are required.');
      return;
    }

    try {
      await addDoc(collection(db, 'quotations'), {
        photographerId,
        clientEmail,
        title: quotationTitle,
        notes,
        items: quotationItems, // Save the array of items
        totalPrice: total,
        status: 'sent',
        createdAt: serverTimestamp(),
      });
      setSuccess('Quotation sent successfully!');
      // Reset form
      setClientEmail('');
      setQuotationTitle('');
      setNotes('');
      setQuotationItems([]);
      setSelectedServiceId('');
    } catch (err) {
      setError('Failed to send quotation.');
      console.error(err);
    }
  };

  return (
    <div className="create-quotation-form card">
      <h3>Create New Quotation</h3>
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Client Email</label>
          <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required className="form-input" />
        </div>
        <div className="form-group">
          <label>Quotation Title</label>
          <input type="text" value={quotationTitle} onChange={(e) => setQuotationTitle(e.target.value)} placeholder="e.g., Johnson Wedding Quotation" required className="form-input" />
        </div>
        
        <div className="form-group full-width">
          <label>Add Services to Quotation</label>
          <div className="add-service-controls">
            <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="form-input">
              <option value="">-- Select a service --</option>
              {availableServices.map(s => <option key={s.id} value={s.id}>{s.title} - ${s.price}</option>)}
            </select>
            <button type="button" onClick={handleAddService} className="btn btn-secondary">Add Service</button>
          </div>
        </div>

        <div className="full-width">
          <h4>Quotation Items</h4>
          {quotationItems.length === 0 ? <p>No services added yet.</p> : (
            <ul className="quotation-items-list">
              {quotationItems.map(item => (
                <li key={item.id}>
                  <span>{item.title}</span>
                  <span>${item.price}</span>
                  <button type="button" onClick={() => handleRemoveItem(item.id)}>&times;</button>
                </li>
              ))}
            </ul>
          )}
          <h4 className="quotation-total">Total: ${total.toFixed(2)}</h4>
        </div>

        <div className="form-group full-width">
            <label>Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-input" />
        </div>

        <div className="full-width">
            <button type="submit" className="btn btn-primary">Send Quotation</button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
      </form>
    </div>
  );
}