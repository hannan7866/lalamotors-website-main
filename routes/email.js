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

    const gmailUser = process.env.GMAIL_USER || 'lalamotors1@gmail.com';
    const gmailPass = process.env.GMAIL_PASS;

    console.log(`[Email] Received email request for: ${to}`);

    // Helper to send using Gmail
    const trySendWithGmail = async () => {
        if (!gmailPass) {
            throw new Error('GMAIL_PASS is not set in .env');
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });

        const customerInfo = await transporter.sendMail({
            from: `"Lala Motors" <${gmailUser}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });
        console.log(`[Email] Gmail confirmation sent to ${to}: ${customerInfo.messageId}`);

        await transporter.sendMail({
            from: `"Lala Motors Booking System" <${gmailUser}>`,
            to: gmailUser,
            subject: `New Service Booking: ${subject}`,
            html: `<h1>New Booking Notification</h1>
                   <p>A new service has been booked by <strong>${to}</strong>.</p>
                   <hr>
                   ${html}`,
        });
        console.log(`[Email] Gmail business notification sent to ${gmailUser}`);
        return { channel: 'gmail', messageId: customerInfo.messageId };
    };

    // Helper fallback using Ethereal Test Mailer
    const sendWithFallback = async () => {
        console.log('[Email] Using automatic Ethereal email fallback service...');
        const testAccount = await nodemailer.createTestAccount();
        const fallbackTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await fallbackTransporter.sendMail({
            from: `"Lala Motors" <${gmailUser}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email] Fallback email sent! Preview URL: ${previewUrl}`);
        return { channel: 'fallback', previewUrl, messageId: info.messageId };
    };

    try {
        let result;
        try {
            result = await trySendWithGmail();
        } catch (gmailErr) {
            console.warn(`[Email] Gmail SMTP error (${gmailErr.message}). Switching to fallback delivery...`);
            result = await sendWithFallback();
        }

        res.status(200).json({
            success: true,
            message: 'Confirmation email processed successfully.',
            delivery: result
        });
    } catch (err) {
        console.error('[Email] All email delivery attempts failed:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to send confirmation email: ' + err.message
        });
    }
});

// Export the router so it can be used in server.js
module.exports = router;
