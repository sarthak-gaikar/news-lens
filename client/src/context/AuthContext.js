import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import { newsService } from '../services/news'; // --- ADDED ---

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const reFetchUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      reFetchUser().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user); // This now includes liked/saved arrays
      localStorage.setItem('token', response.token);
      setShowLoginModal(false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password);
      setUser(response.user); // This now includes liked/saved arrays
      localStorage.setItem('token', response.token);
      setShowRegisterModal(false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  // --- NEW INTERACTION HELPERS ---

  const isArticleLiked = (articleId) => {
    return user?.likedArticles?.includes(articleId) || false;
  };

  const isArticleSaved = (articleId) => {
    return user?.savedArticles?.includes(articleId) || false;
  };

  // --- NEW INTERACTION HANDLERS ---

  const toggleLike = async (articleId) => {
    if (!user) return;
    
    // Optimistic UI Update: Update state first
    const originalUser = { ...user };
    const isLiked = isArticleLiked(articleId);
    
    const newLikedArticles = isLiked
      ? user.likedArticles.filter(id => id !== articleId)
      : [...user.likedArticles, articleId];

    setUser(prevUser => ({
      ...prevUser,
      likedArticles: newLikedArticles
    }));

    // Then, call the API
    try {
      await newsService.toggleInteraction(articleId, 'like');
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setUser(originalUser); // Rollback on error
    }
  };

  const toggleSave = async (articleId) => {
    if (!user) return;
    
    // Optimistic UI Update
    const originalUser = { ...user };
    const isSaved = isArticleSaved(articleId);

    const newSavedArticles = isSaved
      ? user.savedArticles.filter(id => id !== articleId)
      : [...user.savedArticles, articleId];

    setUser(prevUser => ({
      ...prevUser,
      savedArticles: newSavedArticles
    }));

    // API call
    try {
      await newsService.toggleInteraction(articleId, 'save');
    } catch (error) {
      console.error('Failed to toggle save:', error);
      setUser(originalUser); // Rollback
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    reFetchUser,
    showLoginModal,
    setShowLoginModal,
    showRegisterModal,
    setShowRegisterModal,
    // --- ADD NEW VALUES ---
    isArticleLiked,
    isArticleSaved,
    toggleLike,
    toggleSave
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};