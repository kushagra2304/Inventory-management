const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool
const db = mysql.createPool({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
port: process.env.DB_PORT,

waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Check if the database is connected
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database");
    connection.release(); // Release the connection
  }
});

module.exports = db;
