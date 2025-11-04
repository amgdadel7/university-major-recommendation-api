# تحديث جدول الجامعات - Universities Table Update

## نظرة عامة
تم إضافة الأعمدة المفقودة لجدول الجامعات لتتوافق مع متطلبات الواجهة الأمامية.

## الملفات المطلوب تشغيلها

### 1. تشغيل Migration لإضافة الأعمدة
قم بتشغيل ملف migration التالي على قاعدة البيانات:

```sql
-- ملف: migrations/add_university_columns.sql
```

هذا الملف يضيف الأعمدة التالية:
- `EnglishName` - الاسم بالإنجليزية
- `Email` - البريد الإلكتروني
- `Phone` - رقم الهاتف
- `Website` - الموقع الإلكتروني
- `AccountStatus` - حالة الحساب (active, pending, rejected)
- `ActiveStatus` - حالة النشاط (active, inactive)
- `CreatedAt` - تاريخ الإنشاء
- `ApprovedAt` - تاريخ الموافقة

### 2. إضافة البيانات
بعد تشغيل الـ migration، قم بتشغيل script إضافة البيانات:

```sql
-- ملف: scripts/add_saudi_universities.sql
```

هذا الملف يقوم بـ:
- تحديث البيانات الموجودة للجامعات الحالية
- إضافة أكثر من 50 جامعة سعودية جديدة مع جميع البيانات المطلوبة

## طريقة التشغيل

### باستخدام MySQL Command Line:
```bash
mysql -u your_username -p your_database_name < migrations/add_university_columns.sql
mysql -u your_username -p your_database_name < scripts/add_saudi_universities.sql
```

### باستخدام phpMyAdmin أو أي أداة MySQL:
1. افتح ملف `migrations/add_university_columns.sql`
2. انسخ المحتوى والصقه في SQL tab
3. اضغط Run
4. كرر نفس الخطوات مع ملف `scripts/add_saudi_universities.sql`

### باستخدام Node.js:
إذا كان لديك script Node.js للـ migrations، يمكنك تشغيل الملفات من خلاله.

## التحقق من النجاح

بعد تشغيل الملفات، تحقق من:

1. وجود الأعمدة الجديدة في جدول `Universities`:
```sql
DESCRIBE Universities;
```

2. وجود البيانات في الجدول:
```sql
SELECT COUNT(*) FROM Universities;
SELECT * FROM Universities LIMIT 5;
```

3. التحقق من أن الواجهة تعمل بشكل صحيح:
- افتح صفحة إدارة الجامعات في الواجهة
- تحقق من عرض جميع الحقول
- تحقق من إمكانية إضافة/تعديل/حذف الجامعات

## ملاحظات مهمة

- تأكد من عمل backup لقاعدة البيانات قبل تشغيل أي migration
- تأكد من أن جدول `Universities` موجود قبل تشغيل الـ migration
- إذا كانت هناك أخطاء، تحقق من صلاحيات المستخدم على قاعدة البيانات
- قد تحتاج إلى تعديل الأرقام الهاتفية والمواقع الإلكترونية في script البيانات لتتوافق مع الواقع

## استكشاف الأخطاء

### خطأ: Column already exists
إذا ظهر هذا الخطأ، فهذا يعني أن الأعمدة موجودة بالفعل. يمكنك تخطي هذا الخطأ أو حذف الأعمدة وإعادة إضافتها.

### خطأ: Duplicate entry
إذا ظهر خطأ duplicate entry عند إضافة البيانات، فهذا يعني أن بعض الجامعات موجودة بالفعل. يمكنك تعديل الـ script ليستخدم `INSERT IGNORE` أو `ON DUPLICATE KEY UPDATE`.

### خطأ: Unknown column
إذا ظهر خطأ unknown column، تأكد من تشغيل ملف migration أولاً.

## التحديثات على API

تم تحديث API routes لدعم الحقول الجديدة:
- `GET /api/v1/universities` - يعيد جميع الحقول الجديدة
- `POST /api/v1/universities` - يقبل الحقول الجديدة في body
- `PUT /api/v1/universities/:id` - يدعم تحديث الحقول الجديدة
- `POST /api/v1/universities/:id/approve` - جديد: للموافقة على الجامعة
- `POST /api/v1/universities/:id/reject` - جديد: لرفض الجامعة

## الدعم

إذا واجهت أي مشاكل، تحقق من:
1. ملفات الـ logs في مجلد `logs/`
2. أخطاء console في المتصفح
3. أخطاء قاعدة البيانات في MySQL logs

