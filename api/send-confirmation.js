require('dotenv').config();
const nodemailer = require('nodemailer');

// In-memory sliding window rate limiter per IP (suitable for serverless instances)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip) || [];
    const validTimestamps = clientRecord.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    
    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return true;
    }
    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    return false;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const MAX_LENS = { name: 50, service: 60, date: 15, time: 15, phone: 20 };

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    // IP rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
    }

    const { name, email, phone, service, date, time } = req.body || {};

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length > MAX_LENS.name) {
        return res.status(400).json({ success: false, error: `Invalid name (max ${MAX_LENS.name} chars required).` });
    }
    if (!service || typeof service !== 'string' || service.trim().length > MAX_LENS.service) {
        return res.status(400).json({ success: false, error: `Invalid service (max ${MAX_LENS.service} chars required).` });
    }
    if (!date || typeof date !== 'string' || date.trim().length > MAX_LENS.date) {
        return res.status(400).json({ success: false, error: 'Valid date is required.' });
    }
    if (!time || typeof time !== 'string' || time.trim().length > MAX_LENS.time) {
        return res.status(400).json({ success: false, error: 'Valid time is required.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length > MAX_LENS.phone) {
        return res.status(400).json({ success: false, error: `Valid phone number required (max ${MAX_LENS.phone} chars).` });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
        return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const safeName = escapeHtml(name.trim());
    const safeService = escapeHtml(service.trim());
    const safeDate = escapeHtml(date.trim());
    const safeTime = escapeHtml(time.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeEmail = email.trim().toLowerCase();

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = (process.env.GMAIL_PASS || '').replace(/\s+/g, '');
    const shopEmail = process.env.SHOP_EMAIL || gmailUser;

    if (!gmailUser || !gmailPass) {
        return res.status(500).json({ success: false, error: 'Email service configuration error on server.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPass,
        },
    });

    const customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0066cc;">Booking Confirmation – Lala Motors</h2>
            <p>Dear <strong>${safeName}</strong>,</p>
            <p>Thank you for booking with Lala Motors. We have received your appointment request with the following details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9; font-weight: bold;">Service</td><td style="padding: 8px; border: 1px solid #eee;">${safeService}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9; font-weight: bold;">Date</td><td style="padding: 8px; border: 1px solid #eee;">${safeDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9; font-weight: bold;">Time</td><td style="padding: 8px; border: 1px solid #eee;">${safeTime}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee; background: #f9f9f9; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #eee;">${safePhone}</td></tr>
            </table>
            <p>Our workshop team will contact you shortly if any adjustments are needed.</p>
            <p style="color: #666; font-size: 0.9em;">Lala Motors • Premium Motorcycle Services & Spares</p>
        </div>
    `;

    const shopHtml = `
        <div style="font-family: Arial, sans-serif; padding: 15px;">
            <h2>New Service Booking Alert</h2>
            <p>A new customer booking has been received:</p>
            <ul>
                <li><strong>Customer:</strong> ${safeName}</li>
                <li><strong>Email:</strong> ${safeEmail}</li>
                <li><strong>Phone:</strong> ${safePhone}</li>
                <li><strong>Service:</strong> ${safeService}</li>
                <li><strong>Date / Time:</strong> ${safeDate} at ${safeTime}</li>
            </ul>
        </div>
    `;

    try {
        // Send confirmation email to the customer
        await transporter.sendMail({
            from: `"Lala Motors" <${gmailUser}>`,
            to: safeEmail,
            subject: `Booking Confirmed: ${safeService} on ${safeDate}`,
            html: customerHtml,
        });

        // Send notification email to the shop owner
        await transporter.sendMail({
            from: `"Lala Motors Booking System" <${gmailUser}>`,
            to: shopEmail,
            subject: `New Service Booking: ${safeService} - ${safeName}`,
            html: shopHtml,
        });

        return res.status(200).json({ success: true, message: 'Booking confirmation emails sent successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to send confirmation email. Please contact support.' });
    }
};
