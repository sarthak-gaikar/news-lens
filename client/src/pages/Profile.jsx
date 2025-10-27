import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import './Profile.css';

const Profile = () => {
  const { user, logout, reFetchUser } = useAuth(); // --- ADDED reFetchUser ---
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (user) {
      setPreferences(user.preferences || {});
      loadUserStats(); // Load stats when user is available
    }
  }, [user]); // Re-run when user object changes

  // --- UPDATED THIS FUNCTION ---
  const loadUserStats = async () => {
    try {
      // 1. Call the new authService function
      const stats = await authService.getUserStats();
      // 2. Set state with real data
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setUserStats({ totalRead: 0, totalLiked: 0, totalSaved: 0 }); // Set default on error
    }
  };

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // 3. Call the auth service to update
      await authService.updatePreferences(preferences);
      
      // 4. Call reFetchUser to get all new user data
      // This is better than reloading the whole page
      await reFetchUser(); 
      
      setMessage('Preferences updated successfully!');

      setTimeout(() => {
        setMessage('');
      }, 2000); // Hide message after 2 seconds

    } catch (error) {
      setMessage('Error updating preferences. Please try again.');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false); // Stop loading on success or error
    }
  };

  if (!user) {
    return (
      <div className="profile">
        <div className="container">
          <div className="not-signed-in">
            <h2>Please sign in to view your profile</h2>
            <p>You need to be logged in to access your personal preferences and reading history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <div className="user-info">
            <div className="user-avatar-large">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h1>{user.username}</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-outline">
            Logout
          </button>
        </div>

        <div className="profile-content">
          {/* --- UPDATED: Show loading state for stats --- */}
          {!userStats ? (
            <div className="stats-section">
              <h2>Your News Activity</h2>
              <p>Loading stats...</p>
            </div>
          ) : (
            <div className="stats-section">
              <h2>Your News Activity</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{userStats.totalRead}</div>
                  <div className="stat-label">Articles Read</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{userStats.totalLiked}</div>
                  <div className="stat-label">Articles Liked</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{userStats.totalSaved}</div>
                  <div className="stat-label">Articles Saved</div>
                </div>
              </div>
            </div>
          )}

          <div className="preferences-section">
            <h2>News Preferences</h2>
            
            <div className="preference-group">
              <h3>Favorite Topics</h3>
              <div className="topics-grid">
                {['technology', 'politics', 'business', 'entertainment', 'sports', 'health', 'science'].map(topic => (
                  <label key={topic} className="topic-checkbox">
                    <input
                      type="checkbox"
                      checked={(preferences.topics || []).includes(topic)}
                      onChange={(e) => {
                        const newTopics = e.target.checked
                          ? [...(preferences.topics || []), topic]
                          : (preferences.topics || []).filter(t => t !== topic);
                        handlePreferenceChange('topics', newTopics);
                      }}
                    />
                    <span className="checkmark"></span>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {message && (
              <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <button 
              onClick={savePreferences}
              disabled={loading}
              className="btn btn-primary save-btn"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;