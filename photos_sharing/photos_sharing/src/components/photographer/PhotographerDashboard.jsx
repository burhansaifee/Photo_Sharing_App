// src/components/photographer/PhotographerDashboard.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import CreateAlbumForm from './CreateAlbumForm';
import ShareAlbumForm from './ShareAlbumForm';
import AlbumDetailView from './AlbumDetailView';

export default function PhotographerDashboard({ user }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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

  const niceDate = (ts) => {
    if (!ts) return '';
    return ts.toDate ? ts.toDate().toLocaleDateString() : new Date(ts).toLocaleDateString();
  };

  // --- NEW: Function to handle album deletion ---
  const handleDeleteAlbum = async (albumId, albumTitle) => {
    // 1. Confirm deletion
    const isConfirmed = window.confirm(`Are you sure you want to delete the album "${albumTitle}"? This will also delete all its photo records in the database.`);

    if (!isConfirmed) {
      return;
    }

    try {
      // 2. Delete all image documents associated with the album
      const imagesQuery = query(collection(db, 'images'), where('albumId', '==', albumId));
      const imageSnapshots = await getDocs(imagesQuery);
      const deletePromises = imageSnapshots.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // 3. Delete the album document itself
      const albumRef = doc(db, 'albums', albumId);
      await deleteDoc(albumRef);

      alert(`Album "${albumTitle}" and its photo records have been deleted. Note: The actual image files still exist on Cloudinary.`);

    } catch (error) {
      console.error("Error deleting album: ", error);
      alert("An error occurred while trying to delete the album.");
    }
  };

  if (loading) return <div className="spinner-container"><Spinner /></div>;
  if (selectedAlbum) return <AlbumDetailView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>My Albums</h2>
        <CreateAlbumForm photographerId={user.uid} />
      </div>

      <div className="info-box">
        Your User ID (share with clients): <strong>{user.uid}</strong>
      </div>

      <div className="album-grid">
        {albums.length === 0 ? (
          <p>You haven't created any albums yet.</p>
        ) : (
          albums.map((album) => (
            <div key={album.id} className="card album-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{album.title}</h3>
                  <p>Created: {niceDate(album.createdAt)}</p>
                </div>
                {/* --- NEW: Delete Button --- */}
                <button 
                  onClick={() => handleDeleteAlbum(album.id, album.title)}
                  className="btn btn-danger"
                  style={{ flexShrink: 0, marginLeft: '1rem', width: '30%', height: '30px', padding: 0, fontSize: '1rem' }}
                >
                  Delete
                </button>
              </div>
              <button
                onClick={() => setSelectedAlbum(album)}
                className="btn btn-primary"
              >
                View & Manage Album
              </button>
              <ShareAlbumForm album={album} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}