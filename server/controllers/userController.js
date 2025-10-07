const User = require('../models/User');

const userController = {
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
          preferences: user.preferences
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
      const { articleId, interaction } = req.body; // interaction: 'read', 'liked', 'saved'

      if (!['read', 'liked', 'saved'].includes(interaction)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid interaction type' 
        });
      }

      // Update or add to reading history
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            articleId,
            readAt: new Date(),
            interaction
          }
        }
      });

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