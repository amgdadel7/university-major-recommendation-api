const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql5047.site4now.net',
  user: process.env.DB_USER || 'abf0c2_umj',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'db_abf0c2_umj',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = pool;

