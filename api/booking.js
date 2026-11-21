require('dotenv').config();
const axios = require('axios');

const REQUIRED_FIELDS = ['name', 'email', 'phone', 'service', 'date', 'time'];
const MAX_FIELD_LEN = 200;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
        return res.status(500).json({ success: false, error: 'Booking service configuration error.' });
    }

    const body = req.body || {};

    // Validate required fields exist and are strings
    for (const field of REQUIRED_FIELDS) {
        if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
            return res.status(400).json({ success: false, error: `Field '${field}' is required.` });
        }
        if (body[field].length > MAX_FIELD_LEN) {
            return res.status(400).json({ success: false, error: `Field '${field}' exceeds maximum length.` });
        }
    }

    if (!EMAIL_RE.test(body.email.trim())) {
        return res.status(400).json({ success: false, error: 'Invalid email address provided.' });
    }

    // Build sanitised payload containing only expected fields
    const sanitizedPayload = {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        service: body.service.trim(),
        date: body.date.trim(),
        time: body.time.trim(),
        bike_model: typeof body.bike_model === 'string' ? body.bike_model.trim().slice(0, MAX_FIELD_LEN) : '',
        notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : ''
    };

    try {
        const response = await axios.post(scriptUrl, sanitizedPayload, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        });
        return res.status(response.status || 200).json({ success: true, data: response.data });
    } catch (err) {
        return res.status(502).json({
            success: false,
            error: 'Failed to record booking with Google Sheets integration.'
        });
    }
};
