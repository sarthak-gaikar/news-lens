const app = require('./app');
const connectDB = require('./utils/database');
const newsScheduler = require('./services/newsScheduler');

const PORT = process.env.PORT || 5000;

// Server startup function
const startServer = async () => {
  try {
    console.log('🚀 Starting NewsLens Server...');
    console.log('📁 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔧 Port:', PORT);
    
    // Connect to database
    await connectDB();
    
    // Start news scheduler
    if (process.env.ENABLE_SCHEDULER !== 'false') {
      newsScheduler.start();
    } else {
      console.log('⏸️  News scheduler disabled via environment variable');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
      console.log('📰 NewsLens Backend is ready!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  newsScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  newsScheduler.stop();
  process.exit(0);
});

// Start the server
startServer();