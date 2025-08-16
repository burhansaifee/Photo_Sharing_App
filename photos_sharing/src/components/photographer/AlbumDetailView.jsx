// src/components/photographer/AlbumDetailView.jsx
import { useState } from 'react';
import MediaUploader from './MediaUploader';
import AlbumPhotos from './AlbumPhotos';
import AlbumVideos from './AlbumVideos';

export default function AlbumDetailView({ album, onBack }) {
  const [view, setView] = useState('menu'); // 'menu', 'photos', 'videos'

  if (view === 'photos') {
    return <AlbumPhotos album={album} onBack={() => setView('menu')} />;
  }

  if (view === 'videos') {
    return <AlbumVideos album={album} onBack={() => setView('menu')} />;
  }

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Albums
      </button>
      <h2 className="page-title">{album.title}</h2>
      <MediaUploader albumId={album.id} />

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