const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/send-confirmation', async (req, res) => {
  const { to, subject, text, html } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lalamotors1@gmail.com',
      pass: 'ygcrzfykavvzcskf'
    }
  });

  try {
    await transporter.sendMail({
      from: 'Lala Motors <lalamotors1@gmail.com>',
      to,
      subject,
      text,
      html
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => {
  console.log('Test server running on port 4000');
});