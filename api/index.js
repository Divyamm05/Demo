const { Pool } = require('pg');  // Import PostgreSQL Pool
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: { rejectUnauthorized: false },  // If required by your provider
});

pool.connect((err, client) => {
    if (err) {
      console.error('Database connection failed:', err);
      process.exit(1);  // Exit the process if the connection fails
    }
  
    console.log('Connected to the PostgreSQL database.');
  
    // Run a simple query to verify the connection
    client.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('Error executing query:', err);
        process.exit(1);  // Exit the process if the query fails
      }
  
      // Log the result of the query (should return the current timestamp)
      console.log('Database query result:', res.rows[0]);
      
      // Release the client connection after the query
      client.release();
    });
  });
  
  // Export the pool for querying in other parts of the app
  module.exports = pool;
