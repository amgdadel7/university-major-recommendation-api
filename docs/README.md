# University Major Recommendation API

## فهرس التوثيق / Documentation Index

- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture](./ARCHITECTURE.md)
- [Deployment](./DEPLOYMENT.md)
- [Security](./SECURITY.md)
- [AI Integration](./AI_INTEGRATION.md)
- [Migrations Guide](./MIGRATIONS_GUIDE.md)
- [Scripts Reference](./SCRIPTS.md)

## نظرة عامة / Overview

API متكاملة لنظام توصية التخصصات الجامعية باستخدام الذكاء الاصطناعي. يدعم النظام إدارة الطلاب والمعلمين والجامعات والتوصيات الذكية.

A comprehensive API for a university major recommendation system using artificial intelligence. The system supports managing students, teachers, universities, and AI-powered recommendations.

---

## المميزات الرئيسية / Key Features

### العربية / Arabic:
- 🔐 **نظام مصادقة متقدم**: JWT-based authentication مع صلاحيات متعددة المستويات
- 👥 **إدارة المستخدمين**: طلاب، معلمون، جامعات، ومسؤولون
- 🎓 **إدارة التخصصات والجامعات**: إدارة شاملة للتخصصات الجامعية والجامعات
- 🤖 **توصيات بالذكاء الاصطناعي**: تكامل مع DeepSeek AI لتوليد توصيات ذكية
- 📊 **لوحة تحكم وإحصائيات**: إحصائيات شاملة ولوحة تحكم للمسؤولين
- 📝 **نظام استبيانات**: استبيانات تفاعلية لجمع بيانات الطلاب
- 📄 **إدارة الطلبات**: نظام كامل لإدارة طلبات القبول الجامعي
- 📅 **تقويم ومقابلات**: إدارة المقابلات والأحداث الجامعية
- 🔔 **إشعارات ورسائل**: نظام إشعارات ورسائل داخلي
- 🔒 **نظام صلاحيات**: نظام صلاحيات متقدم للأدوار
- 📈 **تقارير وإحصائيات**: تقارير تفصيلية واستعلامات متقدمة
- 💾 **نسخ احتياطي**: نظام نسخ احتياطي تلقائي

### English / الإنجليزية:
- 🔐 **Advanced Authentication**: JWT-based authentication with multi-level permissions
- 👥 **User Management**: Students, teachers, universities, and administrators
- 🎓 **Major & University Management**: Comprehensive management of university majors and institutions
- 🤖 **AI-Powered Recommendations**: Integration with DeepSeek AI for intelligent recommendations
- 📊 **Dashboard & Statistics**: Comprehensive statistics and admin dashboard
- 📝 **Survey System**: Interactive surveys to collect student data
- 📄 **Application Management**: Complete system for managing university admission applications
- 📅 **Calendar & Interviews**: Management of interviews and university events
- 🔔 **Notifications & Messages**: Internal notification and messaging system
- 🔒 **Permission System**: Advanced permission system for roles
- 📈 **Reports & Analytics**: Detailed reports and advanced queries
- 💾 **Backup System**: Automatic backup system

---

## التقنيات المستخدمة / Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, bcryptjs
- **AI Integration**: DeepSeek API
- **Logging**: Morgan, Custom Audit Logger

---

## الهيكل الأساسي / Project Structure

```
university-major-recommendation-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Database connection
│   │   └── swagger.js   # Swagger/OpenAPI configuration
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   └── logger.js    # Audit logging
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── universities.js
│   │   ├── majors.js
│   │   ├── applications.js
│   │   ├── survey.js
│   │   ├── recommendations.js
│   │   ├── dashboard.js
│   │   ├── admin.js
│   │   └── ... (more routes)
│   ├── services/        # Business logic services
│   │   └── deepseek.js  # AI service integration
│   └── server.js        # Main application entry point
├── migrations/          # Database migrations
├── scripts/             # Utility scripts
├── docs/                # Documentation
└── package.json         # Dependencies

```

---

## البدء السريع / Quick Start

### المتطلبات / Requirements

- Node.js (v14 أو أحدث / v14 or higher)
- MySQL (v5.7 أو أحدث / v5.7 or higher)
- npm أو yarn

### التثبيت / Installation

```bash
# Clone the repository
git clone <repository-url>
cd university-major-recommendation-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your database credentials
```

### الإعداد / Configuration

أنشئ ملف `.env` مع المتغيرات التالية / Create `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=8000
API_VERSION=v1
NODE_ENV=development

# DeepSeek AI Configuration (Optional)
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat
ENABLE_AI_FEATURES=true
ENABLE_AI_RECOMMENDATIONS=true
```

### تشغيل قاعدة البيانات / Database Setup

