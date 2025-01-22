const express = require('express');
const { Pool } = require('pg');
const app = express();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Middleware to parse JSON requests
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },  // If required by your provider
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to the PostgreSQL database.');
});

// Export both the app and the pool
module.exports = { app, pool };
