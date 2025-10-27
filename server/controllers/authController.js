const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to create a sanitized user object for the frontend.
const sanitizeUser = (user) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    preferences: user.preferences,
  };
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
        });
      }

      // Create a new user instance.
      const user = new User({ username, email, password });
      
      // Save the user to the database.
      await user.save();

      // IMPORTANT FIX: After saving, the 'user' object has the complete data,
      // including default preferences set by the Mongoose schema.
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: sanitizeUser(user) // Send the complete, sanitized user object.
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'An error occurred during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find the user and exclude the password from the result.
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: sanitizeUser(user) // Send the sanitized user object.
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'An error occurred during login.' });
    }
  },

  async getProfile(req, res) {
    try {
      // The user object is attached to req.user by the auth middleware.
      if (!req.user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({
        user: sanitizeUser(req.user)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile.' });
    }
  }
};

module.exports = authController;