const app = require('./index');
const db = require('./index').db;

app.post('/api/verify-otp', (req, res) => {
  const { otp } = req.body;
  const email = req.session.email;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }

  db.query('SELECT * FROM otp_records WHERE email = ? AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "OTP not found or expired." });
    }

    const otpRecord = results[0];

    if (otp !== otpRecord.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    req.session.verified = true;  // Set user as verified
    req.session.userState = 'awaiting_domain_input';

    // Delete OTP record after verification
    db.query('DELETE FROM otp_records WHERE email = ?', [email]);

    res.json({ success: true, message: "OTP verified successfully." });
  });
});
