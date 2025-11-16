## دليل النشر / Deployment Guide

تعليمات نشر الخدمة في بيئة إنتاج.

---

### المتطلبات / Requirements
- قاعدة بيانات MySQL مُدارة أو خادم MySQL مؤمّن.
- Node.js 18+ على الخادم أو بيئة استضافة (Docker اختيارياً).
- متغيرات بيئة Production آمنة.

---

### خطوات عامة / General Steps
1) اضبط متغيرات البيئة (لا تستخدم القيم الافتراضية):
```env
NODE_ENV=production
PORT=8000
API_VERSION=v1
JWT_SECRET=<strong-random-secret>
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DEEPSEEK_API_KEY=...
```
2) ثبّت الحزم:
```bash
npm ci --omit=dev
```
3) نفّذ الهجرات:
```bash
mysql -h <host> -u <user> -p <db> < migrations/database.sql
```
4) ابدأ الخدمة (مثال pm2):
```bash
pm2 start src/server.js --name umj-api
pm2 save
```

---

### صحة وتشخيص / Health & Diagnostics
- `GET /health` يجب أن يعيد `{ success: true }`.
- راقب السجلات (stdout أو pm2 logs).

---

### أمن الإنتاج / Production Security
- HTTPS خلف عاكس عكسي (Nginx/Cloud).
- حدّ المعدّل (Rate limiting) وWAF إن أمكن.
- تحديثات أمنية دورية للحزم.
- نسخ احتياطي لقاعدة البيانات + اختبار الاستعادة.


