# University Major Recommendation API / نظام توصية التخصصات الجامعية

بفضل الله، هذا مشروع API متكامل لنظام توصية التخصصات الجامعية باستخدام الذكاء الاصطناعي (DeepSeek)، يدعم إدارة الطلاب والمعلمين والجامعات والتوصيات والطلبات والاستبيانات، مع توثيق شامل باللغتين العربية والإنجليزية.

Alhamdulillah, this is a comprehensive API for a university major recommendation system powered by AI (DeepSeek). It supports managing students, teachers, universities, recommendations, applications, and surveys, with complete bilingual documentation (Arabic/English).

---

## الفهرس السريع / Quick Index
- التوثيق الكامل / Full docs: `./docs/README.md`
- واجهة Swagger: `http://localhost:8000/api-docs`
- فحص الصحة / Health: `GET /health`

---

## البدء السريع / Quick Start

### المتطلبات / Requirements
- Node.js 16+
- MySQL 5.7+

### التثبيت والتشغيل / Install & Run
```bash
npm install
cp .env.example .env  # حدّث قيم قاعدة البيانات وJWT وDeepSeek
mysql -u <user> -p <db> < migrations/database.sql
npm run dev  # تطوير / development
# npm start  # إنتاج / production
```

Server: `http://localhost:8000` — Swagger: `http://localhost:8000/api-docs`

---

## المزايا / Features
- JWT Auth, أدوار وصلاحيات Roles & Permissions
- توصيات الذكاء الاصطناعي عبر DeepSeek
- إدارة: طلاب، معلمين، جامعات، تخصصات
- استبيانات، طلبات قبول، مقابلات، تقويم، رسائل، إشعارات
- تدقيق عمليات (Audit Logs) وأمن عبر Helmet وCORS

---

## الروابط المفيدة / Useful Links
- دليل الإعداد / Setup Guide: `./docs/SETUP_GUIDE.md`
- توثيق API / API Docs: `./docs/API_DOCUMENTATION.md`
- مخطط قاعدة البيانات / DB Schema: `./docs/DATABASE_SCHEMA.md`
- البنية المعمارية / Architecture: `./docs/ARCHITECTURE.md`
- النشر / Deployment: `./docs/DEPLOYMENT.md`
- الأمان / Security: `./docs/SECURITY.md`
- تكامل الذكاء الاصطناعي / AI Integration: `./docs/AI_INTEGRATION.md`
- الهجرات / Migrations: `./docs/MIGRATIONS_GUIDE.md`
- السكربتات / Scripts: `./docs/SCRIPTS.md`

---

## الترخيص / License
ISC


