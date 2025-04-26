const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const User = require('../../models/User');

const validate_request = async (req, res,next) => {
  try {
      const token = req.cookies.token; 
      const remember_token = req.cookies.remember_token; 
      const userId = req.cookies.UserId; 
      if (!remember_token || !userId || !token) {
          return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findOne({ _id: userId });

      if (user) {
          // return res.status(200).json({ userId: user._id });
          next();
      } else {
          return res.status(404).json({ message: "User not found" });
      }

  } catch (error) {
      // console.error("Validation error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { validate_request };
