const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const validate_request = async (req, res, next) => {
  const { token, userId, rememberToken } = req.body ?? {};

  
  try {
    if (!token || !userId || !rememberToken) {
      return res.status(401).json({ message: 'Access denied. No token, userId or rememberToken present In request Body.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('yes decoded=',decoded);
    req.user = decoded;

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
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { validate_request };
