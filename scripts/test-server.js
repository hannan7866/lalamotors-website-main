/**
 * test-server.js
 * --------------
 * PURPOSE : Minimal standalone Express server used to test Nodemailer in isolation,
 *           without booting the full application.
 * WHEN TO RUN : Locally only, to debug email transport issues.
 * HOW TO RUN : GMAIL_USER=... GMAIL_PASS=... node scripts/test-server.js
 *              Then POST to http://localhost:4000/api/send-confirmation
 *
 * ⚠️  Credentials are read from env vars — do NOT hard-code them.
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;

if (!gmailUser || !gmailPass) {
  console.error('❌  Missing GMAIL_USER or GMAIL_PASS env vars.');
  process.exit(1);
}

app.post('/api/send-confirmation', async (req, res) => {
  const { to, subject, html } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  try {
    await transporter.sendMail({ from: `Lala Motors <${gmailUser}>`, to, subject, html });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => {
  console.log('Test server running on port 4000');
});

