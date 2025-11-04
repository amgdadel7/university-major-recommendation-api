# تحديث سريع لجدول الجامعات والتخصصات

## الخطوات المطلوبة

### 1. تشغيل Migration للجامعات
```bash
mysql -u root -p university_db < migrations/add_university_columns.sql
```

### 2. إضافة الجامعات السعودية
```bash
mysql -u root -p university_db < scripts/add_saudi_universities.sql
```

### 3. إضافة التخصصات
```bash
mysql -u root -p university_db < scripts/add_majors.sql
```

### 4. ربط الجامعات بالتخصصات
```bash
mysql -u root -p university_db < scripts/link_universities_to_majors.sql
```

### بديل: ملف واحد شامل
```bash
mysql -u root -p university_db < scripts/complete_universities_setup.sql
```

## ما تم إضافته

✅ **8 أعمدة جديدة:**
- EnglishName
- Email  
- Phone
- Website
- AccountStatus
- ActiveStatus
- CreatedAt
- ApprovedAt

✅ **50+ جامعة سعودية جديدة** مع جميع البيانات

✅ **70+ تخصص** في جميع المجالات (هندسة، طب، علوم، إلخ)

✅ **ربط الجامعات بالتخصصات** - كل جامعة مرتبطة بجميع التخصصات المناسبة

✅ **تحديث API** لدعم الحقول الجديدة:
- GET /universities - يعيد جميع الحقول
- POST /universities - يقبل الحقول الجديدة
- PUT /universities/:id - يدعم تحديث الحقول
- POST /universities/:id/approve - جديد
- POST /universities/:id/reject - جديد

## التحقق
```sql
-- التحقق من الأعمدة
DESCRIBE Universities;

-- التحقق من الجامعات
SELECT COUNT(*) FROM Universities;
SELECT * FROM Universities LIMIT 10;

-- التحقق من التخصصات
SELECT COUNT(*) FROM Majors;
SELECT * FROM Majors ORDER BY Name LIMIT 10;

-- التحقق من الربط بين الجامعات والتخصصات
SELECT COUNT(*) FROM UniversityMajors;

-- عدد التخصصات لكل جامعة
SELECT u.Name AS University, COUNT(um.MajorID) AS MajorsCount
FROM Universities u
LEFT JOIN UniversityMajors um ON u.UniversityID = um.UniversityID
GROUP BY u.UniversityID, u.Name
ORDER BY MajorsCount DESC
LIMIT 10;
```

## ملاحظات
- تأكد من عمل backup قبل تشغيل الـ migrations
- الواجهة الآن يجب أن تعرض جميع الحقول بشكل صحيح
- كل جامعة مرتبطة بجميع التخصصات المناسبة (70+ تخصص)
- يمكنك تخصيص الربط بين الجامعات والتخصصات حسب الحاجة

## تفاصيل التخصصات

تم إضافة **70+ تخصص** في المجالات التالية:
- ✅ الهندسة (14 تخصص)
- ✅ الطب والعلوم الطبية (8 تخصصات)
- ✅ العلوم (8 تخصصات)
- ✅ علوم الحاسب (6 تخصصات)
- ✅ إدارة الأعمال (7 تخصصات)
- ✅ الدراسات الإسلامية (4 تخصصات)
- ✅ العلوم الإنسانية والاجتماعية (9 تخصصات)
- ✅ التعليم (4 تخصصات)
- ✅ الإعلام والاتصال (3 تخصصات)
- ✅ القانون (1 تخصص)
- ✅ الفنون والتصميم (3 تخصصات)
- ✅ الزراعة (1 تخصص)
- ✅ أخرى (3 تخصصات)

