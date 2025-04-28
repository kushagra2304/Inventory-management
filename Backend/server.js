const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json()); // ✅ Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));


// ✅ Updated CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
          'https://inventory-management-kush.vercel.app',
          'http://localhost:5173'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    credentials: true, // Allow cookies and authorization headers
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// ✅ Using a Connection Pool for Better Performance
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "inventory_db",
    port: process.env.DB_PORT,
}); // Use promise-based API for async/await

// ✅ Checking Database Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
        connection.release();
    }
});

// ✅ Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
    
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = decoded; // ✅ Correct assignment
        console.log("Decoded user:", req.user);
        next();
    });
};

// ✅ Admin & User Login with Secure JWT Cookie
app.post("/login", (req, res) => {
    const { email, password, role } = req.body; // include role in request

    // Check for missing fields
    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database Error" });
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(403).json({ message: "User not found" });
        }

        const user = results[0];

        // Check if role matches
        if (user.role !== role) {
            return res.status(403).json({ message: `Access denied for role: ${role}` });
        }

        // Compare password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Error comparing passwords" });
            }

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Generate JWT with role info
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role }, // includes role
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            // Set cookie securely
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });

            // Successful login response
            res.json({
                message: "Login successful",
                user: { id: user.id, email: user.email, role: user.role }
            });
        });
    });
});


// ✅ Get All Users (Admin Only)
app.get("/admin/users", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    db.query("SELECT id, name, email, role FROM users", (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
});

// ✅ Add User (Admin Only)
app.post("/admin/users", authenticateToken, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields are required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err, result) => {
                if (err) return res.status(500).json({ message: "Database Error" });
                res.status(201).json({ message: "User added successfully", id: result.insertId });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ Delete User (Admin Only)
app.delete("/admin/users/:id", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json({ message: "User deleted successfully" });
    });
});

// ✅ Add User Public Endpoint
app.post("/api/auth/add-user", async (req, res) => {
  try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, role],
          (err, result) => {
              if (err) {
                  console.error("MySQL Insert Error:", err); // 🔍 Logs MySQL errors
                  return res.status(500).json({ message: "Database Error", error: err.message });
              }
              res.status(201).json({ message: "User added successfully", id: result.insertId });
          }
      );
  } catch (error) {
      console.error("Server Error:", error); // 🔍 Logs server errors
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ Fetch All Users (For Manage Users Page)
app.get("/admin/users", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const query = "SELECT id, name, email, role FROM users"; // Fetch relevant user data
  db.query(query, (err, results) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Database Error" });
      }
      res.json(results);
  });
});


app.put("/admin/users/:id/role", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });

  const { id } = req.params;
  const { role } = req.body;

  if (!role) return res.status(400).json({ message: "Role is required" });

  const query = "UPDATE users SET role = ? WHERE id = ?";
  db.query(query, [role, id], (err, result) => {
      if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Error updating user role" });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User role updated successfully" });
  });
});


// Get All Inventory Items
app.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add Inventory Item
app.post("/inventory", (req, res) => {
  const { comp_code, description, quantity } = req.body;
  if (!comp_code || !description || !quantity) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const query = "INSERT INTO inventory (comp_code, description, quantity) VALUES (?, ?, ?)";
  db.query(query, [comp_code, description, quantity], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item added successfully" });
  });
});

// Delete Inventory Item
app.delete("/inventory/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM inventory WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Item deleted successfully" });
  });
});

app.post("/inventory/transaction", (req, res) => {
    const { item_code, quantity, transaction_type } = req.body;

    // Input validation
    if (!item_code || !quantity || !transaction_type) {
        return res.status(400).json({ error: "Item code, quantity, and transaction type are required." });
    }

    db.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: "Database connection error: " + err.message });

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: "Transaction start error: " + err.message });
            }

            let updateQuery;
            let updateValues;

            // Conditionally set query and values
            if (transaction_type === "issued") {
                updateQuery = "UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ? AND quantity >= ?";
                updateValues = [quantity, item_code, quantity];
            } else {
                updateQuery = "UPDATE inventory SET quantity = quantity + ? WHERE comp_code = ?";
                updateValues = [quantity, item_code];
            }

            console.log("Executing inventory update:", { query: updateQuery, values: updateValues });

            // Execute inventory update
            connection.query(updateQuery, updateValues, (err, updateResult) => {
                if (err) {
                    console.error("Inventory Update Error:", err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: "Inventory update error: " + err.message });
                    });
                }

                // Check if update affected any row
                if (updateResult.affectedRows === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(400).json({ error: "Invalid operation. Not enough stock or item code does not exist." });
                    });
                }

                // Insert transaction log
                const insertQuery = "INSERT INTO transaction (item_code, quantity, transaction_type) VALUES (?, ?, ?)";
                console.log("Inserting transaction:", { query: insertQuery, values: [item_code, quantity, transaction_type] });

                connection.query(insertQuery, [item_code, quantity, transaction_type], (err) => {
                    if (err) {
                        console.error("Transaction Log Error:", err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: "Transaction log error: " + err.message });
                        });
                    }

                    // Commit transaction
                    connection.commit((err) => {
                        if (err) {
                            console.error("Transaction Commit Error:", err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Transaction commit error: " + err.message });
                            });
                        }

                        // Success
                        connection.release();
                        res.json({ message: "Transaction recorded successfully." });
                    });
                });
            });
        });
    });
});


