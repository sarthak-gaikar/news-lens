import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (user && user.preferences) {
      setPreferences(user.preferences);
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // This is mock data and would typically come from a user stats endpoint
      const stats = {
        totalRead: 42,
        totalLiked: 15,
        totalSaved: 8,
      };
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleBiasFilterChange = (bias, enabled) => {
    setPreferences(prev => ({
      ...prev,
      biasFilter: {
        ...(prev.biasFilter || {}),
        [bias]: enabled
      }
    }));
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      setMessage('');
      await authService.updatePreferences(preferences);
      setMessage('Preferences updated successfully!');

      // Refresh the page to load the new preferences
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Wait 1 second to allow the user to read the message

    } catch (error) {
      setMessage('Error updating preferences. Please try again.');
      console.error('Error saving preferences:', error);
      setLoading(false); // Stop loading if there's an error
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
          {userStats && (
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

            <div className="preference-group">
              <h3>Bias Preferences</h3>
              <p className="preference-description">
                Choose which political perspectives you want to see in your news feed:
              </p>
              <div className="bias-preferences">
                <label className="bias-preference">
                  <input
                    type="checkbox"
                    checked={preferences.biasFilter?.left ?? true}
                    onChange={(e) => handleBiasFilterChange('left', e.target.checked)}
                  />
                  <span className="bias-indicator bias-left"></span>
                  Left Leaning
                </label>
                <label className="bias-preference">
                  <input
                    type="checkbox"
                    checked={preferences.biasFilter?.center ?? true}
                    onChange={(e) => handleBiasFilterChange('center', e.target.checked)}
                  />
                  <span className="bias-indicator bias-center"></span>
                  Center
                </label>
                <label className="bias-preference">
                  <input
                    type="checkbox"
                    checked={preferences.biasFilter?.right ?? true}
                    onChange={(e) => handleBiasFilterChange('right', e.target.checked)}
                  />
                  <span className="bias-indicator bias-right"></span>
                  Right Leaning
                </label>
                <label className="bias-preference">
                  <input
                    type="checkbox"
                    checked={preferences.biasFilter?.neutral ?? true}
                    onChange={(e) => handleBiasFilterChange('neutral', e.target.checked)}
                  />
                  <span className="bias-indicator bias-neutral"></span>
                  Neutral
                </label>
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