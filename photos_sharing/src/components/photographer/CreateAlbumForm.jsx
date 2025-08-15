import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function CreateAlbumForm({ photographerId }) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'albums'), {
        title: title.trim(),
        photographerId,
        createdAt: serverTimestamp(),
        accessibleTo: [],
      });
      setTitle('');
    } catch (err) {
      alert('Error creating album: ' + err.message);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New Album Title"
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={submitting}
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        disabled={submitting}
      >
        {submitting ? 'Creating…' : 'Create Album'}
      </button>
    </form>
  );
}