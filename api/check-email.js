const app = require('./index');  // Import Express app from index.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('./index');  // Import PostgreSQL connection pool

// Set up email transporter with nodemailer (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Define the /api/check-email endpoint
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;

  console.log(`Received email for OTP request: ${email}`);

  // Validate if email is provided
  if (!email) {
    console.error('Email is missing in the request');
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  // Check if the email is in the correct format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Invalid email format:', email);
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }

  // Check if the email exists in the PostgreSQL database
  pool.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (result.rows.length === 0) {
      console.warn(`Email not found in the database: ${email}`);
      return res.status(404).json({ success: false, message: "Email not found in our records." });
    }

    console.log(`Email found in database: ${email}`);

    // Generate OTP (One-Time Password)
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60000); // OTP expiration time (1 minute)

    // Insert OTP into the otp_records table or update if it already exists
    const query = 
      `INSERT INTO otp_records (email, otp, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) 
      DO UPDATE SET otp = $2, expires_at = $3;`;

    pool.query(query, [email, otp, expiresAt], (err) => {
      if (err) {
        console.error('Error inserting OTP into database:', err);
        return res.status(500).json({ success: false, message: "Failed to save OTP." });
      }

      console.log(`OTP successfully saved for email: ${email}`);

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}. It is valid for 1 minute.`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error sending OTP email:', error);
          return res.status(500).json({ success: false, message: `Failed to send OTP: ${error.message}` });
        }
        console.log(`OTP sent to email: ${email}`);
        res.json({ success: true, message: 'OTP sent to your email address.' });
      });
    });
  });
});
