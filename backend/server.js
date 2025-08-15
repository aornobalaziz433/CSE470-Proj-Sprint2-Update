const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MySQL setup
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
  db.query(`CREATE TABLE IF NOT EXISTS codes (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    created_at BIGINT NOT NULL
  )`);
  db.query(`CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255),
    is_active TINYINT DEFAULT 0,
    activation_code VARCHAR(10),
    created_at BIGINT
  )`);
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send code endpoint
app.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  db.query(
    `REPLACE INTO codes (email, code, created_at) VALUES (?, ?, ?)`,
    [email, code, now],
    async (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${code}`
        });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Failed to send email' });
      }
    }
  );
});

// Verify code endpoint
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  db.query(
    `SELECT code, created_at FROM codes WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!results.length) return res.status(400).json({ error: 'No code found for this email' });
      const row = results[0];
      const now = Date.now();
      if (now - row.created_at > 10 * 60 * 1000) {
        db.query(`DELETE FROM codes WHERE email = ?`, [email]);
        return res.status(400).json({ error: 'Code expired' });
      }
      if (row.code === code) {
        db.query(`DELETE FROM codes WHERE email = ?`, [email]);
        return res.json({ success: true });
      }
      res.status(400).json({ error: 'Invalid code' });
    }
  );
});

// Registration endpoint (example, you may need to adapt to your frontend)
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const activation_code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  db.query(
    `INSERT INTO users (email, password, is_active, activation_code, created_at) VALUES (?, ?, 0, ?, ?)
     ON DUPLICATE KEY UPDATE password=VALUES(password), is_active=0, activation_code=VALUES(activation_code), created_at=VALUES(created_at)`,
    [email, password, activation_code, now],
    async (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your Account Activation Code',
          text: `Your activation code is: ${activation_code}`
        });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Failed to send activation email' });
      }
    }
  );
});

// Send activation code (resend)
app.post('/send-activation-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const activation_code = Math.floor(100000 + Math.random() * 900000).toString();
  db.query(
    `UPDATE users SET activation_code = ? WHERE email = ?`,
    [activation_code, email],
    async (err, result) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your Account Activation Code',
          text: `Your activation code is: ${activation_code}`
        });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: 'Failed to send activation email' });
      }
    }
  );
});

// Verify activation code
app.post('/verify-activation-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
  db.query(
    `SELECT activation_code FROM users WHERE email = ?`,
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!results.length) return res.status(404).json({ error: 'User not found' });
      if (results[0].activation_code === code) {
        db.query(`UPDATE users SET is_active = 1, activation_code = NULL WHERE email = ?`, [email]);
        return res.json({ success: true });
      }
      res.status(400).json({ error: 'Invalid code' });
    }
  );
});

// Example login endpoint (only allow if is_active=1)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  db.query(
    `SELECT * FROM users WHERE email = ? AND password = ? AND is_active = 1`,
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!results.length) return res.status(401).json({ error: 'Invalid credentials or account not activated' });
      res.json({ success: true, user: results[0] });
    }
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 