// Fetch All Past Transactions
app.get("/inventory/transactions", (req, res) => {
    const fetchQuery = `
        SELECT 
            id, 
            item_code, 
            quantity, 
            transaction_type, 
            DATE_FORMAT(transaction_date, '%Y-%m-%d %H:%i:%s') as transaction_date 
        FROM transaction 
        ORDER BY id DESC
    `;

    console.log("Fetching all transactions");

    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error("Fetch Transactions Error:", err);
            return res.status(500).json({ error: "Failed to fetch transactions: " + err.message });
        }
        res.json(results);
    });
});


app.get('/inventory/reports', async (req, res) => {
    try {
        const [transactions] = await db.promise().query(`
            SELECT t.id, t.item_code, i.description, t.quantity, t.transaction_type, t.transaction_date
            FROM transaction t
            LEFT JOIN inventory i ON t.item_code = i.comp_code
            ORDER BY t.transaction_date DESC
        `);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports', error });
    }
});


//USERS
// Route to get all inventory items (for user view only)
app.get("/api/user/inventory", (req, res) => {
    const query = "SELECT id, comp_code, quantity, description FROM inventory"; 
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        // console.log("Fetched Inventory Data:", results); // ✅ Check what is fetched
        res.json({ inventory: results });
    });
});


app.get('/api/user/requests',authenticateToken, (req, res) => {
    
    const userId = req.user.id;
    console.log("USER is:", userId);

    const query = "SELECT * FROM item_requests WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ requests: results });
    });
});

app.post('/api/user/request-item', authenticateToken, (req, res) => {
    const { item_id, quantity } = req.body;
    const userId = req.user.id;

    console.log("Request body:", req.body); // For debugging
    console.log("User ID:", userId); // For debugging

    const query = `
        INSERT INTO item_requests (user_id, item_id, quantity, status, request_date) 
        VALUES (?, ?, ?, 'Pending', NOW())
    `;

    db.query(query, [userId, item_id, quantity], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err.sqlMessage });
        }
        res.json({ message: "Request submitted successfully" });
    });
});


// ✅ Fetch Low Stock Items (quantity < 10)
app.get("/api/inventory/low-stock", authenticateToken, (req, res) => {
    const LOW_STOCK_THRESHOLD = 10;

    const query = `
        SELECT id, comp_code, description, quantity 
        FROM inventory 
        WHERE quantity < ?
        ORDER BY quantity ASC
    `;

    db.query(query, [LOW_STOCK_THRESHOLD], (err, results) => {
        if (err) {
            console.error("Low Stock Query Error:", err);
            return res.status(500).json({ message: "Failed to fetch low stock items" });
        }

        res.json({ lowStock: results });
    });
});

//BARDCODE SCANNER
app.get("/api/products/barcode/:barcode", (req, res) => {
    const { barcode } = req.params;
  
    // Query the database to get the product by barcode
    db.query("SELECT * FROM inventory WHERE barcode = ?", [barcode], (error, results) => {
      if (error) {
        console.error('Error fetching product by barcode:', error);
        return res.status(500).json({ error: 'Server error' });
      }
  
      // If no product found, return 404
      if (results.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Return the first product if found
      res.json(results[0]);
    });
  });

  // Express route
  app.post('/api/purchase', async (req, res) => {
    const items = req.body.items;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items provided for purchase' });
    }

    const connection = mysql.createConnection(dbConfig);
    connection.beginTransaction();

    try {
        for (const item of items) {
            if (!item.comp_code || !item.qty) {
                return res.status(400).json({ message: 'Invalid item data' });
            }

            // Fetch the product
            const [rows] = connection.execute(
                'SELECT * FROM inventory WHERE comp_code = ?',
                [item.comp_code]
            );

            const product = rows[0];

            if (!product) {
                throw new Error(`Product with code ${item.comp_code} not found`);
            }

            if (product.quantity < item.qty) {
                throw new Error(`Insufficient stock for ${item.comp_code}`);
            }

            // Reduce the quantity from inventory
            connection.execute(
                'UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ?',
                [item.qty, item.comp_code]
            );

            // Insert into transactions table
            connection.execute(
                'INSERT INTO transaction (comp_code, qty, status, timestamp) VALUES (?, ?, ?, NOW())',
                [item.comp_code, item.qty, 'issued']
            );
        }

        connection.commit();
        res.json({ message: 'Purchase completed successfully!' });
    } catch (err) {
        connection.rollback();
        console.error("Error during purchase:", err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
    } finally {
        connection.end();
    }
});

// API endpoint to fetch all products
app.get('/api/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory ORDER BY created_at DESC LIMIT 3'; // Fetch last 3 records (adjust query as needed)
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ inventory: results });
      }
    });
  });

  
  

// ✅ Logout Route
app.post("/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });
    res.json({ message: "Logged out successfully" });
});
 

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
