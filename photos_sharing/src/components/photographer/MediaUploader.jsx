// src/components/photographer/MediaUploader.jsx

import { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import MessageBox from '../common/MessageBox';

export default function MediaUploader({ albumId }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/'))) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid image or video file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsUploading(true);
    setError('');

    // --- DOUBLE-CHECK THESE VALUES ---
    const cloudName = 'dql8ope8t'; // <-- PASTE YOUR CLOUD NAME HERE
    const uploadPreset = 'photo_share_preset'; // <-- MAKE SURE THIS MATCHES YOUR PRESET NAME

    // Use 'video' endpoint for videos, 'image' for images for better resource management
    const resourceType = file.type.startsWith('video') ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(url, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Upload to Cloudinary failed.');
      }
      
      const data = await response.json();
      
      await addDoc(collection(db, 'media'), {
        albumId,
        mediaUrl: data.secure_url,
        mediaType: data.resource_type,
        fileName: file.name,
        uploadedAt: serverTimestamp(),
        likes: [],
      });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error("Upload Error:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <h4 style={{marginBottom: '1rem'}}>Upload New Media</h4>
      {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}
      <div className="form-inline">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="form-input"
        />
        <button onClick={handleUpload} disabled={!file || isUploading} className="btn">
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}