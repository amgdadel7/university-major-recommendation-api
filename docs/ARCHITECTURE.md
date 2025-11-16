## البنية المعمارية / Architecture

نظرة عامة على مكوّنات النظام داخل مجلد `src/`.

---

### نظرة عليا / High-level Overview
- `server.js`: نقطة دخول التطبيق، تهيئة Express والوسائط وSwagger والمسارات.
- `config/`:
  - `database.js`: اتصال MySQL عبر mysql2 Pool.
  - `swagger.js`: تعريف OpenAPI 3.0 ومخططات عامة.
- `middleware/`:
  - `auth.js`: JWT مصادقة وأدوار (student/teacher/admin/university).
  - `logger.js`: تدقيق عمليات (Audit Log) عبر جدول `AuditLogs`.
- `routes/`: وحدات REST لكل مجال (auth, students, universities, majors, survey, applications, recommendations, admin, ...).
- `services/`:
  - `deepseek.js`: تكامل الذكاء الاصطناعي لتوليد التوصيات مع إعدادات قابلة للتهيئة من DB/ENV.

تدفق الطلب النموذجي:
1) Request → 2) Middleware (helmet, cors, json, auth) → 3) Route Handler → 4) DB/Service → 5) Response + Audit.

---

### الأمن / Security
- JWT للتحقق من الهوية.
- تفويض بالمسارات حسب الدور (isAdmin/isTeacher/isUniversity/isStudent).
- Helmet, CORS, Compression.
- تسجيل تدقيق العمليات في `AuditLogs`.

---

### التوافق مع التوسّع / Scalability
- طبقة خدمات (Services) لفصل منطق العمل.
- مجمّع اتصالات MySQL.
- فهرسة مناسبة في الجداول الحرجة (Applications, Recommendations, وغيرها).
- إعدادات AI مع كاش داخلي TTL في `deepseek.js`.

---

### المراقبة والقياس / Observability
- Morgan لطلب/استجابة HTTP.
- AuditLogger لتسجيل الأفعال المعنوية للمستخدمين.
- Health endpoint: `/health`.


