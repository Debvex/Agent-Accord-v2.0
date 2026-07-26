const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file (with built-in fallback parser if dotenv is not installed)
try {
  require('dotenv').config();
} catch (e) {
  // Manual parse fallback if dotenv package is not installed
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

const {
  createHistory,
  getAllHistory,
  getHistoryById,
  deleteHistory,
} = require('./controller/db_controller');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/history_db';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'MongoDB Express Server is running',
  });
});

// API Routes for History
app.post('/api/history', createHistory);
app.get('/api/history', getAllHistory);
app.get('/api/history/:id', getHistoryById);
app.delete('/api/history/:id', deleteHistory);

// Connect to MongoDB & Start Server
const connectDBAndStartServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB successfully at: ${MONGO_URI}`);

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

// Start the server if file is executed directly
if (require.main === module) {
  connectDBAndStartServer();
}

module.exports = { app, connectDBAndStartServer };
