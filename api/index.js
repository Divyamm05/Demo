const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

// Session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes

// Session management setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Secure cookies in production
    maxAge: SESSION_TIMEOUT,  // Session expires after 30 minutes of inactivity
  }
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = app;  // Export the app for other routes to use
