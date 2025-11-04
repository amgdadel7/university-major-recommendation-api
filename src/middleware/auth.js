const jwt = require('jsonwebtoken');

// Verify JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required'
    });
  }
  next();
};

// Check if user is university
const isUniversity = async (req, res, next) => {
  if (req.user.role !== 'university') {
    return res.status(403).json({
      success: false,
      message: 'University access required'
    });
  }
  
  // If UniversityID is not in token, fetch it from database
  if (!req.user.UniversityID && !req.user.universityId) {
    try {
      const pool = require('../config/database');
      const [users] = await pool.execute(
        'SELECT UniversityID FROM UniversityUsers WHERE UserID = ?',
        [req.user.id]
      );
      if (users.length > 0) {
        req.user.UniversityID = users[0].UniversityID;
        req.user.universityId = users[0].UniversityID;
      }
    } catch (error) {
      console.error('Error fetching UniversityID:', error);
    }
  }
  
  next();
};

// Check if user is student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required'
    });
  }
  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isTeacher,
  isUniversity,
  isStudent
};

