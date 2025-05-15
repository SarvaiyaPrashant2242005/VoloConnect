const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'voloconnect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    
    // Test query to verify we can access the users table
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('Number of users in database:', rows[0].count);
    
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    console.error('Connection details:', {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'voloconnect'
    });
    process.exit(1);
  }
};

// Call testConnection when the module is loaded
testConnection();

module.exports = pool;
