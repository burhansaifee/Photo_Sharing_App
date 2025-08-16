// src/App.jsx

import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';

// Import Page Components
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PublicAlbumPage from './pages/PublicAlbumPage'; // Import the new page
import ProtectedRoute from './components/common/ProtectedRoute';


const SignOutButton = ({ setIsMenuOpen }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    if (setIsMenuOpen) {
      setIsMenuOpen(false);
    }
    navigate('/');
  };

  return (
    <button onClick={handleSignOut} className="btn btn-danger">
      Sign Out
    </button>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          const newUserData = {
            uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName,
            role: 'client', createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserData);
          setUserData(newUserData);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={() => setIsMenuOpen(false)}>PhotoShare</Link>
          <div className="navbar-menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>&#9776;</div>
          <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
            <ul>
              <li><NavLink to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</NavLink></li>
              {user && <li><NavLink to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink></li>}
              <li><NavLink to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</NavLink></li>
              <li><NavLink to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</NavLink></li>
            </ul>
            <div className="navbar-actions">
              {user && userData ? (
                <div className="header-user-info">
                  <div className="header-user-details">
                    <p className="user-email">{userData.email}</p>
                    <p className="user-role">{userData.role}</p>
                  </div>
                  <SignOutButton setIsMenuOpen={setIsMenuOpen} />
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/album/:albumId" element={<PublicAlbumPage />} /> {/* Add this new route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <DashboardPage user={user} userData={userData} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}