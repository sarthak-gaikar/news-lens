import api from './api';

export const newsService = {
  async getPublicNewsFeed(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/news/public-feed?${params}`);
    return response.data;
  },

  /**
   * --- NEW FUNCTION ---
   * Gets the public preview feed (3 articles per category)
   */
  async getPublicPreviewFeed() {
    // No filters needed, it's a fixed preview
    const response = await api.get('/news/public-preview');
    return response.data;
  },
  
  async getNewsFeed(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/news/feed?${params}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/news/categories');
    return response.data.data;
  },

  async getSources() {
    const response = await api.get('/news/sources');
    return response.data.data;
  },

  async getBiasStats() {
    const response = await api.get('/news/bias-stats');
    return response.data.data;
  },

  async refreshNews() {
    const response = await api.get('/news/refresh');
    return response.data;
  },

  async getArticle(id) {
    const response = await api.get(`/news/article/${id}`);
    return response.data.data;
  },

  async trackInteraction(articleId, interaction) {
    const response = await api.post('/users/interaction', { articleId, interaction });
    return response.data;
  }
};