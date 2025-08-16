// src/components/photographer/CreateAlbumForm.jsx
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function CreateAlbumForm({ photographerId }) {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        coverImage: null,
        isPublic: isPublic,
        password: isPublic && password ? password.trim() : null,
      });
      setTitle('');
      setPassword('');
      setIsPublic(false);
      setIsOpen(false);
    } catch (err) {
      alert('Error creating album: ' + err.message);
    }
    setSubmitting(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-success create-album-btn">
        + Create New Album
      </button>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Create a New Album</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="albumTitle">Album Title</label>
            <input
              type="text"
              id="albumTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="checkbox-group" style={{ margin: '1rem 0' }}>
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic">Make this a public album</label>
          </div>

          {isPublic && (
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (optional)</label>
              <input
                type="text"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Leave blank for no password"
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}