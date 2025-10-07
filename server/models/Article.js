const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  source: { 
    type: String, 
    required: true,
    trim: true
  },
  url: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  publishedAt: { 
    type: Date, 
    default: Date.now 
  },
  category: { 
    type: String, 
    default: 'general',
    enum: ['general', 'technology', 'politics', 'business', 'entertainment', 'sports', 'health', 'science']
  },
  bias: {
    score: { 
      type: Number, 
      min: -1, 
      max: 1,
      default: 0
    },
    label: { 
      type: String, 
      enum: ['left', 'center', 'right', 'neutral'],
      default: 'neutral'
    },
    confidence: { 
      type: Number, 
      min: 0, 
      max: 1,
      default: 0
    },
    keywords: [String]
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ 'bias.label': 1 });
articleSchema.index({ source: 1 });
articleSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Article', articleSchema);