require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const logger = require('../logger');

// --- Guard required env vars ---
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS ? process.env.GMAIL_PASS.replace(/\s+/g, '') : '';
const shopEmail = process.env.SHOP_EMAIL || gmailUser;

if (!gmailUser) logger.warn('[email route] GMAIL_USER not set — email will fail');
if (!gmailPass) logger.warn('[email route] GMAIL_PASS not set — email will fall back to Ethereal');

// --- Input validation helpers ---
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX = { name: 50, service: 60, date: 10, time: 10, phone: 20 };

function validateBookingFields(body) {
  const errors = [];
  const { name, service, date, time, email, phone } = body;

  if (!name || name.length > MAX.name)       errors.push(`name required, max ${MAX.name} chars`);
  if (!service || service.length > MAX.service) errors.push(`service required, max ${MAX.service} chars`);
  if (!date || date.length > MAX.date)       errors.push(`date required, max ${MAX.date} chars`);
  if (!time || time.length > MAX.time)       errors.push(`time required, max ${MAX.time} chars`);
  if (!phone || phone.length > MAX.phone)    errors.push(`phone required, max ${MAX.phone} chars`);
  if (!email || !EMAIL_RE.test(email))       errors.push('valid email required');

  return errors;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailHtml({ name, service, date, time, phone, email }) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
      <h2 style="color:#0066cc;">Booking Confirmation – Lala Motors</h2>
      <p>Dear <strong>${escapeHtml(name)}</strong>,</p>
      <p>Your service booking has been received. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Service</td>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(service)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Date</td>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(date)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Time</td>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(time)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Phone</td>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(phone)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;">Email</td>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(email)}</td></tr>
      </table>
      <p>Our team will reach out to confirm your appointment. Thank you for choosing Lala Motors!</p>
      <p style="font-size:0.85em;color:#888;">If you did not make this booking, please ignore this email.</p>
    </div>
  `;
}

/**
 * POST /api/send-confirmation
 * Accepts: { name, email, phone, service, date, time }
 * Sends a confirmation email to the customer and a notification to the shop.
 */
router.post('/send-confirmation', async (req, res) => {
  const errors = validateBookingFields(req.body || {});
  if (errors.length) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors });
  }

  const fields = {
    name:    req.body.name.trim(),
    email:   req.body.email.trim().toLowerCase(),
    phone:   req.body.phone.trim(),
    service: req.body.service.trim(),
    date:    req.body.date.trim(),
    time:    req.body.time.trim(),
  };

  const html = buildEmailHtml(fields);

  logger.info(`[email] Booking confirmation requested for ${fields.email}`);

  // --- Try Gmail, fall back to Ethereal in development ---
  const trySendWithGmail = async () => {
    if (!gmailPass) throw new Error('GMAIL_PASS not set');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    const info = await transporter.sendMail({
      from: `"Lala Motors" <${gmailUser}>`,
      to: fields.email,
      subject: `Booking Confirmed – ${fields.service} on ${fields.date}`,
      html,
    });
    logger.info(`[email] Customer confirmation sent (${info.messageId})`);

    await transporter.sendMail({
      from: `"Lala Motors Bookings" <${gmailUser}>`,
      to: shopEmail,
      subject: `New Booking: ${fields.service} – ${fields.name}`,
      html: `<h2>New Booking</h2><p>Customer: <strong>${escapeHtml(fields.name)}</strong> (${escapeHtml(fields.email)})</p>${html}`,
    });
    logger.info('[email] Shop notification sent');
    return { channel: 'gmail', messageId: info.messageId };
  };

  const sendWithFallback = async () => {
    logger.warn('[email] Falling back to Ethereal test mailer');
    const testAccount = await nodemailer.createTestAccount();
    const fallback = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await fallback.sendMail({
      from: `"Lala Motors" <${gmailUser}>`,
      to: fields.email,
      subject: `Booking Confirmed – ${fields.service}`,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logger.info(`[email] Ethereal preview: ${previewUrl}`);
    return { channel: 'fallback', previewUrl, messageId: info.messageId };
  };

  try {
    let result;
    try {
      result = await trySendWithGmail();
    } catch (gmailErr) {
      logger.warn(`[email] Gmail error: ${gmailErr.message} — switching to fallback`);
      result = await sendWithFallback();
    }
    res.status(200).json({ success: true, delivery: result });
  } catch (err) {
    logger.error('[email] All delivery attempts failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send confirmation email' });
  }
});

module.exports = router;
