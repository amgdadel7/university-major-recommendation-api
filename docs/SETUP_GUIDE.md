## دليل الإعداد / Setup Guide

هذا الدليل يشرح إعداد البيئة وتشغيل الخادم محلياً.

---

### المتطلبات / Requirements
- Node.js 16+
- MySQL 5.7+
- npm أو yarn

---

### الخطوة 1: تنصيب الحزم / Install Dependencies
```bash
npm install
```

---

### الخطوة 2: إعداد البيئة / Configure Environment
انسخ الملف `.env.example` إلى `.env` وحدث القيم:
```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306

JWT_SECRET=change-me-in-production
PORT=8000
API_VERSION=v1
NODE_ENV=development

DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
ENABLE_AI_FEATURES=true
ENABLE_AI_RECOMMENDATIONS=true
```

ملاحظة: لا تستخدم أسرار افتراضية في الإنتاج.

---

### الخطوة 3: إنشاء قاعدة البيانات / Initialize Database
أنشئ قاعدة البيانات ثم نفّذ السكربت الأساسي:
```bash
mysql -u your_user -p your_database < migrations/database.sql
```

إن أردت نظام صلاحيات وأدوار:
```bash
mysql -u your_user -p your_database < migrations/create_permissions_tables.sql
mysql -u your_user -p your_database < migrations/seed_permissions.sql
```

إن أردت إعدادات الذكاء الاصطناعي:
```bash
mysql -u your_user -p your_database < migrations/create_ai_settings_table.sql
```

---

### الخطوة 4: تشغيل الخادم / Run the Server
تطوير:
```bash
npm run dev
```
إنتاج:
```bash
npm start
```

الخادم سيعمل على: `http://localhost:8000` وواجهة Swagger على: `http://localhost:8000/api-docs`.

---

### اختبارات سريعة / Quick Checks
- `GET /health` → يجب أن يعيد حالة التشغيل.
- `GET /api-docs` → يجب أن تظهر واجهة Swagger.

---

### حلول مشاكل شائعة / Troubleshooting
- مشكلة اتصال قاعدة البيانات: تأكد من متغيرات `.env` وفتح المنافذ والجدار الناري.
- JWT غير صالح: تأكد من ترويسة Authorization وأن `JWT_SECRET` مطابق للتوقيع.
- فشل توصيات الذكاء الاصطناعي: تأكد من ضبط `DEEPSEEK_API_KEY` وتفعيل `ENABLE_AI_FEATURES`.


