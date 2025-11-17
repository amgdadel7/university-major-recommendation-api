/**
 * Main Server File / ملف الخادم الرئيسي
 * This file sets up and configures the Express server for the University Major Recommendation API
 * هذا الملف يقوم بإعداد وتكوين خادم Express لواجهة برمجة تطبيقات نظام توصية التخصصات الجامعية
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Initialize Express application / تهيئة تطبيق Express
const app = express();

// Security and Performance Middleware / برمجيات الأمان والأداء
// Helmet helps secure Express apps by setting various HTTP headers
// Helmet يساعد في تأمين تطبيقات Express عن طريق تعيين رؤوس HTTP المختلفة
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for API flexibility / معطل لمرونة API
}));

// Compression middleware to reduce response size / برمجية ضغط لتقليل حجم الاستجابة
app.use(compression());

// CORS middleware to allow cross-origin requests / برمجية CORS للسماح بطلبات المصدر المتقاطع
app.use(cors());

// Parse JSON request bodies / تحليل أجسام طلبات JSON
app.use(express.json());

// Parse URL-encoded request bodies / تحليل أجسام طلبات المشفرة في URL
app.use(express.urlencoded({ extended: true }));

// HTTP request logger middleware / برمجية تسجيل طلبات HTTP
app.use(morgan('combined'));

// Swagger API Documentation / توثيق API باستخدام Swagger
// Serves interactive API documentation at /api-docs endpoint
// يقدم توثيق API تفاعلي في نقطة النهاية /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }', // Hide topbar / إخفاء الشريط العلوي
  customSiteTitle: 'University Major Recommendation API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Import Route Modules / استيراد وحدات المسارات
// All route handlers are organized in separate files for better maintainability
// جميع معالجات المسارات منظمة في ملفات منفصلة لسهولة الصيانة
const authRoutes = require('./routes/auth'); // Authentication routes / مسارات المصادقة
const studentsRoutes = require('./routes/students'); // Student management routes / مسارات إدارة الطلاب
const teachersRoutes = require('./routes/teachers'); // Teacher management routes / مسارات إدارة المعلمين
const universitiesRoutes = require('./routes/universities'); // University management routes / مسارات إدارة الجامعات
const majorsRoutes = require('./routes/majors'); // Major management routes / مسارات إدارة التخصصات
const applicationsRoutes = require('./routes/applications'); // Application management routes / مسارات إدارة الطلبات
const surveyRoutes = require('./routes/survey'); // Survey routes / مسارات الاستبيانات
const dashboardRoutes = require('./routes/dashboard'); // Dashboard routes / مسارات لوحة التحكم
const adminRoutes = require('./routes/admin'); // Admin routes / مسارات الإدارة
const reportsRoutes = require('./routes/reports'); // Reports routes / مسارات التقارير
const backupRoutes = require('./routes/backup'); // Backup routes / مسارات النسخ الاحتياطي
const contentRoutes = require('./routes/content'); // Content management routes / مسارات إدارة المحتوى
const calendarRoutes = require('./routes/calendar'); // Calendar routes / مسارات التقويم
const notificationsRoutes = require('./routes/notifications'); // Notification routes / مسارات الإشعارات
const messagesRoutes = require('./routes/messages'); // Messaging routes / مسارات الرسائل
const interviewsRoutes = require('./routes/interviews'); // Interview routes / مسارات المقابلات
const semestersRoutes = require('./routes/semesters'); // Semester routes / مسارات الفصول الدراسية
const permissionsRoutes = require('./routes/permissions'); // Permission management routes / مسارات إدارة الصلاحيات
const universityUsersRoutes = require('./routes/university-users'); // University user routes / مسارات مستخدمي الجامعات
const schemaRoutes = require('./routes/schema'); // Database schema routes / مسارات مخطط قاعدة البيانات
const recommendationsRoutes = require('./routes/recommendations'); // Recommendation routes / مسارات التوصيات
const aiRoutes = require('./routes/ai'); // AI integration routes / مسارات تكامل الذكاء الاصطناعي

// Register API Routes / تسجيل مسارات API
// All routes are prefixed with /api/{version} for versioning support
// جميع المسارات مسبوقة بـ /api/{version} لدعم إصدارات API
const API_VERSION = process.env.API_VERSION || 'v1'; // API version from environment or default to v1 / إصدار API من المتغيرات البيئية أو افتراضي v1

// Authentication endpoints / نقاط نهاية المصادقة
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Resource management endpoints / نقاط نهاية إدارة الموارد
app.use(`/api/${API_VERSION}/students`, studentsRoutes);
app.use(`/api/${API_VERSION}/teachers`, teachersRoutes);
app.use(`/api/${API_VERSION}/universities`, universitiesRoutes);
app.use(`/api/${API_VERSION}/majors`, majorsRoutes);
app.use(`/api/${API_VERSION}/applications`, applicationsRoutes);
app.use(`/api/${API_VERSION}/university-users`, universityUsersRoutes);

// Feature endpoints / نقاط نهاية الميزات
app.use(`/api/${API_VERSION}/survey`, surveyRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);
app.use(`/api/${API_VERSION}/recommendations`, recommendationsRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);

// Administrative endpoints / نقاط نهاية الإدارة
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/reports`, reportsRoutes);
app.use(`/api/${API_VERSION}/backup`, backupRoutes);
app.use(`/api/${API_VERSION}/permissions`, permissionsRoutes);

// Communication endpoints / نقاط نهاية التواصل
app.use(`/api/${API_VERSION}/content`, contentRoutes);
app.use(`/api/${API_VERSION}/calendar`, calendarRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationsRoutes);
app.use(`/api/${API_VERSION}/messages`, messagesRoutes);
app.use(`/api/${API_VERSION}/interviews`, interviewsRoutes);

// Academic endpoints / نقاط نهاية أكاديمية
app.use(`/api/${API_VERSION}/semesters`, semestersRoutes);

// System endpoints / نقاط نهاية النظام
app.use(`/api/${API_VERSION}/schema`, schemaRoutes);

// Health Check Endpoint / نقطة نهاية فحص الصحة
// Used to verify that the API server is running and responsive
// تُستخدم للتحقق من أن خادم API يعمل ويستجيب
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running', // English message / رسالة بالإنجليزية
    timestamp: new Date().toISOString() // Current server time / وقت الخادم الحالي
  });
});

// Root Endpoint / نقطة النهاية الجذرية
// Provides API information and available endpoints
// يوفر معلومات API ونقاط النهاية المتاحة
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University Major Recommendation API', // API name / اسم API
    version: API_VERSION, // Current API version / إصدار API الحالي
    documentation: '/api-docs', // Swagger documentation URL / رابط توثيق Swagger
    endpoints: { // Available API endpoints / نقاط نهاية API المتاحة
      auth: `/api/${API_VERSION}/auth`,
      students: `/api/${API_VERSION}/students`,
      teachers: `/api/${API_VERSION}/teachers`,
      universities: `/api/${API_VERSION}/universities`,
      majors: `/api/${API_VERSION}/majors`,
      applications: `/api/${API_VERSION}/applications`,
      survey: `/api/${API_VERSION}/survey`,
      dashboard: `/api/${API_VERSION}/dashboard`,
      admin: `/api/${API_VERSION}/admin`,
      swagger: '/api-docs' // API documentation / توثيق API
    }
  });
});

// Error Handling Middleware / برمجية معالجة الأخطاء
// Catches all errors and returns a standardized error response
// تلتقط جميع الأخطاء وتعيد استجابة خطأ موحدة
app.use((err, req, res, next) => {
  // Return error response with status code / إرجاع استجابة خطأ مع رمز الحالة
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error', // Error message / رسالة الخطأ
    // Include stack trace in development mode only / تضمين تتبع المكدس في وضع التطوير فقط
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Not Found Handler / معالج 404 غير موجود
// Handles requests to non-existent routes
// يتعامل مع الطلبات للمسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found' // Route not found message / رسالة المسار غير موجود
  });
});

// Server Configuration / تكوين الخادم
const PORT = process.env.PORT || 8000; // Port from environment or default 8000 / المنفذ من المتغيرات البيئية أو افتراضي 8000

// Start Server / بدء الخادم
// Listen on all network interfaces (0.0.0.0) to allow connections from other devices
// الاستماع على جميع واجهات الشبكة (0.0.0.0) للسماح بالاتصالات من الأجهزة الأخرى
app.listen(PORT, '0.0.0.0', () => {
  // Server started successfully / تم بدء الخادم بنجاح
  // Note: Add console.log here if needed for startup confirmation
  // ملاحظة: أضف console.log هنا إذا لزم الأمر لتأكيد بدء التشغيل
});

// Export app for testing purposes / تصدير التطبيق لأغراض الاختبار
module.exports = app;

