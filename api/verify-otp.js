import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'test',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { otp, email } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    db.query('SELECT * FROM otp_records WHERE email = ? AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "OTP not found or expired." });
      }

      const otpRecord = results[0];

      if (otp !== otpRecord.otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP." });
      }

      db.query('DELETE FROM otp_records WHERE email = ?', [email], (err) => {
        if (err) {
          console.error('Error deleting OTP records:', err);
        }
      });

      res.json({ success: true, message: "OTP verified successfully." });
    });
  } else {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
}
