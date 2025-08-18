// src/components/client/ClientAlbumView.jsx
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ClientAlbumPhotos from './ClientAlbumPhotos';
import ClientAlbumVideos from './ClientAlbumVideos';
import FaceRecognition from './FaceRecognition'; // Import the new component

export default function ClientAlbumView({ album, onBack }) {
  const [view, setView] = useState('menu'); // 'menu', 'photos', 'videos', 'face'
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'media'), where('albumId', '==', album.id), where('mediaType', '==', 'image'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(list);
    });
    return () => unsub();
  }, [album.id]);


  if (view === 'photos') {
    return <ClientAlbumPhotos album={album} onBack={() => setView('menu')} />;
  }

  if (view === 'videos') {
    return <ClientAlbumVideos album={album} onBack={() => setView('menu')} />;
  }

  if (view === 'face') {
    return <FaceRecognition albumPhotos={photos} onBack={() => setView('menu')} />;
  }

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to My Albums
      </button>
      <h2 className="page-title">{album.title}</h2>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => setView('photos')} className="btn btn-primary">
          View Photos
        </button>
        <button onClick={() => setView('videos')} className="btn btn-primary">
          View Videos
        </button>
        <button onClick={() => setView('face')} className="btn btn-success">
          Find My Photos
        </button>
      </div>
    </div>
  );
}