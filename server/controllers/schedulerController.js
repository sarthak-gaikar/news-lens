const newsScheduler = require('../services/newsScheduler');

const schedulerController = {
  async getStatus(req, res) {
    try {
      const status = newsScheduler.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async startScheduler(req, res) {
    try {
      newsScheduler.start();
      res.json({
        success: true,
        message: 'News scheduler started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async stopScheduler(req, res) {
    try {
      newsScheduler.stop();
      res.json({
        success: true,
        message: 'News scheduler stopped successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  async manualFetch(req, res) {
    try {
      const count = await newsScheduler.manualFetch();
      res.json({
        success: true,
        message: `Manual fetch completed - processed ${count} articles`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = schedulerController;