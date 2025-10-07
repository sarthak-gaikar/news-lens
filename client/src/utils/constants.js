// Application constants
export const BIAS_COLORS = {
  left: '#ea4335',
  center: '#fbbc05', 
  right: '#1a73e8',
  neutral: '#34a853'
};

export const BIAS_LABELS = {
  left: 'Left Leaning',
  center: 'Center',
  right: 'Right Leaning', 
  neutral: 'Neutral'
};

export const CATEGORIES = [
  'technology',
  'politics', 
  'business',
  'entertainment',
  'sports',
  'health',
  'science',
  'general'
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  NEWS: {
    FEED: '/news/feed',
    CATEGORIES: '/news/categories',
    SOURCES: '/news/sources',
    BIAS_STATS: '/news/bias-stats',
    REFRESH: '/news/refresh',
    ARTICLE: '/news/article'
  },
  USERS: {
    PREFERENCES: '/users/preferences',
    HISTORY: '/users/history',
    INTERACTION: '/users/interaction',
    STATS: '/users/stats'
  }
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_PREFERENCES: 'user_preferences'
};