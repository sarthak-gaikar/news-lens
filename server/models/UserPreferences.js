const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  preferredCategories: { 
    type: [String], 
    default: ['technology', 'politics', 'business'] 
  },
  preferredSources: { 
    type: [String], 
    default: [] 
  },
  biasPreferences: {
    showLeft: { type: Boolean, default: true },
    showCenter: { type: Boolean, default: true },
    showRight: { type: Boolean, default: true },
    showNeutral: { type: Boolean, default: true }
  },
  dislikedArticles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Article' 
  }],
  likedArticles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Article' 
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('UserPreference', userPreferenceSchema);