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
    origin: (origin, callback) => {
        const allowedOrigins = [
        //   'https://inventory-management-kush.vercel.app',
          'http://localhost:5173',
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
                secure: process.env.NODE_ENV === "production"?true:false,
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
      const allowedRoles = ["admin", "stock_operator", "user"];
      if (!name || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required" });
      }
      if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
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

app.get("/api/inventory-pie", (req, res) => {
    db.query("SELECT * FROM inventory ORDER BY created_at DESC", (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      // console.log("Inventory Pie Data Sent to Frontend:", results);
      res.json({products:results});
    });
  });

// app.post("/inventory/sales-trend", async (req, res) => {
//   const { items } = req.body;
//   if (!items || !Array.isArray(items)) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     // Get today's date
//     const today = new Date();
//     const result = [];

//     // Iterate over last 3 months
//     for (let i = 2; i >= 0; i--) {
//       const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
//       const year = targetDate.getFullYear();
//       const month = targetDate.getMonth() + 1; // JS months are 0-indexed

//       const monthLabel = targetDate.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.
//       const row = { month: `${monthLabel} ${year}` };

//       for (const code of items) {
//         const [data] = await db.promise().query(
//           `SELECT 
//               SUM(quantity) as total 
//            FROM transaction 
//            WHERE item_code = ? 
//              AND transaction_type = 'issued'
//              AND MONTH(transaction_date) = ? 
//              AND YEAR(transaction_date) = ?`,
//           [code, month, year]
//         );

//         row[code] = data[0].total || 0;
//       }

//       result.push(row);
//     }

//     res.json(result);
//   } catch (err) {
//     console.error("Sales Trend Error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get('/inventory/all-products', async (req, res) => {
//   try {
//     const products = db.query('SELECT * FROM inventory');
//     res.json(products);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
app.get("/inventory", (req, res) => {
  const query = "SELECT * FROM inventory";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


// Add Inventory Item

app.post("/inventory", (req, res) => {
  const {
    comp_code,
    description,
    quantity,
    barcode,
    category,
    unit_type,
    weight,
    price,
    pack_size
  } = req.body;

  // Check required fields
  if (
    !comp_code ||
    !description ||
    !quantity ||
    !barcode ||
    !category ||
    !unit_type ||
    !weight ||
    !price
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Default pack_size to 1 if unit_type is "Single Unit"
  const finalPackSize = unit_type === "Single Unit" ? 1 : pack_size;

  const query = `
    INSERT INTO inventory (
      comp_code, description, quantity, barcode, category,
      unit_type, weight, price, pack_size
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    comp_code,
    description,
    quantity,
    barcode,
    category,
    unit_type,
    weight,
    price,
    finalPackSize
  ];

  db.query(query, values, (err) => {
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
    const { item_code, quantity, transaction_type, price } = req.body;

    // Input validation
    if (!item_code || !quantity || !transaction_type || price === undefined) {
        return res.status(400).json({ error: "Item code, quantity, transaction type, and price are required." });
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

            if (transaction_type === "issued") {
                updateQuery = "UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ? AND quantity >= ?";
                updateValues = [quantity, item_code, quantity];
            } else {
                updateQuery = "UPDATE inventory SET quantity = quantity + ? WHERE comp_code = ?";
                updateValues = [quantity, item_code];
            }

            console.log("Executing inventory update:", { query: updateQuery, values: updateValues });

            connection.query(updateQuery, updateValues, (err, updateResult) => {
                if (err) {
                    console.error("Inventory Update Error:", err);
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: "Inventory update error: " + err.message });
                    });
                }

                if (updateResult.affectedRows === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(400).json({ error: "Invalid operation. Not enough stock or item code does not exist." });
                    });
                }

                const insertQuery = `
                    INSERT INTO transaction (item_code, quantity, transaction_type, price, transaction_date)
                    VALUES (?, ?, ?, ?, NOW())
                `;

                console.log("Inserting transaction:", { query: insertQuery, values: [item_code, quantity, transaction_type, price] });

                connection.query(insertQuery, [item_code, quantity, transaction_type, price], (err) => {
                    if (err) {
                        console.error("Transaction Log Error:", err);
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: "Transaction log error: " + err.message });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            console.error("Transaction Commit Error:", err);
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: "Transaction commit error: " + err.message });
                            });
                        }

                        connection.release();
                        res.json({ message: "Transaction recorded successfully." });
                    });
                });
            });
        });
    });
});

const multer = require("multer");
const path = require("path");

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

app.post("/api/inventory/upload-image", upload.single("image"), (req, res) => {
  const compCode = req.body.comp_code;
  const imagePath = req.file.filename;

  const updateQuery = "UPDATE inventory SET image = ? WHERE comp_code = ?";
  db.query(updateQuery, [imagePath, compCode], (err) => {
    if (err) {
      console.error("DB Update Error:", err);
      return res.status(500).json({ success: false, error: "Image update failed" });
    }
    res.json({ success: true, imagePath });
  });
});



// Fetch All Past Transactions
app.get("/inventory/transactions", (req, res) => {
    const fetchQuery = `
        SELECT 
            t.id, 
            t.item_code, 
            t.quantity, 
            t.transaction_type, 
            t.price,
            t.updated_by,
            DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') as transaction_date,
            i.quantity AS remaining_quantity
        FROM transaction t
        LEFT JOIN inventory i ON t.item_code = i.comp_code
        ORDER BY t.id DESC
    `;

    console.log("Fetching all transactions with remaining quantity");

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





// ✅ Fetch Low Stock Items (quantity < 10)
app.get("/api/inventory/low-stock", authenticateToken, (req, res) => {
  const LOW_STOCK_THRESHOLD = 10;

  const query = `
    SELECT id, comp_code, description, category, unit_type, weight, price, quantity,pack_size
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
    
  app.post("/inventory/transaction-scan", async (req, res) => {
  const { items } = req.body;
    
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required and cannot be empty." });
  }
    
  db.getConnection(async (err, rawConnection) => {
    if (err) return res.status(500).json({ error: "Database connection error: " + err.message });
      
    const connection = rawConnection.promise(); // ✅ use promise-based wrapper
         
    try {
      await connection.beginTransaction();
      let totalAmount = 0;

      for (const item of items) {
        const { item_code, quantity, transaction_type, price } = item;

        if (!item_code || !quantity || !transaction_type || !price) {
          throw new Error("Each item must include item_code, quantity, transaction_type, and price.");
        }

        // Update inventory
        const [updateResult] = await connection.query(
          "UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ? AND quantity >= ?",
          [quantity, item_code, quantity]
        );

        if (updateResult.affectedRows === 0) {
          throw new Error(`Not enough stock or invalid item code: ${item_code}`);
        }

        // Insert into transaction log
        await connection.query(
          "INSERT INTO transaction (item_code, quantity, transaction_type, price, transaction_date) VALUES (?, ?, ?, ?, NOW())",
          [item_code, quantity, transaction_type, price]
        );

        totalAmount += quantity * price;
      }

      const billId = `BILL_${Date.now()}`;
      await connection.commit(); // ✅ await commit
      rawConnection.release();

      return res.json({
        message: "Purchase completed successfully.",
        bill_id: billId,
        total_amount: totalAmount,
      });

    } catch (error) {
      await connection.rollback(); // ✅ await rollback
      rawConnection.release();
      console.error("Transaction processing error:", error);
      return res.status(400).json({ error: error.message });
    }
  });
});




// // API endpoint to fetch all products
app.get('/api/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory'; // Fetch all records 
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ inventory: results });
      }
    });
  });

  // Usage route - fetch usage data by product ID
  app.get('/api/usage/:itemCode', (req, res) => {
    const itemCode = req.params.itemCode;
  
    const query = `
      SELECT 
        item_code,
        SUM(CASE WHEN transaction_type = 'issued' THEN quantity ELSE 0 END) AS total_issued,
        COUNT(*) AS transaction_count,
        MONTH(transaction_date) as month,
        YEAR(transaction_date) as year
      FROM transaction
      WHERE item_code = ?
      GROUP BY YEAR(transaction_date), MONTH(transaction_date)
      ORDER BY year DESC, month DESC
    `;
  
    db.query(query, [itemCode], (err, results) => {
      if (err) {
        console.error("Forecast Fetch Error:", err);
        return res.status(500).json({ error: "Database query error" });
      }
  
      // Fallbacks if no transactions exist
      const monthlyUsages = results.map(r => r.total_issued);
      const averageMonthlyUsage = monthlyUsages.length > 0
        ? Math.round(monthlyUsages.reduce((a, b) => a + b, 0) / monthlyUsages.length)
        : 0;
  
      // Get current stock
      const stockQuery = `SELECT quantity FROM inventory WHERE comp_code = ?`;
      db.query(stockQuery, [itemCode], (err, stockResults) => {
        if (err) {
          console.error("Stock Fetch Error:", err);
          return res.status(500).json({ error: "Stock fetch failed" });
        }
  
        const currentStock = stockResults[0]?.quantity || 0;
        const estimatedMonthsLeft = averageMonthlyUsage > 0
          ? Math.floor(currentStock / averageMonthlyUsage)
          : currentStock > 0 ? "N/A" : 0;
  
        res.json({
          item_code: itemCode,
          currentStock,
          averageMonthlyUsage,
          estimatedMonthsLeft
        });
      });
    });
  });
  
  //view all inventory items
