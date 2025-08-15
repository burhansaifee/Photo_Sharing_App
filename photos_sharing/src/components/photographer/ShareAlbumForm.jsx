import { useState } from 'react';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function ShareAlbumForm({ album }) {
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('');

  const handleShare = async (e) => {
    e.preventDefault();
    setStatus('');
    const id = clientId.trim();
    if (!id) {
      setStatus('Please enter a Client User ID.');
      return;
    }
    try {
      const albumRef = doc(db, 'albums', album.id);
      await updateDoc(albumRef, {
        accessibleTo: arrayUnion(id)
      });
      setStatus('Album shared successfully!');
    } catch (err) {
      setStatus('Error sharing album: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleShare} className="flex items-center space-x-2">
      <input
        type="text"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        placeholder="Client User ID"
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Share Album
      </button>
      {status && <p className="text-red-500">{status}</p>}
    </form>
  );
}