// src/components/client/ClientAlbumView.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';

export default function ClientAlbumView({ album, onBack }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    // FIX 1: Fetching from the correct 'media' collection
    const q = query(collection(db, 'media'), where('albumId', '==', album.id));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedia(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  const handleLikeToggle = async (mediaId, currentLikes) => {
    if (!currentUser) return;
    // FIX 2: Referencing the 'media' document for liking
    const mediaRef = doc(db, 'media', mediaId);
    const userHasLiked = currentLikes?.includes(currentUser.uid);
    try {
      if (userHasLiked) {
        await updateDoc(mediaRef, { likes: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(mediaRef, { likes: arrayUnion(currentUser.uid) });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      alert("Could not update like status. Please check permissions.");
    }
  };

  // FIX 3: Using the reliable direct download URL creator
  const createDownloadUrl = (mediaUrl, mediaType) => {
    if (mediaType === 'video') {
      // For videos, the direct URL works best for download/new tab
      return mediaUrl;
    }
    // For images, this flag forces the browser to download instead of opening
    return mediaUrl.replace('/upload/', '/upload/fl_attachment/');
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
        <div className="media-grid">
          {media.length > 0 ? (
            media.map((item) => {
              const likes = item.likes || [];
              const userHasLiked = currentUser && likes.includes(currentUser.uid);
              return (
                <div key={item.id} className="card media-card">
                  {item.mediaType === 'video' ? (
                    <video controls src={item.mediaUrl} />
                  ) : (
                    <img src={item.mediaUrl} alt={item.fileName} />
                  )}
                  <div className="media-overlay">
                    <a href={createDownloadUrl(item.mediaUrl, item.mediaType)} download={item.fileName} className="btn">
                      Download
                    </a>
                  </div>
                  <div className="like-section">
                    <button onClick={() => handleLikeToggle(item.id, likes)} className={`like-button ${userHasLiked ? 'liked' : ''}`}>
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