
require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const express = require("express");
const path = require("path");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/admin", adminRoutes);

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Santhiya Mart server is running"
    });
});

// Main pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/forgot-password.html", (req, res) => {
    res.sendFile(path.join(__dirname, "forgot-password.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/orders.html", (req, res) => {
    res.sendFile(path.join(__dirname, "orders.html"));
});

app.get("/owner.html", (req, res) => {
    res.sendFile(path.join(__dirname, "owner.html"));
});

// Serve frontend assets
app.use(express.static(__dirname, {
    dotfiles: "deny",
    index: false
}));

// 404 handler
app.use((req, res) => {
    res.status(404).send(`Cannot find: ${req.method} ${req.path}`);
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.message);

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`Santhiya Mart running at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login.html`);
    console.log(`Forgot password: http://localhost:${PORT}/forgot-password.html`);
    console.log(`Orders page: http://localhost:${PORT}/orders.html`);

    try {
        const connection = await pool.getConnection();
        console.log("MySQL connected successfully!");
        connection.release();
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
    }
});