import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(username, email, password) {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  async updatePreferences(preferences) {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // --- ADD THIS NEW FUNCTION ---
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data.data; // We want the data object
  }
};