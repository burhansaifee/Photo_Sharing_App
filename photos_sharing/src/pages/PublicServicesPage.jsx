import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import Spinner from '../components/common/Spinner';

export default function PublicServicesPage() {
  const [services, setServices] = useState([]);
  const [photographers, setPhotographers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicesAndPhotographers = async () => {
      // Fetch all users with the role of 'photographer'
      const photographersQuery = query(collection(db, 'users'), where('role', '==', 'photographer'));
      const photographersSnapshot = await getDocs(photographersQuery);
      const photographersData = {};
      photographersSnapshot.forEach(doc => {
        photographersData[doc.id] = doc.data();
      });
      setPhotographers(photographersData);

      // Fetch all services
      const servicesQuery = query(collection(db, 'services'));
      const unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
        const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesData);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchServicesAndPhotographers();
  }, []);

  if (loading) {
    return <div className="spinner-container"><Spinner /></div>;
  }

  return (
    <div>
      <h2 className="page-title">Our Services</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        Browse the professional services offered by our talented photographers.
      </p>

      {services.length > 0 ? (
        <ul className="list-group">
          {services.map(service => (
            <li key={service.id} className="list-group-item">
              <div>
                <span>{service.name}</span>
                <small style={{ display: 'block', color: 'var(--text-secondary)' }}>
                  Offered by: {photographers[service.photographerId]?.email || 'A photographer'}
                </small>
              </div>
              <div className="service-item-actions">
                <span className="service-price">${service.price.toFixed(2)}</span>
                <button className="btn">Contact Photographer</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center' }}>No services are currently being offered.</p>
      )}
    </div>
  );
}