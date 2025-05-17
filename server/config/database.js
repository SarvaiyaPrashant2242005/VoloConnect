const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'bl0zt25efeppoq6k19ux-mysql.services.clever-cloud.com',
  user: 'ux4re19uneixcun0',
  password: 'XrYf7l4I6HJl3sZXv8X9',
  database: 'bl0zt25efeppoq6k19ux',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

module.exports = pool;
