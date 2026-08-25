require('dotenv').config();
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { to, subject, text, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, error: 'Missing required email fields: to, subject, html.' });
    }

    const gmailUser = process.env.GMAIL_USER || 'lalamotors1@gmail.com';
    const gmailPass = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPass,
        },
    });

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
        console.log(`Notification email sent to business owner.`);

        res.status(200).json({ success: true, message: 'Emails sent successfully.' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email.', details: error.message });
    }
};