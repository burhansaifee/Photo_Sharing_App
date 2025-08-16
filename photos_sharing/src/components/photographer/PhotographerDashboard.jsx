import { useEffect, useState, useMemo } from 'react';
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>My Albums</h2>
        <CreateAlbumForm photographerId={user.uid} />
      </div>

      <div className="form-group" style={{ marginBottom: '2rem' }}>
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
              {/* === THE FIX IS HERE === */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flexGrow: 1 }}>
                  <h3>{album.title}</h3>
                  <p>Created: {niceDate(album.createdAt)}</p>
                </div>
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
              <button
                onClick={() => setSelectedAlbum(album)}
                className="btn btn-primary"
              >
                View & Manage Album
              </button>

               {album.isPublic && (
                <button onClick={() => handleCopyPublicLink(album.id)} className="btn" style={{marginTop: '0.5rem'}}>
                  Share Public Link
                </button>
              )}
              <ShareAlbumForm album={album} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}