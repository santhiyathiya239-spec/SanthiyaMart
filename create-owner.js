
require("dotenv").config();

const bcrypt = require("bcryptjs");
const readline = require("readline/promises");
const pool = require("./config/db");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createOwner() {
    try {
        const name = (await rl.question("Owner name: ")).trim();
        const email = (await rl.question("Owner email: ")).trim();
        const username = (await rl.question("Owner username: ")).trim();
        const password = await rl.question("Choose Owner password: ");

        if (!name || !email || !username || !password) {
            throw new Error("All fields are required.");
        }

        if (password.length < 8) {
            throw new Error("Password must contain at least 8 characters.");
        }

        const [existing] = await pool.execute(
            `SELECT id FROM santhiya_users
             WHERE email = ? OR username = ?
             LIMIT 1`,
            [email, username]
        );

        if (existing.length > 0) {
            throw new Error(
                "Email or username already exists. No account was changed."
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.execute(
            `INSERT INTO santhiya_users
             (name, email, username, password_hash, role)
             VALUES (?, ?, ?, ?, 'owner')`,
            [name, email, username, passwordHash]
        );

        console.log("Owner account created successfully!");
        console.log("Keep your username and password private.");
    } catch (error) {
        console.error("Owner setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await pool.end();
    }
}

createOwner();
