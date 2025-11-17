/**
 * Database Configuration / تكوين قاعدة البيانات
 * This file sets up the MySQL connection pool for the application
 * هذا الملف يقوم بإعداد مجموعة اتصالات MySQL للتطبيق
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create Connection Pool / إنشاء مجموعة الاتصالات
// Connection pool manages multiple database connections efficiently
// مجموعة الاتصالات تدير عدة اتصالات قاعدة بيانات بكفاءة
const pool = mysql.createPool({
  // Database connection settings from environment variables or defaults
  // إعدادات اتصال قاعدة البيانات من المتغيرات البيئية أو القيم الافتراضية
  host: process.env.DB_HOST || 'mysql5047.site4now.net', // Database host / مضيف قاعدة البيانات
  user: process.env.DB_USER || 'abf0c2_umj', // Database username / اسم مستخدم قاعدة البيانات
  password: process.env.DB_PASSWORD || 'admin123', // Database password / كلمة مرور قاعدة البيانات
  database: process.env.DB_NAME || 'db_abf0c2_umj', // Database name / اسم قاعدة البيانات
  port: process.env.DB_PORT || 3306, // Database port / منفذ قاعدة البيانات
  
  // Pool configuration / تكوين المجموعة
  waitForConnections: true, // Wait for available connection / انتظار اتصال متاح
  connectionLimit: 10, // Maximum number of connections / الحد الأقصى لعدد الاتصالات
  queueLimit: 0, // Unlimited queue / قائمة انتظار غير محدودة
  enableKeepAlive: true, // Keep connections alive / الحفاظ على الاتصالات نشطة
  keepAliveInitialDelay: 0 // Initial delay for keep-alive / التأخير الأولي للحفاظ على الاتصال
});

// Test Database Connection / اختبار اتصال قاعدة البيانات
// Verify that the database connection is working properly
// التحقق من أن اتصال قاعدة البيانات يعمل بشكل صحيح
pool.getConnection()
  .then(connection => {
    // Connection successful, release it back to the pool
    // نجح الاتصال، إرجاعه إلى المجموعة
    connection.release();
  })
  .catch(err => {
    // Connection failed - error is silently caught
    // فشل الاتصال - يتم التقاط الخطأ بصمت
    // Note: In production, you may want to log this error
    // ملاحظة: في الإنتاج، قد ترغب في تسجيل هذا الخطأ
  });

// Export connection pool for use in other modules
// تصدير مجموعة الاتصالات للاستخدام في الوحدات الأخرى
module.exports = pool;

