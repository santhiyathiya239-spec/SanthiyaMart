const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../config/db");

const router = express.Router();

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// OTP hashing
function otpHash(userId, otp) {
    return crypto
        .createHmac("sha256", process.env.JWT_SECRET)
        .update(`${userId}:${otp}`)
        .digest("hex");
}

// Secure hash comparison
function safeEqual(a, b) {
    const first = Buffer.from(a, "hex");
    const second = Buffer.from(b, "hex");

    return first.length === second.length &&
        crypto.timingSafeEqual(first, second);
}

// Gmail configuration
function createMailer() {
    if (
        !process.env.SMTP_EMAIL ||
        !process.env.SMTP_APP_PASSWORD ||
        process.env.SMTP_EMAIL.includes("உன்னுடைய") ||
        process.env.SMTP_APP_PASSWORD.includes("உன்னுடைய")
    ) {
        throw new Error(
            "Gmail SMTP is not configured. Check SMTP_EMAIL and SMTP_APP_PASSWORD in .env"
        );
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_APP_PASSWORD
        }
    });
}

// Common password-reset error handler
function resetTableError(res, error) {
    console.error("Password reset error:", error);

    return res.status(500).json({
        success: false,
        message: "Password reset service is temporarily unavailable."
    });
}

// Test auth route
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Santhiya Mart auth route working"
    });
});

// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {
    try {
        const { name, email, username, password, role } =
            req.body || {};

        if (!name || !email || !username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        if (!["buyer", "seller"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Only Buyer and Seller registration is allowed."
            });
        }

        if (
            typeof password !== "string" ||
            password.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanUsername = username.trim();

        if (!EMAIL_REGEX.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        const [existing] = await pool.execute(
            `SELECT id
             FROM santhiya_users
             WHERE email = ? OR username = ?
             LIMIT 1`,
            [cleanEmail, cleanUsername]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email or username already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            `INSERT INTO santhiya_users
             (name, email, username, password_hash, role)
             VALUES (?, ?, ?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                cleanUsername,
                passwordHash,
                role
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully. Please log in."
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email or username already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create account."
        });
    }
});

// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body || {};

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please enter all login details."
            });
        }

        if (!["buyer", "seller", "owner"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role."
            });
        }

        // Safe diagnostics: never print the secret itself
        console.log(
            "JWT_SECRET exists:",
            Boolean(process.env.JWT_SECRET)
        );

        console.log(
            "JWT_SECRET length:",
            process.env.JWT_SECRET?.length || 0
        );

        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            console.error(
                "Login blocked: JWT_SECRET is missing or too short."
            );

            return res.status(500).json({
                success: false,
                message: "Server authentication is not configured."
            });
        }

        const [users] = await pool.execute(
            `SELECT id, name, email, username, password_hash, role
             FROM santhiya_users
             WHERE username = ? AND role = ?
             LIMIT 1`,
            [username.trim(), role]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username, password, or role."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid username, password, or role."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        return res.json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
});

// =====================================================
// FORGOT PASSWORD — SEND OTP TO REGISTERED EMAIL
// =====================================================

router.post("/forgot-password", async (req, res) => {
    try {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            throw new Error("JWT_SECRET is not configured.");
        }

        // Find the registered user
        const [users] = await pool.execute(
            `SELECT id, name, email
             FROM santhiya_users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );

        // Do not reveal whether an email is registered
        if (users.length === 0) {
            return res.json({
                success: true,
                message:
                    "If the email is registered, an OTP will be sent."
            });
        }

        const user = users[0];

        // Rate limit: one OTP request per 60 seconds
        const [recent] = await pool.execute(
            `SELECT user_id
             FROM password_reset_otps
             WHERE user_id = ?
               AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
             LIMIT 1`,
            [user.id]
        );

        if (recent.length > 0) {
            return res.json({
                success: true,
                message:
                    "Please wait 60 seconds before requesting another OTP."
            });
        }

        // Generate a six-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();
        const hashedOtp = otpHash(user.id, otp);

        // Save OTP before sending email
        await pool.execute(
            `INSERT INTO password_reset_otps
                (user_id, otp_hash, expires_at,
                 attempts, verified_at, created_at)
             VALUES (
                ?, ?,
                DATE_ADD(NOW(), INTERVAL 5 MINUTE),
                0, NULL, NOW()
             )
             ON DUPLICATE KEY UPDATE
                otp_hash = VALUES(otp_hash),
                expires_at = VALUES(expires_at),
                attempts = 0,
                verified_at = NULL,
                created_at = NOW()`,
            [user.id, hashedOtp]
        );

        try {
            const transporter = createMailer();

            // Verify Gmail SMTP connection
            await transporter.verify();

            // Send OTP to the user's registered email
            const info = await transporter.sendMail({
                from: `"Santhiya Mart" <${process.env.SMTP_EMAIL}>`,
                to: user.email,
                subject: "Your Santhiya Mart password reset OTP",
                text:
                    `Hello ${user.name},\n\n` +
                    `Your password reset OTP is: ${otp}\n\n` +
                    `This OTP expires in 5 minutes.\n\n` +
                    `If you did not request this, ignore this email.`
            });

            console.log(
                "Password reset email accepted by mail server:",
                info.messageId
            );

        } catch (mailError) {
            console.error(
                "OTP EMAIL SENDING FAILED:",
                mailError
            );

            // Remove OTP if email could not be sent
            await pool.execute(
                `DELETE FROM password_reset_otps
                 WHERE user_id = ?`,
                [user.id]
            );

            throw mailError;
        }

        return res.json({
            success: true,
            message:
                "If the email is registered, an OTP will be sent."
        });

    } catch (error) {
        return resetTableError(res, error);
    }
});

