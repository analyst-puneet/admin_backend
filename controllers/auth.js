const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt'); 
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User Not Found ' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password' });
        }
        const remember_token = Math.floor(1000000000 + Math.random() * 9000076000).toString(); 
        const hashedToken = await bcrypt.hash(remember_token, 10); 

        user.remember_token = hashedToken;
        await user.save();
        res.set('UserId', user._id); 
        res.set('remember_token', remember_token);
        const tokenData = {
            id: user._id,
            email: user.email,
            username: user.username,
            role_id: user.role_id
        };
        
        const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000 
        });

        res.cookie("UserId", user._id, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000
        });

        res.cookie("remember_token", remember_token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 1000
        });
        console.log(user._id);
        return res.status(200).json({ message: "Login successful" });


    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    res.clearCookie("token");
    res.clearCookie("UserId");
    res.clearCookie("remember_token");
    res.json({ message: "Logged out successfully" });
};
const validate = async (req, res) => {
    try {
        const token = req.cookies.token; 
        const remember_token = req.cookies.remember_token; 
        const userId = req.cookies.UserId; 
        if (!remember_token || !userId || !token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findOne({ _id: userId });

        if (user) {
            return res.status(200).json({ userId: user._id });
        } else {
            return res.status(404).json({ message: "User not found" });
        }

    } catch (error) {
        console.error("Validation error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {  login, logout, validate};
