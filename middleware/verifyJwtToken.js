const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Mongoose User model

module.exports = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: 0,
        message: "Access Denied! Unauthorized User",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // Find the user associated with the token
    const user = await User.findById(decoded.id); // Use findById for MongoDB
   
    if (!user) {
      return res.status(401).json({
        success: 0,
        message: "Access Denied! No user found!",
      });
    }

    // Attach user info to the request object
    req.user = user; // You may attach more specific info if needed
    
    next();
  } catch (err) {
    console.error('JWT Authentication Error:', err);
    return res.status(401).json({
      success: 0,
      message: 'Unauthorized - Invalid or expired token',
    });
  }
};
