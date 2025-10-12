import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

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

  // This new function handles fetching the user profile and setting the state.
  // It will be our single source for getting the latest user data.
  const reFetchUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If fetching fails (e.g., invalid token), log the user out.
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use the new function on initial app load.
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
      setUser(response.user);
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
      setUser(response.user);
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

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    reFetchUser, // We now provide the reFetchUser function
    showLoginModal,
    setShowLoginModal,
    showRegisterModal,
    setShowRegisterModal
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};