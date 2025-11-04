const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'University Major Recommendation API',
      version: '1.0.0',
      description: 'API متكاملة لنظام توصية التخصصات الجامعية',
      contact: {
        name: 'API Support',
        email: 'support@university-recommendation.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server'
      },
      {
        url: 'https://api.university-recommendation.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'أدخل JWT token. مثال: Bearer {token}'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            data: {
              type: 'object'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin', 'university'],
              example: 'student'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'],
          properties: {
            fullName: {
              type: 'string',
              example: 'أحمد محمد'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'ahmed@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            role: {
              type: 'string',
              enum: ['student', 'teacher', 'admin', 'university'],
              example: 'student'
            },
            age: {
              type: 'integer',
              example: 20
            },
            gender: {
              type: 'string',
              enum: ['M', 'F', 'Other'],
              example: 'M'
            },
            universityId: {
              type: 'integer',
              example: 1
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1
                    },
                    email: {
                      type: 'string',
                      example: 'user@example.com'
                    },
                    name: {
                      type: 'string',
                      example: 'أحمد محمد'
                    },
                    role: {
                      type: 'string',
                      example: 'student'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'المصادقة والتسجيل'
      },
      {
        name: 'Students',
        description: 'إدارة الطلاب'
      },
      {
        name: 'Teachers',
        description: 'إدارة المعلمين'
      },
      {
        name: 'Universities',
        description: 'إدارة الجامعات'
      },
      {
        name: 'Majors',
        description: 'إدارة التخصصات'
      },
      {
        name: 'Applications',
        description: 'إدارة الطلبات'
      },
      {
        name: 'Survey',
        description: 'الاستبيانات'
      },
      {
        name: 'Dashboard',
        description: 'لوحة التحكم والإحصائيات'
      },
      {
        name: 'Admin',
        description: 'إدارة النظام'
      },
      {
        name: 'Reports',
        description: 'التقارير'
      },
      {
        name: 'Backup',
        description: 'النسخ الاحتياطي'
      },
      {
        name: 'Content',
        description: 'المحتوى والإعلانات'
      },
      {
        name: 'Calendar',
        description: 'التقويم والأحداث'
      },
      {
        name: 'Notifications',
        description: 'الإشعارات'
      },
      {
        name: 'Messages',
        description: 'الرسائل والمحادثات'
      },
      {
        name: 'Interviews',
        description: 'المقابلات'
      },
      {
        name: 'Semesters',
        description: 'الفصول الدراسية'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

