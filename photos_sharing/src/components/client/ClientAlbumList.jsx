// src/components/client/ClientAlbumList.jsx

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import ClientAlbumView from './ClientAlbumView';
import ClientShareAlbumForm from './ClientShareAlbumForm';
import './ClientDashboard.css';

export default function ClientAlbumList({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    <>
      <h2 className="page-title">Albums Shared With You</h2>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search albums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input search-input"
        />
      </div>

      <div className="album-grid">
        {filteredAlbums.length === 0 ? (
          <div className="empty-state">
            <h3>No albums have been shared with you yet.</h3>
            <p>Share your User ID with your photographer to get started.</p>
          </div>
        ) : (
          filteredAlbums.map((album) => (
            <div key={album.id} className="card album-card">
              <div className="album-card-cover" style={{ backgroundImage: `url(${album.coverImage || 'https://via.placeholder.com/400x250/f8f9fa/6c757d?text=No+Cover'})` }}></div>
              <div className="album-card-body">
                <h3>{album.title}</h3>
                <p className="album-meta">Created: {niceDate(album.createdAt)}</p>
                <div className="album-actions">
                    <button
                        onClick={() => setSelectedAlbum(album)}
                        className="btn btn-primary"
                    >
                        View Album
                    </button>
                </div>
                <ClientShareAlbumForm album={album} />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}