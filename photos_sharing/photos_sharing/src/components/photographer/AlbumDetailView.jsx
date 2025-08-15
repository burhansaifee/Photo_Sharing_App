// src/components/photographer/AlbumDetailView.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';
import ImageUploader from './ImageUploader';

export default function AlbumDetailView({ album, onBack }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'images'), where('albumId', '==', album.id));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImages(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  const handleDownload = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
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
      console.error("Error downloading image:", error);
      alert("Could not download the image.");
    }
  };

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Albums
      </button>
      <h2 className="page-title">{album.title}</h2>
      <ImageUploader albumId={album.id} />

      <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Photos in this Album</h3>

      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : (
        <div className="image-grid">
          {images.length > 0 ? (
            images.map((image) => {
              // Get the likes array, default to empty array if it doesn't exist
              const likes = image.likes || [];

              return (
                <div key={image.id} className="card image-card">
                  <img src={image.imageUrl} alt={image.fileName} />
                  <div className="image-overlay">
                    <button
                      onClick={() => handleDownload(image.imageUrl, image.fileName)}
                      className="btn"
                    >
                      Download
                    </button>
                  </div>
                  {/* --- NEW: Display Likes for Photographer --- */}
                  {/* Show the like section only if there is at least one like */}
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
            <p>No images uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}