// src/App.jsx

import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import { scroller } from 'react-scroll';

// Import Page Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PublicAlbumPage from './pages/PublicAlbumPage';
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

// Custom NavLink for scrolling
const NavScrollLink = ({ to, children, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    setIsMenuOpen(false);
    // If we're not on the homepage, navigate there first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to happen before trying to scroll
      setTimeout(() => {
        scroller.scrollTo(to, {
          duration: 800,
          delay: 0,
          smooth: 'easeInOutQuart',
          offset: -70, // Offset for fixed navbar
        });
      }, 100);
    } else {
      // If we're already on the homepage, just scroll
      scroller.scrollTo(to, {
        duration: 800,
        delay: 0,
        smooth: 'easeInOutQuart',
        offset: -70,
      });
    }
  };

  return (
    <a onClick={handleClick} className="nav-link" style={{ cursor: 'pointer' }}>
      {children}
    </a>
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
              <li><NavScrollLink to="home" setIsMenuOpen={setIsMenuOpen}>Home</NavScrollLink></li>
              {user && <li><Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>}
              <li><NavScrollLink to="about" setIsMenuOpen={setIsMenuOpen}>About</NavScrollLink></li>
              <li><NavScrollLink to="contact" setIsMenuOpen={setIsMenuOpen}>Contact</NavScrollLink></li>
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

      <main>
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={<div className="page-container"><LoginPage /></div>} />
          <Route path="/album/:albumId" element={<div className="page-container"><PublicAlbumPage /></div>} />
          <Route
            path="/dashboard"
            element={
              <div className="page-container">
                <ProtectedRoute user={user} loading={loading}>
                  <DashboardPage user={user} userData={userData} />
                </ProtectedRoute>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}