//   app.get('/api/inventory/all', authenticateJWT, (req, res) => {
//     const query = 'SELECT * FROM inventory';
  
//     db.query(query, (err, results) => {
//       if (err) {
//         console.error('Error fetching products:', err);
//         return res.status(500).json({ success: false, message: 'Server Error' });
//       }
//       res.status(200).json({ success: true, products: results });
//     });
//   });

//USERS
// Route to get all inventory items (for user view only)
app.get("/api/user/inventory", (req, res) => {
    const query = "SELECT id, comp_code, quantity, description, barcode, category FROM inventory"; 
    db.query(query, (err, results) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        // console.log("Fetched Inventory Data:", results); // ✅ Check what is fetched
        res.json({ inventory: results });
    });
});

app.get('/api/user/inventory', (req, res) => {
    const query = 'SELECT * FROM inventory'; // Fetch all records 
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching inventory data:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ inventory: results });
      }
    });
  });

  // Usage route - fetch usage data by product ID
  app.get('/api/usage/user/:itemCode', (req, res) => {
    const itemCode = req.params.itemCode;
  
    const query = `
      SELECT 
        item_code,
        SUM(CASE WHEN transaction_type = 'issued' THEN quantity ELSE 0 END) AS total_issued,
        COUNT(*) AS transaction_count,
        MONTH(transaction_date) as month,
        YEAR(transaction_date) as year
      FROM transaction
      WHERE item_code = ?
      GROUP BY YEAR(transaction_date), MONTH(transaction_date)
      ORDER BY year DESC, month DESC
    `;
  
    db.query(query, [itemCode], (err, results) => {
      if (err) {
        console.error("Forecast Fetch Error:", err);
        return res.status(500).json({ error: "Database query error" });
      }
  
      // Fallbacks if no transactions exist
      const monthlyUsages = results.map(r => r.total_issued);
      const averageMonthlyUsage = monthlyUsages.length > 0
        ? Math.round(monthlyUsages.reduce((a, b) => a + b, 0) / monthlyUsages.length)
        : 0;
  
      // Get current stock
      const stockQuery = `SELECT quantity FROM inventory WHERE comp_code = ?`;
      db.query(stockQuery, [itemCode], (err, stockResults) => {
        if (err) {
          console.error("Stock Fetch Error:", err);
          return res.status(500).json({ error: "Stock fetch failed" });
        }
  
        const currentStock = stockResults[0]?.quantity || 0;
        const estimatedMonthsLeft = averageMonthlyUsage > 0
          ? Math.floor(currentStock / averageMonthlyUsage)
          : currentStock > 0 ? "N/A" : 0;
  
        res.json({
          item_code: itemCode,
          currentStock,
          averageMonthlyUsage,
          estimatedMonthsLeft
        });
      });
    });
  });
  

