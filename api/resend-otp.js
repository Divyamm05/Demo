import mysql from 'mysql2';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const db = mysql.createConnection({
  host: 'localhost', // Use a remote DB or managed DB service
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'test',
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    db.query('SELECT * FROM otp_records WHERE email = ? AND expires_at > NOW()', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      if (results.length > 0) {
        const otpRecord = results[0];
        const otp = otpRecord.otp;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is: ${otp}. It is still valid for 1 minute.`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: "Failed to send OTP." });
          }
          res.json({ success: true, message: 'OTP resent to your email address.' });
        });
      } else {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 60000); // OTP expiration time (1 minute)

        const query = 
          `INSERT INTO otp_records (email, otp, expires_at)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?;`;

        db.query(query, [email, otp, expiresAt, otp, expiresAt], (err) => {
          if (err) {
            console.error('Error saving OTP to database:', err);
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
              console.error('Error sending email:', error);
              return res.status(500).json({ success: false, message: "Failed to send OTP." });
            }
            res.json({ success: true, message: 'New OTP sent to your email address.' });
          });
        });
      }
    });
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
