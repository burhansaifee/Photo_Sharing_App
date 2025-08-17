// src/pages/PublicAlbumPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Spinner from '../components/common/Spinner';
import PasswordProtect from '../components/common/PasswordProtect';

export default function PublicAlbumPage() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

 useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const albumRef = doc(db, 'albums', albumId);
        const albumSnap = await getDoc(albumRef);

        if (albumSnap.exists()) {
          if (albumSnap.data().isPublic) {
            setAlbum({ id: albumSnap.id, ...albumSnap.data() });
            if (!albumSnap.data().password) {
              setIsAuthenticated(true);
            }
          } else {
            setError('This album is not public.');
          }
        } else {
          setError('This album does not exist.');
        }
      } catch (err) {
        console.error("Error fetching album:", err);
        setError('Failed to load album. Please check your Firestore security rules.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [albumId]);

  useEffect(() => {
    if (!isAuthenticated || !album) return;

    const q = query(collection(db, 'media'), where('albumId', '==', album.id));
    const unsub = onSnapshot(q, (snap) => {
      setMedia(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [isAuthenticated, album]);


  const handlePasswordSubmit = (password) => {
    if (password === album.password) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password.');
    }
  };

  if (loading) return <div className="spinner-container"><Spinner /></div>;
  if (error) return <p>{error}</p>;
  if (!album) return <p>Album not found.</p>;

  if (!isAuthenticated) {
    return <PasswordProtect onPasswordSubmit={handlePasswordSubmit} />;
  }

  const photos = media.filter(item => item.mediaType === 'image');
  const videos = media.filter(item => item.mediaType === 'video');

  return (
    <div>
      <h2 className="page-title">{album.title}</h2>
      {/* Photos Section */}
      <h3 className="media-section-title">Photos</h3>
      <div className="media-grid">
        {photos.length > 0 ? photos.map(item => (
          <div key={item.id} className="card media-card">
            <img src={item.mediaUrl} alt={item.fileName} />
          </div>
        )) : <p>No photos in this album.</p>}
      </div>

      {/* Videos Section */}
      <h3 className="media-section-title">Videos</h3>
      <div className="media-grid">
        {videos.length > 0 ? videos.map(item => (
          <div key={item.id} className="card media-card">
            <video controls src={item.mediaUrl} />
          </div>
        )) : <p>No videos in this album.</p>}
      </div>
    </div>
  );
}