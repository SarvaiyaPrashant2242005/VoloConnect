const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function createCommunicationLogsTable() {
  try {
    console.log('Creating communication_logs table...');
    
    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, 'communication_logs.sql'),
      'utf8'
    );
    
    // Split by semicolons to get individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);
      await pool.query(statement);
    }
    
    console.log('Communication logs table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating communication_logs table:', error);
    process.exit(1);
  }
}

createCommunicationLogsTable(); 