// app.get('/api/user/requests',authenticateToken, (req, res) => {
    
//     const userId = req.user.id;
//     console.log("USER is:", userId);

//     const query = "SELECT * FROM item_requests WHERE user_id = ?";
//     db.query(query, [userId], (err, results) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         res.json({ requests: results });
//     });
// });

// app.post('/api/user/request-item', authenticateToken, (req, res) => {
//     const { item_id, quantity } = req.body;
//     const userId = req.user.id;

//     console.log("Request body:", req.body); // For debugging
//     console.log("User ID:", userId); // For debugging

//     const query = `
//         INSERT INTO item_requests (user_id, item_id, quantity, status, request_date) 
//         VALUES (?, ?, ?, 'Pending', NOW())
//     `;

//     db.query(query, [userId, item_id, quantity], (err, result) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Database error", error: err.sqlMessage });
//         }
//         res.json({ message: "Request submitted successfully" });
//     });
// });
  
//BARDCODE SCANNER
app.get("/api/user/products/barcode/:barcode", (req, res) => {
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

app.post("/user/inventory/transaction-scan", (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array is required and cannot be empty." });
  }

  db.getConnection(async (err, rawConnection) => {
    if (err) return res.status(500).json({ error: "Database connection error: " + err.message });

    const connection = rawConnection.promise(); // ✅ use promise-based wrapper

    try {
      await connection.beginTransaction();
      let totalAmount = 0;

      for (const item of items) {
        const { item_code, quantity, transaction_type, price } = item;

        if (!item_code || !quantity || !transaction_type || !price) {
          throw new Error("Each item must include item_code, quantity, transaction_type, and price.");
        }

        // Update inventory
        const [updateResult] = await connection.query(
          "UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ? AND quantity >= ?",
          [quantity, item_code, quantity]
        );

        if (updateResult.affectedRows === 0) {
          throw new Error(`Not enough stock or invalid item code: ${item_code}`);
        }

        // Insert into transaction log
        await connection.query(
          "INSERT INTO transaction (item_code, quantity, transaction_type, price, transaction_date) VALUES (?, ?, ?, ?, NOW())",
          [item_code, quantity, transaction_type, price]
        );

        totalAmount += quantity * price;
      }

      const billId = `BILL_${Date.now()}`;
      await connection.commit(); // ✅ await commit
      rawConnection.release();

      return res.json({
        message: "Purchase completed successfully.",
        bill_id: billId,
        total_amount: totalAmount,
      });

    } catch (error) {
      await connection.rollback(); // ✅ await rollback
      rawConnection.release();
      console.error("Transaction processing error:", error);
      return res.status(400).json({ error: error.message });
    }
  });
});

  
// Assuming you're using Express and a MySQL connection pool
app.get("/inventory/all-products", (req, res) => {
  const query = "SELECT comp_code, description FROM inventory";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});


  app.post("/inventory/sales-trend", (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No products selected" });
  }

  const placeholders = items.map(() => "?").join(",");
  
  // Calculate date 3 months ago (start of that month)
  const now = new Date();
  now.setDate(1); // start of current month
  now.setMonth(now.getMonth() - 2); // go back 2 full months + current month = last 3 months
  const startDate = now.toISOString().slice(0, 10);

  const query = `
    SELECT
      item_code,
      DATE_FORMAT(transaction_date, '%Y-%m') AS month,
      SUM(CASE WHEN transaction_type = 'issued' THEN quantity ELSE 0 END) AS total_issued
    FROM transaction
    WHERE transaction_date >= ?
      AND item_code IN (${placeholders})
    GROUP BY item_code, month
    ORDER BY month ASC
  `;

  db.query(query, [startDate, ...items], (err, results) => {
    if (err) {
      console.error("Sales Trend Query Error:", err);
      return res.status(500).json({ error: "Database query error" });
    }

    // Transform the results into chart-friendly format
    const chartData = {};
    results.forEach(({ item_code, month, total_issued }) => {
      if (!chartData[month]) chartData[month] = { month };
      chartData[month][item_code] = total_issued;
    });

    // Fill missing months for all selected items with zero if needed (optional)

    res.json(Object.values(chartData));
  });
});

  app.post("/api/bills", (req, res) => {
  const { bill_id, mobile, timestamp } = req.body;

  if (!bill_id || !mobile || !timestamp) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const dateObj = new Date(timestamp);
  if (isNaN(dateObj)) {
    return res.status(400).json({ message: "Invalid timestamp format" });
  }
  const mysqlTimestamp = dateObj.toISOString().slice(0, 19).replace('T', ' ');

  db.query(
    "INSERT INTO bills (bill_id, mobile, timestamp) VALUES (?, ?, ?)",
   [bill_id, mobile, mysqlTimestamp],
    (error, results) => {
      if (error) {
        console.error("DB insert error:", error);
        return res.status(500).json({ message: "Failed to save bill log" });
      }
      res.status(200).json({ message: "Bill log saved" });
    }
  );
});


