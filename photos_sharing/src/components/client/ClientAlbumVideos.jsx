// src/components/client/ClientAlbumVideos.jsx

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';
import Spinner from '../common/Spinner';

export default function ClientAlbumVideos({ album, onBack }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'media'), where('albumId', '==', album.id), where('mediaType', '==', 'video'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(list);
      setLoading(false);
    });
    return () => unsub();
  }, [album.id]);

  const handleLikeToggle = async (mediaId, currentLikes) => {
    if (!currentUser) return;
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

  const createDownloadUrl = (mediaUrl) => {
    return mediaUrl;
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
              const userHasLiked = currentUser && likes.includes(currentUser.uid);
              return (
                <div key={item.id} className="card media-card">
                  <video controls src={item.mediaUrl} />
                  <div className="media-overlay">
                    <a href={createDownloadUrl(item.mediaUrl)} download={item.fileName} className="btn">
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
            <p>This album has no videos.</p>
          )}
        </div>
      )}
    </div>
  );
}