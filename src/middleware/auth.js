/**
 * Authentication Middleware / برمجية المصادقة
 * This file contains middleware functions for authentication and authorization
 * هذا الملف يحتوي على دوال البرمجية للمصادقة والتفويض
 */

const jwt = require('jsonwebtoken');

/**
 * Authenticate JWT Token / مصادقة رمز JWT
 * Verifies the JWT token from the Authorization header
 * يتحقق من رمز JWT من رأس Authorization
 * @param {Object} req - Express request object / كائن طلب Express
 * @param {Object} res - Express response object / كائن استجابة Express
 * @param {Function} next - Express next middleware function / دالة البرمجية التالية في Express
 */
const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header / استخراج الرمز من رأس Authorization
    // Format: "Bearer <token>" / التنسيق: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    // Check if token exists / التحقق من وجود الرمز
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required' // Authentication required message / رسالة المصادقة مطلوبة
      });
    }

    // Verify and decode JWT token / التحقق من رمز JWT وفك تشفيره
    // Uses JWT_SECRET from environment or default (should be changed in production)
    // يستخدم JWT_SECRET من المتغيرات البيئية أو القيمة الافتراضية (يجب تغييرها في الإنتاج)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    
    // Attach decoded user info to request object / إرفاق معلومات المستخدم المفكوكة بكائن الطلب
    req.user = decoded;
    
    // Continue to next middleware / المتابعة إلى البرمجية التالية
    next();
  } catch (error) {
    // Token verification failed / فشل التحقق من الرمز
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token' // Invalid token message / رسالة الرمز غير صالح
    });
  }
};

/**
 * Admin Authorization Middleware / برمجية تفويض المدير
 * Checks if the authenticated user has admin role
 * يتحقق من أن المستخدم المصادق عليه لديه دور المدير
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required' // Admin access required message / رسالة الوصول للمدير مطلوب
    });
  }
  next(); // Continue if user is admin / المتابعة إذا كان المستخدم مدير
};

/**
 * Teacher Authorization Middleware / برمجية تفويض المعلم
 * Checks if the authenticated user has teacher role
 * يتحقق من أن المستخدم المصادق عليه لديه دور المعلم
 */
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Teacher access required' // Teacher access required message / رسالة الوصول للمعلم مطلوب
    });
  }
  next(); // Continue if user is teacher / المتابعة إذا كان المستخدم معلم
};

/**
 * University Authorization Middleware / برمجية تفويض الجامعة
 * Checks if the authenticated user has university role
 * يتحقق من أن المستخدم المصادق عليه لديه دور الجامعة
 */
const isUniversity = async (req, res, next) => {
  if (req.user.role !== 'university') {
    return res.status(403).json({
      success: false,
      message: 'University access required' // University access required message / رسالة الوصول للجامعة مطلوب
    });
  }
  
  // If UniversityID is not in token, fetch it from database
  // إذا لم يكن UniversityID في الرمز، احضره من قاعدة البيانات
  if (!req.user.UniversityID && !req.user.universityId) {
    try {
      const pool = require('../config/database');
      // Fetch university ID from database / جلب معرف الجامعة من قاعدة البيانات
      const [users] = await pool.execute(
        'SELECT UniversityID FROM UniversityUsers WHERE UserID = ?',
        [req.user.id]
      );
      if (users.length > 0) {
        // Attach university ID to user object / إرفاق معرف الجامعة بكائن المستخدم
        req.user.UniversityID = users[0].UniversityID;
        req.user.universityId = users[0].UniversityID;
      }
    } catch (error) {
      // Error fetching university ID - silently continue / خطأ في جلب معرف الجامعة - المتابعة بصمت
    }
  }
  
  next(); // Continue if user is university / المتابعة إذا كان المستخدم جامعة
};

/**
 * Student Authorization Middleware / برمجية تفويض الطالب
 * Checks if the authenticated user has student role
 * يتحقق من أن المستخدم المصادق عليه لديه دور الطالب
 */
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Student access required' // Student access required message / رسالة الوصول للطالب مطلوب
    });
  }
  next(); // Continue if user is student / المتابعة إذا كان المستخدم طالب
};

module.exports = {
  authenticate,
  isAdmin,
  isTeacher,
  isUniversity,
  isStudent
};

