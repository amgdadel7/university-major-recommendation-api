/**
 * Logger Middleware / برمجية التسجيل
 * This file contains functions for logging and audit trails
 * هذا الملف يحتوي على دوال التسجيل ومسارات التدقيق
 */

const pool = require('../config/database');

/**
 * Log Audit Trail / تسجيل مسار التدقيق
 * Records user actions in the audit log table
 * يسجل إجراءات المستخدم في جدول سجل التدقيق
 * @param {number} userId - User ID / معرف المستخدم
 * @param {string} userName - User name / اسم المستخدم
 * @param {string} action - Action performed (create, update, delete, view) / الإجراء المنفذ
 * @param {string} entity - Entity affected (table name) / الكيان المتأثر (اسم الجدول)
 * @param {string} description - Action description / وصف الإجراء
 * @param {string} ipAddress - User IP address / عنوان IP للمستخدم
 * @param {string} userAgent - User agent string / سلسلة وكيل المستخدم
 * @param {string} severity - Log severity (low, medium, high) / شدة السجل
 */
const logAudit = async (userId, userName, action, entity, description, ipAddress, userAgent, severity = 'medium') => {
  try {
    // Insert audit log record / إدراج سجل التدقيق
    await pool.execute(
      `INSERT INTO AuditLogs (UserID, UserName, Action, Entity, Description, IPAddress, UserAgent, Severity, CreatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, userName, action, entity, description, ipAddress, userAgent, severity]
    );
  } catch (error) {
    // Error logging audit - silently fail to not disrupt request flow
    // خطأ في تسجيل التدقيق - فشل بصمت لعدم تعطيل تدفق الطلب
  }
};

/**
 * Request Audit Logger Middleware / برمجية تسجيل تدقيق الطلبات
 * Automatically logs all authenticated requests to the audit trail
 * يسجل تلقائياً جميع الطلبات المصادق عليها في مسار التدقيق
 * @param {Object} req - Express request object / كائن طلب Express
 * @param {Object} res - Express response object / كائن استجابة Express
 * @param {Function} next - Express next middleware function / دالة البرمجية التالية في Express
 */
const auditLogger = (req, res, next) => {
  // Store original response methods to intercept / تخزين طرق الاستجابة الأصلية للاعتراض
  const originalJson = res.json;
  const originalSend = res.send;

  // Override res.json to log after response is sent / تجاوز res.json لتسجيل بعد إرسال الاستجابة
  res.json = function (body) {
    // Log after response is sent / تسجيل بعد إرسال الاستجابة
    // Only log if user is authenticated and response is successful
    // تسجيل فقط إذا كان المستخدم مصادق عليه والاستجابة ناجحة
    if (req.user && res.statusCode < 500) {
      // Map HTTP methods to action types / تعيين طرق HTTP لأنواع الإجراءات
      const action = req.method === 'GET' ? 'view' : // GET = view / GET = عرض
                     req.method === 'POST' ? 'create' : // POST = create / POST = إنشاء
                     req.method === 'PUT' ? 'update' : // PUT = update / PUT = تحديث
                     req.method === 'PATCH' ? 'update' : // PATCH = update / PATCH = تحديث
                     req.method === 'DELETE' ? 'delete' : // DELETE = delete / DELETE = حذف
                     'unknown'; // Unknown method / طريقة غير معروفة
      
      // Extract entity name from path / استخراج اسم الكيان من المسار
      const entity = req.path.split('/')[2] || 'unknown';
      
      // Create description from method and path / إنشاء وصف من الطريقة والمسار
      const description = `${req.method} ${req.path}`;
      
      // Get client IP address / الحصول على عنوان IP للعميل
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // Get user agent string / الحصول على سلسلة وكيل المستخدم
      const userAgent = req.get('user-agent') || '';

      // Log the audit trail / تسجيل مسار التدقيق
      logAudit(
        req.user.id || req.user.userId, // User ID / معرف المستخدم
        req.user.name || req.user.userName || 'Unknown', // User name / اسم المستخدم
        action, // Action type / نوع الإجراء
        entity, // Entity name / اسم الكيان
        description, // Description / الوصف
        ipAddress, // IP address / عنوان IP
        userAgent, // User agent / وكيل المستخدم
        'low' // Severity level / مستوى الشدة
      );
    }
    // Call original json method / استدعاء طريقة json الأصلية
    return originalJson.call(this, body);
  };

  // Continue to next middleware / المتابعة إلى البرمجية التالية
  next();
};

module.exports = { logAudit, auditLogger };

