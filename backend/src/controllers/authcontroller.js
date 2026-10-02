const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");

exports.register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const [existing] =
            await db.execute(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await db.execute(
            `
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
            `,
            [
                name,
                email,
                hashedPassword
            ]
        );

        res.status(201).json({
            message:
                "User registered successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const [users] =
            await db.execute(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

        if (users.length === 0) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {

            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};