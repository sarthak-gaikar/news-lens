const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  preferences: {
    topics: { 
      type: [String], 
      default: ['technology', 'politics', 'business', 'entertainment'] 
    },
    sources: { 
      type: [String], 
      default: [] 
    },
    biasFilter: {
      left: { type: Boolean, default: true },
      center: { type: Boolean, default: true },
      right: { type: Boolean, default: true },
      neutral: { type: Boolean, default: true }
    }
  },
  readingHistory: [{
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    readAt: { type: Date, default: Date.now },
    interaction: { type: String, enum: ['read', 'liked', 'saved'], default: 'read' }
  }]
}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);