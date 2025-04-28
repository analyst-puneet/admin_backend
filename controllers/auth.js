const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt'); 
const crypto = require('crypto');

const register = async (req, res) => {
    try {
        const { username, password, confirmPassword,email } = req.body;
        if (!username || !email|| !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Password do not match" });
        }

        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "Username already exit " });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            email,
            username,
            password: hashedPassword,
            original_password: password,
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User Not Found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password' });
        }

        const remember_token = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(remember_token, 10);

        user.remember_token = hashedToken;
        await user.save();

        const tokenData = {
            id: user._id,
            email: user.email,
            username: user.username,
            role_id: user.role_id
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.cookie("UserId", user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie("remember_token", remember_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: "Login successful" });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const logout = async (req, res) => {
    const id = req.cookies.UserId;
    if (!id) {
        return res.status(400).json({ message: "Invalid request" });
    }
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax"
        });
        res.clearCookie("UserId", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax"
        });
        res.clearCookie("remember_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Lax"
        });

        const user = await User.findById(id);
        if (user) {
            user.remember_token = null;
            await user.save();
            return res.status(200).json({ message: "Logged out successfully" });
        }

        return res.status(404).json({ message: "User not found" });

    } catch (e) {
        console.error("Logout error:", e);
        return res.status(500).json({ message: "Server error", error: e.message });
    }
};

const validate = async (req, res) => {
    try {
        const token = req.cookies.token;
        const remember_token = req.cookies.remember_token;
        const userId = req.cookies.UserId;

        if (!token || !remember_token || !userId) {
            return res.status(401).json({ message: "Unauthorized - Missing cookies" });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(userId);
        if (!user || !user.remember_token) {
            return res.status(401).json({ message: "Unauthorized - User not found or not logged in" });
        }

        const isTokenMatch = await bcrypt.compare(remember_token, user.remember_token);
        if (!isTokenMatch) {
            return res.status(401).json({ message: "Unauthorized - Invalid remember_token" });
        }
        return res.status(200).json({ userId : user._id});

    } catch (error) {
        console.error("Validation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, logout, validate };
