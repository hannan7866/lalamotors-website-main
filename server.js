require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

// Log the environment for debugging
console.log(`Starting server with NODE_ENV: ${process.env.NODE_ENV}`);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files with correct MIME types and caching
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Environment variables
const PORT = process.env.PORT || 3001;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH1CI_U4H4B8rqHH5mNc3d_5JviA6z6QcaWT72R-sl2SFdZ4lldraWF_6wuNu1pI_CXw/exec';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
// API Routes for local development
// Production uses serverless functions from the /api directory
const emailRoutes = require('./routes/email');
app.use('/api', emailRoutes);

app.post('/api/booking', async (req, res) => {
  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, req.body);
    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(500).send({
      error: 'Failed to process booking',
      message: err.response ? err.response.data : err.message
    });
  }
});



// Serve files from services directory
app.use('/services', express.static(path.join(__dirname, 'services'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Redirect /services/admin to /services/admin.html
app.get('/services/admin', (req, res) => {
  res.redirect('/services/admin.html');
});

// Handle HTML5 history API for SPA
app.get('*', (req, res) => {
  // Check if the request is for a static file
  const ext = path.extname(req.path);
  if (ext) {
    // If it's a static file that wasn't found, return 404
    res.status(404).send('Not found');
  } else {
    // For all other requests, serve index.html
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export the app for Vercel
module.exports = app;

// Only run the server locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}