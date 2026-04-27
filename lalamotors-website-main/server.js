const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyH1CI_U4H4B8rqHH5mNc3d_5JviA6z6QcaWT72R-sl2SFdZ4lldraWF_6wuNu1pI_CXw/exec';

app.post('/api/booking', async (req, res) => {
  try {
    // Forward the booking data to Google Apps Script
    const response = await axios.post(GOOGLE_SCRIPT_URL, req.body);
    console.log('Apps Script response:', response.data);
    res.status(response.status).send(response.data);
  } catch (err) {
    res.status(500).send('Error: ' + (err.response ? err.response.data : err.message));
  }
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// Serve static files from the project root (AFTER API routes)
app.use(express.static(path.join(__dirname, '/')));

app.listen(3001, () => console.log('Server running on port 3001'));