// src/components/client/ClientShareAlbumForm.jsx

import { useState } from 'react';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import MessageBox from '../common/MessageBox';

export default function ClientShareAlbumForm({ album }) {
  const [shareWithId, setShareWithId] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleShare = async (e) => {
    e.preventDefault();
    const idToShare = shareWithId.trim();

    if (!idToShare) {
      setStatus({ message: 'Please enter a User ID.', type: 'error' });
      return;
    }

    try {
      const albumRef = doc(db, 'albums', album.id);
      await updateDoc(albumRef, {
        accessibleTo: arrayUnion(idToShare)
      });
      setStatus({ message: 'Album shared successfully!', type: 'success' });
      setShareWithId('');
    } catch (err) {
      console.error("Error sharing album:", err);
      setStatus({ message: 'Error: Could not share album. Check permissions.', type: 'error' });
    }
  };

  const closeMessage = () => setStatus({ message: '', type: '' });

  return (
    <div style={{ marginTop: '1rem' }}>
      {status.message && <MessageBox message={status.message} type={status.type} onClose={closeMessage} />}
      
      <form onSubmit={handleShare} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input
          type="text"
          value={shareWithId}
          onChange={(e) => setShareWithId(e.target.value)}
          placeholder="Share with User ID"
          className="form-input"
        />
        <button type="submit" className="btn btn-secondary">
          Share
        </button>
      </form>
    </div>
  );
}