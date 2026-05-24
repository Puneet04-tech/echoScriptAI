const dotenv = require('dotenv');

// Load environment variables FIRST before any other imports
dotenv.config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'EchoScriptAI Backend Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
