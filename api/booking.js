require('dotenv').config();
const axios = require('axios');

// Google Script URL for booking
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH1CI_U4H4B8rqHH5mNc3d_5JviA6z6QcaWT72R-sl2SFdZ4lldraWF_6wuNu1pI_CXw/exec';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const response = await axios.post(GOOGLE_SCRIPT_URL, req.body);
        res.status(response.status).json(response.data);
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({
            error: 'Failed to process booking',
            message: err.response ? err.response.data : err.message
        });
    }
};