// src/components/photographer/PhotographerDashboard.jsx

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import CreateAlbumForm from './CreateAlbumForm';
import ShareAlbumForm from './ShareAlbumForm';
import AlbumDetailView from './AlbumDetailView';
import './PhotographerDashboard.css';

export default function PhotographerDashboard({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'albums'), where('photographerId', '==', user.uid));
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

  const handleCopyPublicLink = (albumId) => {
    const link = `${window.location.origin}/album/${albumId}`;
    navigator.clipboard.writeText(link);
    alert('Public link copied to clipboard!');
  };

  const niceDate = (ts) => {
    if (!ts) return '';
    return ts.toDate ? ts.toDate().toLocaleDateString() : new Date(ts).toLocaleDateString();
  };
  const handleDeleteAlbum = async (albumId, albumTitle) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the album "${albumTitle}"? This will also delete all its photo records in the database.`);

    if (!isConfirmed) {
      return;
    }

    try {
      const imagesQuery = query(collection(db, 'media'), where('albumId', '==', albumId));
      const imageSnapshots = await getDocs(imagesQuery);
      const deletePromises = imageSnapshots.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      const albumRef = doc(db, 'albums', albumId);
      await deleteDoc(albumRef);

      alert(`Album "${albumTitle}" and its photo records have been deleted.`);

    } catch (error) {
      console.error("Error deleting album: ", error);
      alert("An error occurred while trying to delete the album.");
    }
  };


  if (loading) return <div className="spinner-container"><Spinner /></div>;
  if (selectedAlbum) return <AlbumDetailView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="page-title">My Albums</h2>
        <CreateAlbumForm photographerId={user.uid} />
      </div>

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
            <h3>No albums found.</h3>
            <p>Click "Create New Album" to get started.</p>
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
                        View & Manage
                    </button>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album.id, album.title);
                        }}
                        className="btn btn-danger"
                    >
                        Delete
                    </button>
                </div>
                <div className="share-section">
                    {album.isPublic && (
                        <button onClick={() => handleCopyPublicLink(album.id)} className="btn btn-secondary">
                        Share Public Link
                        </button>
                    )}
                    <ShareAlbumForm album={album} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}