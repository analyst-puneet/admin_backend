const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authenticate = async (req, res, next) => {
    const token = req.cookies.token;
    const userId = req.cookies.UserId;
    const rememberToken = req.cookies.remember_token
    console.log('token--',token);
    if (!token || !userId || !rememberToken) {
        return res.status(401).json({ message: 'Access denied. No UserId or remember_token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findById(userId);
        req.user = decoded;
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        const isTokenMatch = await bcrypt.compare(rememberToken, user.remember_token);
        if (!isTokenMatch) {
            return res.status(401).json({ message: 'Invalid remember token.' });
        }

        next();
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = { authenticate }; 