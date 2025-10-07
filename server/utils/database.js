const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newslens', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure MongoDB is running on your system');
      console.log('💡 You can install it from: https://www.mongodb.com/try/download/community');
      console.log('💡 Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;