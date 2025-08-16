// src/components/photographer/AlbumPhotos.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore'; // Import doc and updateDoc
import { db } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';

export default function AlbumPhotos({ album, onBack }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'media'), where('albumId', '==', album.id), where('mediaType', '==', 'image'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  const handleSetCoverImage = async (imageUrl) => {
    const albumRef = doc(db, 'albums', album.id);
    try {
      await updateDoc(albumRef, { coverImage: imageUrl });
      alert('Album cover has been updated!');
    } catch (error) {
      console.error("Error setting cover image:", error);
      alert('Failed to set cover image.');
    }
  };

  const handleDownload = async (mediaUrl, filename) => {
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
        &larr; Back to Album
      </button>
      <h2 className="page-title">{album.title} - Photos</h2>

      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : (
        <div className="media-grid">
          {photos.length > 0 ? (
            photos.map((item) => {
              const likes = item.likes || [];
              const isCover = album.coverImage === item.mediaUrl;
              return (
                <div key={item.id} className={`card media-card ${isCover ? 'cover-image-border' : ''}`}>
                  <img src={item.mediaUrl} alt={item.fileName} />
                  <div className="media-overlay">
                    <button onClick={() => handleSetCoverImage(item.mediaUrl)} className="btn">
                      {isCover ? '✓ Cover' : 'Set as Cover'}
                    </button>
                    <button
                      onClick={() => handleDownload(item.mediaUrl, item.fileName)}
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
            <p>No photos uploaded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}