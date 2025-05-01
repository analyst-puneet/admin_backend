const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const validate_request = async (req, res, next) => {
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

      if (decoded.id !== userId) {
          return res.status(401).json({ message: "Unauthorized - Token mismatch" });
      }

      req.user = user;

      console.log('User Authenticated:', user.username);
      next(); 

  } catch (error) {
      console.error('Validation Middleware Error:', error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { validate_request };
