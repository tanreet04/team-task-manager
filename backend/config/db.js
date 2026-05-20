const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt local/configured database connection with a short selection timeout
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/team_task_manager', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.MOCK_DB = 'false';
  } catch (error) {
    console.warn('\n======================================================');
    console.warn(`WARNING: Failed to connect to MongoDB (${error.message})`);
    console.warn('The server will run in-memory with a MOCK DB session.');
    console.warn('Create projects, tasks, and users - all updates are saved in RAM.');
    console.warn('======================================================\n');
    process.env.MOCK_DB = 'true';
  }
};

module.exports = connectDB;
