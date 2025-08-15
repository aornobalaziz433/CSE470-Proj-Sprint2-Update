const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`);
    console.log(`Database '${process.env.MYSQL_DATABASE}' created or already exists`);

    // Use the database
    await connection.execute(`USE ${process.env.MYSQL_DATABASE}`);

    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.error('Error executing statement:', error.message);
          console.error('Statement:', statement);
        }
      }
    }

    console.log('Database initialization completed successfully!');
    
    // Test connection to the new database
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables created:', rows.map(row => Object.values(row)[0]));

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
