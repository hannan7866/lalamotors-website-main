/**
 * test-client.js
 * --------------
 * PURPOSE : Sends a sample POST to the local /api/send-confirmation endpoint
 *           to verify the email pipeline works end-to-end.
 * WHEN TO RUN : Locally only, with the dev server running (`npm run dev`).
 * HOW TO RUN : node scripts/test-client.js
 *
 * ⚠️  Sends a real email via Gmail.  Use a test address in `to`.
 */

require('dotenv').config();
const axios = require('axios');

const data = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '9999999999',
  service: 'General Servicing',
  date: '2024-01-15',
  time: '10:00',
};

axios
  .post('http://localhost:3001/api/send-confirmation', data)
  .then((response) => {
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  });

