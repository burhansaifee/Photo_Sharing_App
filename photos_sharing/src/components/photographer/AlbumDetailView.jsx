// src/components/photographer/AlbumDetailView.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
// We'll assume ImageUploader is renamed to MediaUploader
import MediaUploader from './MediaUploader'; 

export default function AlbumDetailView({ album, onBack }) {
  // 1. State renamed from 'images' to 'media'
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Query now points to a 'media' collection
    const q = query(collection(db, 'media'), where('albumId', '==', album.id));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedia(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  // 3. Download logic updated to handle both media types
  const handleDownload = async (mediaUrl, filename, mediaType) => {
    // For videos, a direct link is often sufficient and more reliable
    if (mediaType === 'video') {
      window.open(mediaUrl, '_blank');
      return;
    }

    // Existing logic for images
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'photo.jpg');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading media:", error);
      alert("Could not download the media.");
    }
  };

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Albums
      </button>
      <h2 className="page-title">{album.title}</h2>
      {/* 4. Using the new MediaUploader component */}
      <MediaUploader albumId={album.id} />

      <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Media in this Album</h3>

      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : (
        <div className="media-grid"> {/* Assuming a new class for combined media */}
          {media.length > 0 ? (
            media.map((item) => {
              const likes = item.likes || [];
              return (
                <div key={item.id} className="card media-card">
                  {/* 5. Conditional rendering based on mediaType */}
                  {item.mediaType === 'video' ? (
                    <video controls src={item.mediaUrl} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                  ) : (
                    <img src={item.mediaUrl} alt={item.fileName} />
                  )}
                  
                  <div className="media-overlay">
                    <button
                      onClick={() => handleDownload(item.mediaUrl, item.fileName, item.mediaType)}
                      className="btn"
                    >
                      Download
                    </button>
                  </div>
                  
                  {likes.length > 0 && (
                    <div className="like-section">
                      <span className="like-button liked">❤️</span>
                      <span className="like-count">{likes.length}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No media uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}