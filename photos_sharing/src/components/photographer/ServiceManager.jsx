// src/components/photographer/ServiceManager.jsx

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Spinner from '../common/Spinner';

export default function ServiceManager({ user }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(null); // Will hold the ID of the service being edited

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  // Fetch services
  useEffect(() => {
    const q = query(collection(db, 'services'), where('photographerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setIsEditing(null);
  };

  const handleEditClick = (service) => {
    setIsEditing(service.id);
    setTitle(service.title);
    setDescription(service.description);
    setPrice(service.price);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      await deleteDoc(doc(db, 'services', id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serviceData = {
      photographerId: user.uid,
      title,
      description,
      price: parseFloat(price),
    };

    if (isEditing) {
      // Update existing service
      const docRef = doc(db, 'services', isEditing);
      await updateDoc(docRef, serviceData);
    } else {
      // Add new service
      await addDoc(collection(db, 'services'), {
        ...serviceData,
        createdAt: serverTimestamp(),
      });
    }
    resetForm();
  };

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-container">
      <h2 className="page-title">Manage My Services</h2>
      <div className="card">
        <h3>{isEditing ? 'Edit Service' : 'Add a New Service'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Premium Wedding Package" className="form-input" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included in this service?" className="form-input" />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 1500" className="form-input" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{isEditing ? 'Update Service' : 'Add Service'}</button>
            {isEditing && <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel Edit</button>}
          </div>
        </form>
      </div>

      <div className="services-list">
        <h3>My Service List</h3>
        {services.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id}>
                    <td>{service.title}</td>
                    <td>${service.price}</td>
                    <td>
                      <button onClick={() => handleEditClick(service)} className="btn btn-secondary btn-sm">Edit</button>
                      <button onClick={() => handleDelete(service.id)} className="btn btn-danger btn-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p>You haven't added any services yet.</p>}
      </div>
    </div>
  );
}