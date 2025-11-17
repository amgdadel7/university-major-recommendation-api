/**
 * Swagger Configuration / تكوين Swagger
 * This file configures Swagger/OpenAPI documentation for the API
 * هذا الملف يقوم بتكوين توثيق Swagger/OpenAPI لـ API
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Swagger Configuration Options / خيارات تكوين Swagger
const options = {
  definition: {
    openapi: '3.0.0', // OpenAPI specification version / إصدار مواصفات OpenAPI
    info: {
      title: 'University Major Recommendation API', // API title / عنوان API
      version: '1.0.0', // API version / إصدار API
      description: 'API متكاملة لنظام توصية التخصصات الجامعية', // API description in Arabic / وصف API بالعربية
      contact: {
        name: 'API Support', // Support contact name / اسم جهة الاتصال للدعم
        email: 'support@university-recommendation.com' // Support email / بريد الدعم
      },
      license: {
        name: 'ISC', // License name / اسم الترخيص
        url: 'https://opensource.org/licenses/ISC' // License URL / رابط الترخيص
      }
    },
    // API Server URLs / عناوين URL لخوادم API
    servers: [
      {
        url: 'http://localhost:8000', // Development server URL / عنوان خادم التطوير
        description: 'Development server' // Server description / وصف الخادم
      },
      {
        url: 'https://api.university-recommendation.com', // Production server URL / عنوان خادم الإنتاج
        description: 'Production server' // Server description / وصف الخادم
      }
    ],
    // API Components / مكونات API
    components: {
      // Security Schemes / مخططات الأمان
      securitySchemes: {
        bearerAuth: {
          type: 'http', // Authentication type / نوع المصادقة
          scheme: 'bearer', // Bearer token scheme / مخطط رمز Bearer
          bearerFormat: 'JWT', // Token format / تنسيق الرمز
          description: 'أدخل JWT token. مثال: Bearer {token}' // Description in Arabic / الوصف بالعربية
        }
      },
      // Data Schemas / مخططات البيانات
      schemas: {
        // Error Response Schema / مخطط استجابة الخطأ
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean', // Success flag / علامة النجاح
              example: false // Example value / قيمة مثال
            },
            message: {
              type: 'string', // Error message / رسالة الخطأ
              example: 'Error message' // Example message / رسالة مثال
            }
          }
        },
        // Success Response Schema / مخطط استجابة النجاح
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean', // Success flag / علامة النجاح
              example: true // Example value / قيمة مثال
            },
            message: {
              type: 'string', // Success message / رسالة النجاح
              example: 'Operation successful' // Example message / رسالة مثال
            },
            data: {
              type: 'object' // Response data / بيانات الاستجابة
            }
          }
        },
        // Login Request Schema / مخطط طلب تسجيل الدخول
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'role'], // Required fields / الحقول المطلوبة
          properties: {
            email: {
              type: 'string', // Email field type / نوع حقل البريد الإلكتروني
              format: 'email', // Email format validation / التحقق من تنسيق البريد
              example: 'user@example.com' // Example email / مثال على البريد
            },
            password: {
              type: 'string', // Password field type / نوع حقل كلمة المرور
              format: 'password', // Password format / تنسيق كلمة المرور
              example: 'password123' // Example password / مثال على كلمة المرور
            },
            role: {
              type: 'string', // Role field type / نوع حقل الدور
              enum: ['student', 'teacher', 'admin', 'university'], // Allowed roles / الأدوار المسموحة
              example: 'student' // Example role / مثال على الدور
            }
          }
        },
        // Register Request Schema / مخطط طلب التسجيل
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'], // Required fields / الحقول المطلوبة
          properties: {
            fullName: {
              type: 'string', // Full name field / حقل الاسم الكامل
              example: 'أحمد محمد' // Example name in Arabic / مثال على الاسم بالعربية
            },
            email: {
              type: 'string', // Email field / حقل البريد الإلكتروني
              format: 'email', // Email format / تنسيق البريد
              example: 'ahmed@example.com' // Example email / مثال على البريد
            },
            password: {
              type: 'string', // Password field / حقل كلمة المرور
              format: 'password', // Password format / تنسيق كلمة المرور
              example: 'password123' // Example password / مثال على كلمة المرور
            },
            role: {
              type: 'string', // Role field / حقل الدور
              enum: ['student', 'teacher', 'admin', 'university'], // Allowed roles / الأدوار المسموحة
              example: 'student' // Example role / مثال على الدور
            },
            age: {
              type: 'integer', // Age field / حقل العمر
              example: 20 // Example age / مثال على العمر
            },
            gender: {
              type: 'string', // Gender field / حقل الجنس
              enum: ['M', 'F', 'Other'], // Allowed values / القيم المسموحة
              example: 'M' // Example gender / مثال على الجنس
            },
            universityId: {
              type: 'integer', // University ID field / حقل معرف الجامعة
              example: 1 // Example university ID / مثال على معرف الجامعة
            }
          }
        },
        // Authentication Response Schema / مخطط استجابة المصادقة
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean', // Success flag / علامة النجاح
              example: true // Example value / قيمة مثال
            },
            message: {
              type: 'string', // Response message / رسالة الاستجابة
              example: 'Login successful' // Example message / رسالة مثال
            },
            data: {
              type: 'object', // Response data / بيانات الاستجابة
              properties: {
                token: {
                  type: 'string', // JWT token / رمز JWT
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Example token / مثال على الرمز
                },
                user: {
                  type: 'object', // User object / كائن المستخدم
                  properties: {
                    id: {
                      type: 'integer', // User ID / معرف المستخدم
                      example: 1 // Example ID / مثال على المعرف
                    },
                    email: {
                      type: 'string', // User email / بريد المستخدم
                      example: 'user@example.com' // Example email / مثال على البريد
                    },
                    name: {
                      type: 'string', // User name / اسم المستخدم
                      example: 'أحمد محمد' // Example name in Arabic / مثال على الاسم بالعربية
                    },
                    role: {
                      type: 'string', // User role / دور المستخدم
                      example: 'student' // Example role / مثال على الدور
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    // API Tags / علامات API
    // Used to group related endpoints in the documentation
    // تُستخدم لتجميع نقاط النهاية ذات الصلة في التوثيق
    tags: [
      {
        name: 'Auth', // Authentication tag / علامة المصادقة
        description: 'المصادقة والتسجيل' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Students', // Students tag / علامة الطلاب
        description: 'إدارة الطلاب' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Teachers', // Teachers tag / علامة المعلمين
        description: 'إدارة المعلمين' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Universities', // Universities tag / علامة الجامعات
        description: 'إدارة الجامعات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Majors', // Majors tag / علامة التخصصات
        description: 'إدارة التخصصات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Applications', // Applications tag / علامة الطلبات
        description: 'إدارة الطلبات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Survey', // Survey tag / علامة الاستبيانات
        description: 'الاستبيانات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Dashboard', // Dashboard tag / علامة لوحة التحكم
        description: 'لوحة التحكم والإحصائيات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Admin', // Admin tag / علامة الإدارة
        description: 'إدارة النظام' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Reports', // Reports tag / علامة التقارير
        description: 'التقارير' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Backup', // Backup tag / علامة النسخ الاحتياطي
        description: 'النسخ الاحتياطي' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Content', // Content tag / علامة المحتوى
        description: 'المحتوى والإعلانات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Calendar', // Calendar tag / علامة التقويم
        description: 'التقويم والأحداث' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Notifications', // Notifications tag / علامة الإشعارات
        description: 'الإشعارات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Messages', // Messages tag / علامة الرسائل
        description: 'الرسائل والمحادثات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Interviews', // Interviews tag / علامة المقابلات
        description: 'المقابلات' // Description in Arabic / الوصف بالعربية
      },
      {
        name: 'Semesters', // Semesters tag / علامة الفصول الدراسية
        description: 'الفصول الدراسية' // Description in Arabic / الوصف بالعربية
      }
    ]
  },
  // Files to scan for Swagger annotations / الملفات المطلوب فحصها للتعليقات التوضيحية لـ Swagger
  apis: ['./src/routes/*.js', './src/server.js']
};

// Generate Swagger specification / إنشاء مواصفات Swagger
const swaggerSpec = swaggerJsdoc(options);

// Export Swagger specification / تصدير مواصفات Swagger
module.exports = swaggerSpec;

