const User = require('../models/User');

const userController = {
  // --- NEW FUNCTION TO HANDLE LIKES AND SAVES ---
  async toggleInteraction(req, res) {
    try {
      const { articleId, interactionType } = req.body; // 'like' or 'save'
      const userId = req.user._id;

      if (!['like', 'save'].includes(interactionType)) {
        return res.status(400).json({ success: false, message: 'Invalid interaction type' });
      }

      const user = await User.findById(userId);
      let isInteracted;

      if (interactionType === 'like') {
        const index = user.likedArticles.indexOf(articleId);
        if (index > -1) {
          // Article is already liked, so remove it (un-like)
          user.likedArticles.splice(index, 1);
          isInteracted = false;
        } else {
          // Article is not liked, so add it
          user.likedArticles.push(articleId);
          isInteracted = true;
        }
      } else if (interactionType === 'save') {
        const index = user.savedArticles.indexOf(articleId);
        if (index > -1) {
          // Article is already saved, so remove it (un-save)
          user.savedArticles.splice(index, 1);
          isInteracted = false;
        } else {
          // Article is not saved, so add it
          user.savedArticles.push(articleId);
          isInteracted = true;
        }
      }

      await user.save();
      
      // Send back the user's updated interaction arrays
      res.json({
        success: true,
        message: 'Interaction toggled successfully',
        likedArticles: user.likedArticles,
        savedArticles: user.savedArticles
      });

    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // --- NEW FUNCTION FOR THE PROFILE PAGE STATS ---
  async getUserStats(req, res) {
    try {
      // req.user is already populated by our auth middleware
      const user = req.user; 

      // We can just get the lengths of the arrays
      const stats = {
        totalRead: user.readingHistory.length,
        totalLiked: user.likedArticles.length,
        totalSaved: user.savedArticles.length
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // --- Your existing functions below ---

  async updatePreferences(req, res) {
    try {
      const { topics, sources, biasFilter } = req.body;

      const updateData = {};
      
      if (topics) updateData['preferences.topics'] = topics;
      if (sources) updateData['preferences.sources'] = sources;
      if (biasFilter) updateData['preferences.biasFilter'] = biasFilter;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          preferences: user.preferences,
          // Send back new arrays so context can update
          likedArticles: user.likedArticles,
          savedArticles: user.savedArticles
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async getReadingHistory(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate('readingHistory.articleId')
        .select('readingHistory');

      res.json({
        success: true,
        data: user.readingHistory.slice(0, 50) // Last 50 articles
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  async trackInteraction(req, res) {
    try {
      const { articleId, interaction } = req.body; // interaction: 'read'

      // This function is now *only* for tracking 'read' events
      if (interaction !== 'read') {
        return res.status(400).json({ 
          success: false,
          message: 'This route is only for tracking read interactions. Use /toggle-interaction for likes/saves.' 
        });
      }

      // Check if this article has already been read
      const user = await User.findById(req.user._id);
      const hasRead = user.readingHistory.some(entry => entry.articleId.equals(articleId));

      if (!hasRead) {
        // Only push if it hasn't been read before
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            readingHistory: {
              articleId,
              readAt: new Date(),
              interaction: 'read'
            }
          }
        });
      }

      res.json({
        success: true,
        message: 'Interaction tracked successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
};

module.exports = userController;