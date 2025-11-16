## دليل الهجرات / Migrations Guide

يبين هذا المستند كيفية استخدام ملفات SQL لإعداد قاعدة البيانات وتحديثها.

---

### المجلد / Folder
`migrations/` يحتوي على:
- `database.sql` — إنشاء الجداول الأساسية (Students, Majors, Universities, Applications, Recommendations, ...).
- `create_permissions_tables.sql` + `seed_permissions.sql` — نظام الأدوار والصلاحيات.
- `create_ai_settings_table.sql` — إعدادات الذكاء الاصطناعي (AISettings).
- سكربتات تكميلية: `add_goals_questions.sql`, `add_university_columns.sql`, `seed_audit_logs.sql`, `fix_arabic_encoding.sql`, ...

ملفات الشرح:
- `README.md`, `README_MAJORS_SETUP.md`, `README_UNIVERSITIES_UPDATE.md`, `README_UNIVERSITY_USERS.md`, `COMPLETE_UNIVERSITY_USERS_SETUP.md`.

---

### التنفيذ / Execution
مثال MySQL CLI:
```bash
mysql -h <host> -u <user> -p <db> < migrations/database.sql
mysql -h <host> -u <user> -p <db> < migrations/create_permissions_tables.sql
mysql -h <host> -u <user> -p <db> < migrations/seed_permissions.sql
mysql -h <host> -u <user> -p <db> < migrations/create_ai_settings_table.sql
```

ترتيب مقترح:
1) database.sql
2) create_permissions_tables.sql
3) seed_permissions.sql
4) create_ai_settings_table.sql
5) ملفات bổقية بحسب الحاجة.

---

### ملاحظات / Notes
- تأكد من صلاحيات المستخدم في MySQL لتنفيذ DDL/ DML.
- خذ نسخة احتياطية قبل أي عملية على الإنتاج.
- راقب الأخطاء الناتجة أثناء التنفيذ لمعالجة الاعتمادية بين الجداول.