// =====================================================
// VERIFY OTP
// =====================================================

router.post("/verify-reset-otp", async (req, res) => {
    try {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const otp =
            typeof req.body?.otp === "string"
                ? req.body.otp.trim()
                : "";

        if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email and 6-digit OTP."
            });
        }

        const [rows] = await pool.execute(
            `SELECT u.id, r.otp_hash, r.expires_at,
                    r.attempts, r.verified_at
             FROM santhiya_users u
             JOIN password_reset_otps r
               ON r.user_id = u.id
             WHERE u.email = ?
             LIMIT 1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP. Request a new one."
            });
        }

        const reset = rows[0];

        if (
            reset.verified_at ||
            new Date(reset.expires_at).getTime() <= Date.now() ||
            reset.attempts >= 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "OTP expired or maximum attempts reached. Request a new OTP."
            });
        }

        const suppliedHash = otpHash(reset.id, otp);

        if (!safeEqual(suppliedHash, reset.otp_hash)) {
            await pool.execute(
                `UPDATE password_reset_otps
                 SET attempts = attempts + 1
                 WHERE user_id = ?`,
                [reset.id]
            );

            return res.status(400).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        await pool.execute(
            `UPDATE password_reset_otps
             SET verified_at = NOW()
             WHERE user_id = ? AND verified_at IS NULL`,
            [reset.id]
        );

        return res.json({
            success: true,
            message: "OTP verified. You can now set a new password."
        });

    } catch (error) {
        return resetTableError(res, error);
    }
});

// =====================================================
// RESET PASSWORD
// =====================================================

router.post("/reset-password", async (req, res) => {
    let connection;

    try {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const newPassword = req.body?.newPassword;
        const confirmPassword = req.body?.confirmPassword;

        if (
            !EMAIL_REGEX.test(email) ||
            typeof newPassword !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields correctly."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT u.id, r.expires_at, r.verified_at
             FROM santhiya_users u
             JOIN password_reset_otps r
               ON r.user_id = u.id
             WHERE u.email = ?
             FOR UPDATE`,
            [email]
        );

        if (
            rows.length === 0 ||
            !rows[0].verified_at ||
            new Date(rows[0].expires_at).getTime() <= Date.now()
        ) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Verify a valid OTP before resetting your password."
            });
        }

        const userId = rows[0].id;
        const passwordHash = await bcrypt.hash(newPassword, 12);

        await connection.execute(
            `UPDATE santhiya_users
             SET password_hash = ?
             WHERE id = ?`,
            [passwordHash, userId]
        );

        // Prevent reuse of the verified OTP
        await connection.execute(
            `DELETE FROM password_reset_otps
             WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();

        return res.json({
            success: true,
            message:
                "Password reset successfully. Please log in with your new password."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback().catch(() => {});
        }

        return resetTableError(res, error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;