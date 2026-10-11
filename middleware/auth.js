const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        return res.status(500).json({
            success: false,
            message: "Server authentication is not configured."
        });
    }

    try {
        req.user = jwt.verify(
            authHeader.substring(7),
            process.env.JWT_SECRET
        );
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired login. Please log in again."
        });
    }
}

function requireOwner(req, res, next) {
    if (!req.user || req.user.role !== "owner") {
        return res.status(403).json({
            success: false,
            message: "Owner access only."
        });
    }

    next();
}

module.exports = { verifyToken, requireOwner };