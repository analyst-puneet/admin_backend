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
const checkUserToken = async (req, res, next) => {
    const userId = req.header('UserId');
    const rememberToken = req.header('remember_token');

    if (!userId || !rememberToken) {
        return res.status(401).json({ message: 'Access denied. No UserId or remember_token provided.' });
    }
//  console.log(userId,rememberToken);
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const isTokenMatch = await bcrypt.compare(rememberToken, user.remember_token);
        if (!isTokenMatch) {
            return res.status(401).json({ message: 'Invalid remember token.' });
        }

        next(); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { authenticate, checkUserToken }; 