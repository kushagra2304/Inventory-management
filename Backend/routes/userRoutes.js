const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Database connection

// Register User (Admin or Normal User)
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "User registered successfully" });
    }
  );
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  console.log("Received Login Request:", { email, password, role });

  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect password!" });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { email: user.email, role: user.role } });
});
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
      next();
  } else {
      res.status(403).json({ message: "Access denied! Only admins can perform this action." });
  }
};

// ✅ API to Add a New User (Only Admin Can Do This)
router.post("/add-user", isAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if the email already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      if (results.length > 0) {
          return res.status(400).json({ message: "User already exists!" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, role],
          (err, results) => {
              if (err) return res.status(500).json({ message: "Error adding user", error: err });

              return res.status(201).json({ message: "User added successfully!" });
          }
      );
  });

  // ✅ API to Delete a User (Only Admin Can Do This)
router.delete("/delete-user/:id", isAdmin, (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
      if (err) return res.status(500).json({ message: "Error deleting user", error: err });

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "User not found!" });
      }

      return res.json({ message: "User deleted successfully!" });
  });
});
// Promote User to Admin
router.put("/make-admin/:id", isAdmin, (req, res) => {
  const userId = req.params.id;

  db.query("UPDATE users SET role = 'admin' WHERE id = ?", [userId], (err, results) => {
      if (err) return res.status(500).json({ message: "Error updating role", error: err });

      if (results.affectedRows === 0) {
          return res.status(404).json({ message: "User not found!" });
      }

      return res.json({ message: "User promoted to admin successfully!" });
  });
});

}
);
  

module.exports = router;
