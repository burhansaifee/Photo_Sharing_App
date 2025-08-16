// src/components/photographer/AlbumVideos.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';

export default function AlbumVideos({ album, onBack }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'media'), where('albumId', '==', album.id), where('mediaType', '==', 'video'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  const handleDownload = (mediaUrl) => {
    window.open(mediaUrl, '_blank');
  };

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Album
      </button>
      <h2 className="page-title">{album.title} - Videos</h2>

      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : (
        <div className="media-grid">
          {videos.length > 0 ? (
            videos.map((item) => {
              const likes = item.likes || [];
              return (
                <div key={item.id} className="card media-card">
                  <video controls src={item.mediaUrl} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                  <div className="media-overlay">
                    <button
                      onClick={() => handleDownload(item.mediaUrl)}
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
            <p>No videos uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}