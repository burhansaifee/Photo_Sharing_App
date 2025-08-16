// src/components/client/ClientDashboard.jsx

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import ClientAlbumView from './ClientAlbumView';
import ClientShareAlbumForm from './ClientShareAlbumForm';

export default function ClientDashboard({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

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

  const filteredAlbums = useMemo(() => {
    return albums.filter(album =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [albums, searchTerm]);

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

      <div className="form-group" style={{ margin: '2rem 0' }}>
        <input
          type="text"
          placeholder="Search albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="album-grid">
        {filteredAlbums.length === 0 ? (
          <p>No albums found.</p>
        ) : (
          filteredAlbums.map((album) => (
            <div key={album.id} className="card album-card">
              <div className="album-card-cover" style={{ backgroundImage: `url(${album.coverImage || 'https://via.placeholder.com/400x250/161b22/8b949e?text=No+Cover'})` }}></div>
              <h3>{album.title}</h3>
              <p>Created: {niceDate(album.createdAt)}</p>
              <button
                onClick={() => setSelectedAlbum(album)}
                className="btn btn-primary"
              >
                View Album
              </button>
              <ClientShareAlbumForm album={album} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}