```bash
# Run database migrations
mysql -u your_user -p your_database < migrations/database.sql

# Run additional migrations if needed
mysql -u your_user -p your_database < migrations/create_permissions_tables.sql
mysql -u your_user -p your_database < migrations/seed_permissions.sql
```

### تشغيل الخادم / Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

الخادم سيعمل على / Server will run on: `http://localhost:8000`

---

## التوثيق / Documentation

### API Documentation

- **Swagger UI**: `http://localhost:8000/api-docs`
- **Health Check**: `http://localhost:8000/health`

### Documentation Files

راجع الملفات التالية للحصول على توثيق شامل / Check the following files for comprehensive documentation:

- [API Documentation](./API_DOCUMENTATION.md) - توثيق شامل لجميع نقاط النهاية / Complete API endpoints documentation
- [Database Schema](./DATABASE_SCHEMA.md) - هيكل قاعدة البيانات / Database structure
- [Setup Guide](./SETUP_GUIDE.md) - دليل الإعداد المفصل / Detailed setup guide
- [Architecture](./ARCHITECTURE.md) - البنية المعمارية / System architecture
- [Deployment](./DEPLOYMENT.md) - دليل النشر / Deployment guide
- [Security](./SECURITY.md) - الأمان والصلاحيات / Security and permissions

---

## المسارات الرئيسية / Main Endpoints

### Authentication / المصادقة
- `POST /api/v1/auth/register` - تسجيل مستخدم جديد
- `POST /api/v1/auth/login` - تسجيل الدخول
- `GET /api/v1/auth/me` - معلومات المستخدم الحالي

### Students / الطلاب
- `GET /api/v1/students` - قائمة الطلاب
- `GET /api/v1/students/:id` - تفاصيل طالب
- `POST /api/v1/students/:id/tracking` - إضافة ملاحظة متابعة

### Universities / الجامعات
- `GET /api/v1/universities` - قائمة الجامعات
- `GET /api/v1/universities/:id/majors` - تخصصات الجامعة

### Majors / التخصصات
- `GET /api/v1/majors` - قائمة التخصصات
- `GET /api/v1/majors/:id` - تفاصيل تخصص

### Recommendations / التوصيات
- `GET /api/v1/recommendations` - الحصول على التوصيات
- `POST /api/v1/recommendations/generate` - إنشاء توصيات جديدة

### Survey / الاستبيانات
- `GET /api/v1/survey/questions` - الحصول على الأسئلة
- `POST /api/v1/survey/submit` - إرسال الإجابات

### Applications / الطلبات
- `GET /api/v1/applications` - قائمة الطلبات
- `POST /api/v1/applications` - إنشاء طلب جديد

---

## الأدوار والصلاحيات / Roles & Permissions

### Student / طالب
- عرض ملفه الشخصي
- الإجابة على الاستبيانات
- الحصول على التوصيات
- إرسال طلبات القبول

### Teacher / معلم
- عرض الطلاب المرتبطين به
- إضافة ملاحظات متابعة
- عرض التوصيات للطلاب

### University / جامعة
- إدارة التخصصات الخاصة بها
- عرض طلبات القبول
- إدارة المقابلات
- إدارة الفصول الدراسية

### Admin / مسؤول
- جميع الصلاحيات
- إدارة المستخدمين
- إدارة الجامعات والتخصصات
- إعدادات الذكاء الاصطناعي
- التقارير والإحصائيات

---

## التطوير / Development

### Scripts / الأوامر

```bash
# Start development server
npm run dev

# Add sample questions
npm run add-questions

# Delete questions
npm run delete-questions
```

### Contributing / المساهمة

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## الأمان / Security

- جميع طلبات API تتطلب مصادقة JWT (باستثناء تسجيل الدخول والتسجيل)
- كلمات المرور مشفرة باستخدام bcrypt
- استخدام Helmet لتأمين رؤوس HTTP
- سجل تدقيق شامل لجميع العمليات

All API requests require JWT authentication (except login and registration)
- Passwords are hashed using bcrypt
- Helmet used for HTTP header security
- Comprehensive audit log for all operations

---

## الترخيص / License

ISC

---

## الدعم / Support

للحصول على المساعدة / For support:
- راجع التوثيق / Check the documentation
- افتح issue على GitHub / Open an issue on GitHub
- اتصل بالدعم الفني / Contact technical support

---

## الإصدار / Version

**Current Version**: 1.0.0

---

## التحديثات القادمة / Upcoming Features

- تحسينات في نماذج الذكاء الاصطناعي
- تطبيق موبايل
- نظام إشعارات push
- تحليلات متقدمة
- دعم تعدد اللغات الموسع

Improvements in AI models
- Mobile application
- Push notification system
- Advanced analytics
- Extended multi-language support



