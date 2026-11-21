require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const logger = require('./logger');

const app = express();

// --- Guard required env vars ---
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
if (!GOOGLE_SCRIPT_URL) {
  logger.error('Missing GOOGLE_SCRIPT_URL environment variable. Bookings will fail.');
}

const PORT = process.env.PORT || 3001;

logger.info(`Starting server with NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// --- CORS ---
// In production: restrict to the site origin set in env.
// In development: also allow localhost.
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CORS_ORIGIN].filter(Boolean)
  : [
      process.env.CORS_ORIGIN,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json({ limit: '50kb' }));

// --- Static files ---
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
  },
}));

// --- Health check ---
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// --- API: email routes (local dev; Vercel uses /api/send-confirmation.js) ---
const emailRoutes = require('./routes/email');
app.use('/api', emailRoutes);

// --- API: booking forwarding ---
const BOOKING_FIELDS = ['name', 'email', 'phone', 'service', 'date', 'time'];
const MAX_FIELD_LEN = 200;

app.post('/api/booking', async (req, res) => {
  // Method guard (belt-and-suspenders; Express already enforces this)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Validate required fields
  const body = req.body || {};
  const missing = BOOKING_FIELDS.filter((f) => !body[f] || typeof body[f] !== 'string' || !body[f].trim());
  if (missing.length) {
    return res.status(400).json({ error: 'Invalid request', missing });
  }

  // Length-limit each field
  const oversized = BOOKING_FIELDS.filter((f) => body[f].length > MAX_FIELD_LEN);
  if (oversized.length) {
    return res.status(400).json({ error: 'Field value too long', fields: oversized });
  }

  if (!GOOGLE_SCRIPT_URL) {
    logger.error('Booking attempted but GOOGLE_SCRIPT_URL is not set');
    return res.status(500).json({ error: 'Booking service unavailable' });
  }

  // Forward only the validated fields
  const payload = Object.fromEntries(BOOKING_FIELDS.map((f) => [f, body[f].trim()]));

  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, payload, { timeout: 10000 });
    logger.info(`Booking forwarded for ${payload.email}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    logger.error('Booking forwarding failed:', err.message);
    res.status(500).json({ error: 'Failed to process booking' });
  }
});

// --- Services directory ---
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
  },
}));

// Redirect /services/admin → /services/admin.html
app.get('/services/admin', (_req, res) => {
  res.redirect('/services/admin.html');
});

// --- Catch-all SPA fallback ---
app.get('*', (req, res) => {
  if (path.extname(req.path)) return res.status(404).send('Not found');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Export for Vercel
module.exports = app;

// Run locally only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
