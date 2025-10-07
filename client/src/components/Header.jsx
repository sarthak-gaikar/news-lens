import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, setShowLoginModal, setShowRegisterModal } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">📰</span>
            <span className="logo-text">NewsLens</span>
          </Link>

          <nav className="nav-links">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/news" 
              className={`nav-link ${isActive('/news') ? 'active' : ''}`}
            >
              News Feed
            </Link>
            {user && (
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
            )}
          </nav>

          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <button 
                  className="user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.username}</span>
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">
                      Profile & Preferences
                    </Link>
                    <button onClick={logout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;