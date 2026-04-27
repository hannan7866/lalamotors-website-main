
const axios = require('axios');

const data = {
  to: 'lalamotors1@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
  html: '<h1>Test Email</h1><p>This is a test email.</p>'
};

axios.post('http://localhost:3001/api/send-confirmation', data)
  .then(response => {
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  });

  