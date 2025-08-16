// src/components/client/ClientAlbumView.jsx
import { useState } from 'react';
import ClientAlbumPhotos from './ClientAlbumPhotos';
import ClientAlbumVideos from './ClientAlbumVideos';

export default function ClientAlbumView({ album, onBack }) {
  const [view, setView] = useState('menu'); // 'menu', 'photos', 'videos'

  if (view === 'photos') {
    return <ClientAlbumPhotos album={album} onBack={() => setView('menu')} />;
  }

  if (view === 'videos') {
    return <ClientAlbumVideos album={album} onBack={() => setView('menu')} />;
  }

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to My Albums
      </button>
      <h2 className="page-title">{album.title}</h2>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setView('photos')} className="btn btn-primary">
          View Photos
        </button>
        <button onClick={() => setView('videos')} className="btn btn-primary">
          View Videos
        </button>
      </div>
    </div>
  );
}