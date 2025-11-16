## مرجع السكربتات / Scripts Reference

يوضح هذا المستند السكربتات في مجلد `scripts/` وطريقة استخدامها.

---

### npm scripts (package.json)
```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "add-questions": "node scripts/add-sample-questions.js",
  "delete-questions": "node scripts/delete-questions.js"
}
```

---

### SQL/JS Scripts
- `add_majors.sql`: إضافة تخصصات.
- `add_saudi_universities.sql`: إضافة جامعات سعودية.
- `add_university_users.sql`: إضافة مستخدمي الجامعات.
- `complete_universities_setup.sql`: ربط البيانات ذات الصلة بالجامعات.
- `fill_null_university_data.sql`: استكمال حقول ناقصة للجامعات.
- `link_universities_to_majors.sql`: ربط الجامعات بالتخصصات.
- `sample_questions.sql`: أسئلة عينة للاستبيان.
- `seed_professional_questions.sql`: أسئلة مهنية.
- `create_ai_settings_table.js`: إنشاء جدول إعدادات الذكاء الاصطناعي (بديل SQL).
- `generate_university_passwords.js`: توليد كلمات مرور لمستخدمي الجامعات.
- `add-sample-questions.js`: إدراج أسئلة استبيان عيّنية.
- `delete-questions.js`: حذف أسئلة الاستبيان.

أمثلة تشغيل:
```bash
# إدراج أسئلة عينة
npm run add-questions

# حذف أسئلة
npm run delete-questions
```

تشغيل SQL:
```bash
mysql -h <host> -u <user> -p <db> < scripts/add_majors.sql
```

ملاحظة:
- تأكد من عمل نسخة احتياطية قبل تشغيل سكربتات التعديل أو الحذف.


