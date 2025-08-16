// src/components/auth/Auth.jsx

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import MessageBox from '../common/MessageBox';
import './Auth.css';

export default function AuthComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [photographerKey, setPhotographerKey] = useState(''); // New state for the key
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // --- This is your secret key. Change it to something secure! ---
  const SECRET_KEY = 'Burhan@saifee';

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || 'Google sign-in failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // --- Key validation for photographers ---
    if (isSignUp && role === 'photographer' && photographerKey !== SECRET_KEY) {
      setError('Invalid Photographer Key. Please contact support if you are a photographer.');
      return;
    }

    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCred.user;
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          role,
          createdAt: serverTimestamp(),
        });
        setMessage('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Logged in successfully!');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {message && <MessageBox message={message} type="success" onClose={() => setMessage('')} />}
        {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}

        <h2 className="auth-title">{isSignUp ? 'Create Account' : 'Sign In'}</h2>

        <button
          onClick={handleGoogleSignIn}
          className="btn-google"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" />
          Sign in with Google
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-group">
                <label className="form-label">I am a:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                >
                  <option value="client">Client</option>
                  <option value="photographer">Photographer</option>
                </select>
              </div>

              {/* --- New field for the photographer key --- */}
              {role === 'photographer' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="photographerKey">Photographer Key</label>
                  <input
                    type="password"
                    id="photographerKey"
                    value={photographerKey}
                    onChange={(e) => setPhotographerKey(e.target.value)}
                    className="form-input"
                    placeholder="Enter registration key"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-accent">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-btn">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}