app.post("/inventory/transaction-so", (req, res) => {
  const { item_code, quantity, transaction_type, price, updated_by } = req.body;

  if (!item_code || !quantity || !transaction_type || price === undefined || !updated_by) {
    return res.status(400).json({
      error: "Item code, quantity, transaction type, price, and updated_by are required.",
    });
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

      if (transaction_type === "issued") {
        updateQuery = "UPDATE inventory SET quantity = quantity - ? WHERE comp_code = ? AND quantity >= ?";
        updateValues = [quantity, item_code, quantity];
      } else {
        updateQuery = "UPDATE inventory SET quantity = quantity + ? WHERE comp_code = ?";
        updateValues = [quantity, item_code];
      }

      console.log("Executing inventory update:", { query: updateQuery, values: updateValues });

      connection.query(updateQuery, updateValues, (err, updateResult) => {
        if (err) {
          console.error("Inventory Update Error:", err);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: "Inventory update error: " + err.message });
          });
        }

        if (updateResult.affectedRows === 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(400).json({
              error: "Invalid operation. Not enough stock or item code does not exist.",
            });
          });
        }

        const insertQuery = `
          INSERT INTO transaction (item_code, quantity, transaction_type, price, transaction_date, updated_by)
          VALUES (?, ?, ?, ?, NOW(), ?)
        `;

        const insertValues = [item_code, quantity, transaction_type, price, updated_by];

        console.log("Inserting transaction:", { query: insertQuery, values: insertValues });

        connection.query(insertQuery, insertValues, (err) => {
          if (err) {
            console.error("Transaction Log Error:", err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ error: "Transaction log error: " + err.message });
            });
          }

          connection.commit((err) => {
            if (err) {
              console.error("Transaction Commit Error:", err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ error: "Transaction commit error: " + err.message });
              });
            }

            connection.release();
            res.json({ message: "Transaction recorded successfully." });
          });
        });
      });
    });
  });
});


// Fetch All Past Transactions
app.get("/inventory/transactions-so", (req, res) => {
    const fetchQuery = `
        SELECT 
            t.id, 
            t.item_code, 
            t.quantity, 
            t.transaction_type, 
            t.price,
            t.updated_by,
            DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') as transaction_date,
            i.quantity AS remaining_quantity
        FROM transaction t
        LEFT JOIN inventory i ON t.item_code = i.comp_code
        ORDER BY t.id DESC
    `;

    console.log("Fetching all transactions for stock operator with remaining quantity");

    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error("Fetch Transactions Error:", err);
            return res.status(500).json({ error: "Failed to fetch transactions: " + err.message });
        }
        res.json(results);
    });
});


  app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Logout Route
app.post("/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });
    res.json({ message: "Logged out successfully" });
});
 

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
