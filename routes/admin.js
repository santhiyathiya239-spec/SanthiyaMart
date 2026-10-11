
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { verifyToken, requireOwner } = require("../middleware/auth");

// Only logged-in owners can access these APIs
router.use(verifyToken, requireOwner);

// Dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT COUNT(*) AS total FROM santhiya_users"
        );

        res.json({
            success: true,
            users: users[0].total
        });
    } catch (error) {
        console.error("Admin stats error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load dashboard statistics."
        });
    }
});

// List users
router.get("/users", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id, name, email, role
             FROM santhiya_users
             ORDER BY id DESC`
        );

        res.json({
            success: true,
            users: rows
        });
    } catch (error) {
        console.error("Admin users error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load users."
        });
    }
});

// List products
router.get("/products", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.json({
            success: true,
            products: rows
        });
    } catch (error) {
        console.error("Admin products error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load products."
        });
    }
});

// List orders
router.get("/orders", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM orders ORDER BY id DESC"
        );

        res.json({
            success: true,
            orders: rows
        });
    } catch (error) {
        console.error("Admin orders error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not load orders. Check the orders table."
        });
    }
});

module.exports = router;
