require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router(); // Use an Express Router

// --- Nodemailer Transporter Setup ---
// This transporter uses the same environment variables from your .env file
// IMPORTANT: You MUST use a Google "App Password" for GMAIL_PASS.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // This MUST be the 16-character App Password.
    },
});

/**
 * @route   POST /send-confirmation
 * @desc    Sends a confirmation email to the customer and a notification to the business.
 * @access  Public
 */
router.post('/send-confirmation', async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, error: 'Missing required email fields: to, subject, html.' });
    }

    console.log(`Received email request for: ${to}`);

    try {
        // 1. Send confirmation email to the customer
        await transporter.sendMail({
            from: `"Lala Motors" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });
        console.log(`Confirmation email successfully sent to ${to}.`);

        // 2. Send notification email to the business owner
        await transporter.sendMail({
            from: `"Lala Motors Booking System" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Sends to your own email
            subject: `New Service Booking: ${subject}`,
            html: `<h1>New Booking Notification</h1>
                   <p>A new service has been booked by <strong>${to}</strong>.</p>
                   <hr>
                   ${html}`,
        });
        console.log(`Business notification successfully sent to ${process.env.GMAIL_USER}.`);

        res.status(200).json({ success: true, message: 'Confirmation and notification emails sent successfully.' });
    } catch (err) {
        console.error('Nodemailer send error:', err);
        res.status(500).json({ success: false, error: 'Failed to send confirmation email. Please check server logs.' });
    }
});

// Export the router so it can be used in server.js
module.exports = router;
