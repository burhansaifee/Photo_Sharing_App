// src/components/client/ClientDashboard.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import ClientAlbumView from './ClientAlbumView';
import ClientShareAlbumForm from './ClientShareAlbumForm'; // Import the new component

export default function ClientDashboard({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'albums'), where('accessibleTo', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlbums(list);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);
  
  const niceDate = (ts) => {
    if (!ts) return '';
    return ts.toDate ? ts.toDate().toLocaleDateString() : new Date(ts).toLocaleDateString();
  };

  if (loading) return <div className="spinner-container"><Spinner /></div>;
  if (selectedAlbum) return <ClientAlbumView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />;

  return (
    <div>
      <h2 className="page-title">Albums Shared With You</h2>
      
      <div className="info-box">
        Your User ID (give this to your photographer): <strong>{user.uid}</strong>
      </div>

      <div className="album-grid">
        {albums.length === 0 ? (
          <p>No albums have been shared with you yet.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="card album-card">
              <h3>{album.title}</h3>
              <p>Created: {niceDate(album.createdAt)}</p>
              <button
                onClick={() => setSelectedAlbum(album)}
                className="btn btn-primary"
              >
                View Album
              </button>
              {/* Add the sharing form here */}
              <ClientShareAlbumForm album={album} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}