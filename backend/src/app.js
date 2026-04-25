const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const driveRoutes = require('./routes/driveRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedRoutes = require('./routes/feedRoutes');


dotenv.config();

const app = express();

// Enable CORS for all origins and methods to support mobile testing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-google-access-token', 'google-access-token']
}));

// Test Route to verify proxy connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend Proxy is Working! ✅', port: 5000 });
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drive', driveRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
