// src/components/client/ClientAlbumView.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig'; // Import auth
import Spinner from '../common/Spinner';

export default function ClientAlbumView({ album, onBack }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

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
    // Download logic remains the same
  };

  // --- NEW: Function to handle liking/unliking an image ---
  const handleLikeToggle = async (imageId, currentLikes) => {
    if (!currentUser) return; // Make sure user is logged in

    const imageRef = doc(db, 'images', imageId);
    const userHasLiked = currentLikes?.includes(currentUser.uid);

    try {
      if (userHasLiked) {
        // User has already liked, so "unlike" it
        await updateDoc(imageRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        // User has not liked it yet, so "like" it
        await updateDoc(imageRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      alert("Could not update like status. Please check permissions.");
    }
  };


  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to My Albums
      </button>
      <h2 className="page-title">{album.title}</h2>

      {loading ? (
        <div className="spinner-container"><Spinner /></div>
      ) : (
        <div className="image-grid">
          {images.length > 0 ? (
            images.map((image) => {
              const likes = image.likes || [];
              const userHasLiked = currentUser && likes.includes(currentUser.uid);

              return (
                <div key={image.id} className="card image-card">
                  <img src={image.imageUrl} alt={image.fileName} />
                  <div className="image-overlay">
                    <button onClick={() => handleDownload(image.imageUrl, image.fileName)} className="btn">
                      Download
                    </button>
                  </div>
                  {/* --- NEW: Like button and counter --- */}
                  <div className="like-section">
                    <button 
                      onClick={() => handleLikeToggle(image.id, likes)} 
                      className={`like-button ${userHasLiked ? 'liked' : ''}`}
                    >
                      ❤️
                    </button>
                    <span className="like-count">{likes.length}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p>This album is empty.</p>
          )}
        </div>
      )}
    </div>
  );
}