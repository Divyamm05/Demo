const app = require('./index');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('./index').db;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/check-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Email not found in our records." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60000); // OTP expiration time (1 minute)

    const query = 
      `INSERT INTO otp_records (email, otp, expires_at)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?;`;

    db.query(query, [email, otp, expiresAt, otp, expiresAt], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to save OTP." });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It is valid for 1 minute.`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          return res.status(500).json({ success: false, message: "Failed to send OTP." });
        }
        res.json({ success: true, message: 'OTP sent to your email address.' });
      });
    });
  });
});
