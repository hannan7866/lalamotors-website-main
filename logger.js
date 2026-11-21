/**
 * logger.js
 * ---------
 * Minimal structured logger for the Node.js backend (server.js, api/, routes/).
 *
 * Behaviour:
 *   - In production (NODE_ENV=production): only log WARN and ERROR.
 *   - In development: log INFO, WARN, and ERROR with timestamps.
 *   - ERROR always goes to console.error so it appears in Vercel function logs.
 *
 * Usage:
 *   const logger = require('./logger');
 *   logger.info('Server started on port', 3001);
 *   logger.warn('Gmail fallback triggered');
 *   logger.error('Booking failed', err);
 */

'use strict';

const isProd = process.env.NODE_ENV === 'production';

function fmt(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level}]`, ...args];
}

const logger = {
  info(...args) {
    if (!isProd) console.log(...fmt('INFO ', args));
  },
  warn(...args) {
    console.warn(...fmt('WARN ', args));
  },
  error(...args) {
    console.error(...fmt('ERROR', args));
  },
};

module.exports = logger;

