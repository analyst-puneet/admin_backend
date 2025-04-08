const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token Present .' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token.' });
    }
};


module.exports = { authenticate }; 
