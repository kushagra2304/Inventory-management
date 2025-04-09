const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const db = require("../db");

// Get All Inventory Items
router.get("/", (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add New Inventory Item (Admin Only)
router.post("/add", verifyAdmin,(req, res) => {
  const { comp_code, description, quantity } = req.body;

  db.query(
    "INSERT INTO inventory (comp_code, description, quantity) VALUES (?, ?, ?)",
    [comp_code, description, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Item added successfully" });
    }
  );
});

// Record Transaction (Issue or Receive)
router.post("/transaction", verifyAdmin,(req, res) => {
  const { inventory_id, user_id, transaction_type, quantity } = req.body;

  db.query(
    "INSERT INTO transactions (inventory_id, user_id, transaction_type, quantity) VALUES (?, ?, ?, ?)",
    [inventory_id, user_id, transaction_type, quantity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Transaction recorded successfully" });
    }
  );
});

module.exports = router;
