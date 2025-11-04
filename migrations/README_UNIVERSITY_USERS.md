# جدول مستخدمي الجامعات - University Users Table

## نظرة عامة

تم إنشاء جدول منفصل لمستخدمي الجامعات (UniversityUsers) لتخزين بيانات تسجيل الدخول بدلاً من استخدام جدول Teachers.

## الجدول الجديد

### اسم الجدول: `UniversityUsers`

**الأعمدة:**
- `UserID` - معرف المستخدم (Primary Key)
- `UniversityID` - معرف الجامعة (Foreign Key)
- `FullName` - الاسم الكامل
- `Email` - البريد الإلكتروني (Unique)
- `PasswordHash` - كلمة المرور المشفرة
- `Role` - الدور (university_admin, admissions_officer, university_staff)
- `Position` - المنصب
- `Phone` - رقم الهاتف
- `IsActive` - حالة النشاط
- `IsMainAdmin` - هل هو المدير الرئيسي للجامعة؟
- `CreatedAt` - تاريخ الإنشاء
- `LastLoginAt` - آخر تسجيل دخول
- `UpdatedAt` - تاريخ آخر تحديث

## كيفية الاستخدام

### 1. إنشاء الجدول

```bash
mysql -u root -p university_db < migrations/create_university_users_table.sql
```

### 2. إضافة مستخدمي الجامعات

```bash
mysql -u root -p university_db < scripts/add_university_users.sql
```

### 3. إنشاء كلمة مرور مشفرة (اختياري)

```bash
node scripts/generate_university_passwords.js
```

## تسجيل الدخول

الجامعات تسجل الدخول الآن باستخدام:
- **Role**: `university`
- **Email**: البريد الإلكتروني الموجود في جدول `UniversityUsers`
- **Password**: كلمة المرور المشفرة

## مثال على الاستخدام

```javascript
// تسجيل الدخول
POST /api/v1/auth/login
{
  "email": "admin@ksu.edu.sa",
  "password": "university123",
  "role": "university"
}

// الاستجابة
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "email": "admin@ksu.edu.sa",
      "name": "مدير جامعة الملك سعود",
      "role": "university"
    }
  }
}
```

## الأدوار المتاحة

- `university_admin` - مدير الجامعة (صلاحيات كاملة)
- `admissions_officer` - مسؤول القبول
- `university_staff` - موظف الجامعة (صلاحيات محدودة)

## ملاحظات مهمة

1. **كلمات المرور**: كلمات المرور في script الإضافة هي placeholder. يجب تحديثها بعد الإضافة.
2. **الأمان**: تأكد من تغيير كلمات المرور الافتراضية بعد أول تسجيل دخول.
3. **الصلاحيات**: يمكن تخصيص الصلاحيات بناءً على `Role` و `IsMainAdmin`.
4. **الحذف**: عند حذف جامعة، يتم حذف جميع مستخدميها تلقائياً (ON DELETE CASCADE).

## Migration من النظام القديم

إذا كان لديك مستخدمون للجامعات في جدول `Teachers`، يمكنك نقلهم:

```sql
-- نقل مستخدمي الجامعات من Teachers إلى UniversityUsers
INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, IsMainAdmin, IsActive, CreatedAt)
SELECT UniversityID, FullName, Email, PasswordHash, 'university_admin' as Role, 
       CASE WHEN Role = 'university' THEN TRUE ELSE FALSE END as IsMainAdmin,
       TRUE as IsActive, CreatedAt
FROM Teachers
WHERE Role = 'university'
ON DUPLICATE KEY UPDATE Email = Email;
```

