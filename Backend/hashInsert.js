const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME, // Ensure this is set to 'inventory_db'
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL Database");
});

// Function to insert user data
const insertUser = async (name, email, plainPassword, role) => {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const query = "INSERT INTO inventory_db.users (name, email, password, role) VALUES (?, ?, ?, ?)";

        return new Promise((resolve, reject) => {
            db.query(query, [name, email, hashedPassword, role], (err, result) => {
                if (err) {
                    console.error(`Error inserting user ${name}:`, err);
                    reject(err);
                } else {
                    console.log(`User ${name} added successfully!`);
                    resolve(result);
                }
            });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
    }
};

// Insert Users and Close Connection
const main = async () => {
    try {
        await insertUser("Admin User", "admin@example.com", "admin123", "admin");
        await insertUser("Regular User", "user@example.com", "user123", "user");
    } catch (error) {
        console.error("Error inserting users:", error);
    } finally {
        db.end((err) => {
            if (err) {
                console.error("Error closing the database connection:", err);
            } else {
                console.log("Database connection closed.");
            }
        });
    }
};

// Run the main function
main();
