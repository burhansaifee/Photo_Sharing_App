// src/components/photographer/ImageUploader.jsx

import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import MessageBox from '../common/MessageBox';

export default function ImageUploader({ albumId }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid image file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    // --- Cloudinary Upload Logic ---
    const cloudName = 'dql8ope8t'; // <-- PASTE YOUR CLOUD NAME HERE
    const uploadPreset = 'photo_share_preset'; // <-- PASTE YOUR UPLOAD PRESET HERE
    
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // We can't track progress with fetch, so we'll simulate it
      });

      if (!response.ok) {
        throw new Error('Image upload failed. Please check your Cloudinary settings.');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Save image URL to Firestore
      await addDoc(collection(db, 'images'), {
        albumId,
        imageUrl: imageUrl,
        uploadedAt: serverTimestamp(),
        fileName: file.name,
      });

      // Reset state
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message || 'Upload failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ borderLeftColor: 'var(--primary-color)' }}>
      <h4 style={{ margin: 0, marginBottom: '1rem' }}>Upload New Photo</h4>
      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="form-input"
          style={{ flexGrow: 1 }}
        />
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="btn btn-success"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {isUploading && (
        <div style={{ marginTop: '1rem', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
            {/* Simulating progress as fetch API doesn't support it out of the box */}
            <div style={{ width: '100%', height: '100%', background: 'var(--success-color)' }} />
        </div>
      )}
    </div>
  );
}