import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Spinner from '../common/Spinner';

export default function FaceRecognition({ albumPhotos, onBack }) {
  const [loading, setLoading] = useState(true);
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const videoRef = useRef();
  const canvasRef = useRef();
  const intervalRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        startVideo();
      } catch (error) {
        console.error("Failed to load models:", error);
        setSearchStatus('Error loading models. Please refresh the page.');
        setLoading(false);
      }
    };
    loadModels();

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Error starting video:", err);
        setSearchStatus('Could not access the camera. Please check your browser permissions.');
        setLoading(false);
      });
  };

  const handleVideoOnPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4 && canvasRef.current) {
        const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options());
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }
    }, 100);
  };

  const handleScanFace = async () => {
    setIsSearching(true);
    setMatchedPhotos([]);
    setSearchStatus('Detecting your face from the camera...');

    const videoEl = videoRef.current;
    if (!videoEl) {
      setIsSearching(false);
      return;
    }

    const descriptor = await faceapi.detectSingleFace(videoEl).withFaceLandmarks().withFaceDescriptor();

    if (!descriptor) {
      alert('Could not detect a face. Please ensure you are in a well-lit area and looking directly at the camera.');
      setIsSearching(false);
      setSearchStatus('');
      return;
    }

    setSearchStatus('Face detected! Now comparing with album photos...');
    const faceMatcher = new faceapi.FaceMatcher(descriptor, 0.5); // Adjusted matching sensitivity

    const matched = new Set();
    for (let i = 0; i < albumPhotos.length; i++) {
      const photo = albumPhotos[i];
      setSearchStatus(`Analyzing photo ${i + 1} of ${albumPhotos.length}...`);
      try {
        // This is the new, more reliable way to fetch images
        const response = await fetch(photo.mediaUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        const img = await faceapi.bufferToImage(blob);
        
        const results = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

        results.forEach(result => {
          const bestMatch = faceMatcher.findBestMatch(result.descriptor);
          if (bestMatch.label !== 'unknown') {
            matched.add(photo);
          }
        });
      } catch (error) {
        console.error("Could not process image:", photo.mediaUrl, error);
      }
    }

    if (matched.size === 0) {
      alert("No matching photos were found in this album. You can try again from a different angle or with better lighting.");
    }

    setMatchedPhotos(Array.from(matched));
    setIsSearching(false);
    setSearchStatus('');
  };

  return (
    <div>
      <button onClick={onBack} className="btn" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Album
      </button>
      <h2 className="page-title">Find Your Photos by Face</h2>

      <div className="face-recognition-container">
        {loading && <div className="spinner-container"><Spinner /></div>}
        <div className="video-container" style={{ visibility: loading ? 'hidden' : 'visible', width: '100%', paddingTop: '75%', position: 'relative' }}>
          <video ref={videoRef} onPlay={handleVideoOnPlay} autoPlay muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>
        <button onClick={handleScanFace} className="btn btn-success" disabled={isSearching || loading}>
          {isSearching ? 'Searching...' : 'Scan My Face & Find Photos'}
        </button>
        {searchStatus && <p style={{ textAlign: 'center', marginTop: '1rem' }}>{searchStatus}</p>}
      </div>

      {matchedPhotos.length > 0 && (
        <div className="results-container">
          <h3 className="section-title">Found {matchedPhotos.length} Matching Photos</h3>
          <div className="media-grid">
            {matchedPhotos.map(photo => (
              <div key={photo.id} className="card media-card">
                <img src={photo.mediaUrl} alt={photo.fileName} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}