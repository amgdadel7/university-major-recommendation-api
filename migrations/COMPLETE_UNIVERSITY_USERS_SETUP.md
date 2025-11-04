# إعداد كامل لمستخدمي الجامعات - Complete University Users Setup

## ✅ ما تم إنجازه

### 1. إنشاء جدول UniversityUsers
- ✅ Migration: `migrations/create_university_users_table.sql`
- ✅ جدول منفصل لمستخدمي الجامعات
- ✅ جميع الحقول المطلوبة (Email, PasswordHash, Role, Position, Phone, إلخ)

### 2. تحديث Backend API
- ✅ Routes: `src/routes/university-users.js`
- ✅ تحديث `src/routes/auth.js` لدعم تسجيل دخول الجامعات من الجدول الجديد
- ✅ تحديث `src/middleware/auth.js` لإضافة UniversityID تلقائياً
- ✅ إضافة Route في `src/server.js`

### 3. تحديث Frontend
- ✅ API Client: `lib/api.ts` - إضافة `universityUsersApi`
- ✅ صفحة إدارة المستخدمين: `app/university/users/page.tsx`
- ✅ تسجيل الدخول: `app/auth/login/page.tsx` - يعمل مع role='university'
- ✅ NextAuth: `lib/auth.ts` - يدعم تسجيل دخول الجامعات

## 📋 الخطوات المطلوبة

### 1. تشغيل Migration
```bash
mysql -u root -p university_db < migrations/create_university_users_table.sql
```

### 2. إضافة مستخدمي الجامعات (اختياري)
```bash
# إنشاء كلمات مرور مشفرة
node scripts/generate_university_passwords.js

# إضافة مستخدمي الجامعات
mysql -u root -p university_db < scripts/add_university_users.sql
```

### 3. إعادة تشغيل API Server
```bash
cd university-major-recommendation-api
npm start
```

## 🔐 تسجيل الدخول

الآن الجامعات تسجل الدخول باستخدام:

```javascript
POST /api/v1/auth/login
{
  "email": "admin@ksu.edu.sa",
  "password": "university123",
  "role": "university"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "email": "admin@ksu.edu.sa",
      "name": "مدير جامعة الملك سعود",
      "role": "university",
      "UniversityID": 1
    }
  }
}
```

## 🎯 الميزات المتاحة

### في صفحة `/university/users`:
- ✅ عرض جميع مستخدمي الجامعة
- ✅ إضافة مستخدم جديد
- ✅ تعديل مستخدم موجود
- ✅ حذف مستخدم (ما عدا المدير الرئيسي)
- ✅ تفعيل/تعطيل المستخدم
- ✅ البحث والفلترة
- ✅ عرض آخر تسجيل دخول

### API Endpoints:
- `GET /api/v1/university-users` - جلب جميع المستخدمين
- `GET /api/v1/university-users/:id` - جلب مستخدم محدد
- `POST /api/v1/university-users` - إضافة مستخدم جديد
- `PUT /api/v1/university-users/:id` - تحديث مستخدم
- `PUT /api/v1/university-users/:id/password` - تحديث كلمة المرور
- `DELETE /api/v1/university-users/:id` - حذف مستخدم

## 🔄 Migration من النظام القديم

إذا كان لديك مستخدمون للجامعات في جدول `Teachers`:

```sql
-- نقل مستخدمي الجامعات من Teachers إلى UniversityUsers
INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, IsMainAdmin, IsActive, CreatedAt)
SELECT UniversityID, FullName, Email, PasswordHash, 'university_admin' as Role, 
       CASE WHEN Role = 'university' THEN TRUE ELSE FALSE END as IsMainAdmin,
       TRUE as IsActive, CreatedAt
FROM Teachers
WHERE Role = 'university'
AND NOT EXISTS (
    SELECT 1 FROM UniversityUsers uu WHERE uu.Email = Teachers.Email
)
ON DUPLICATE KEY UPDATE Email = Email;
```

## ✅ التحقق من النجاح

### 1. التحقق من الجدول
```sql
DESCRIBE UniversityUsers;
SELECT COUNT(*) FROM UniversityUsers;
```

### 2. اختبار تسجيل الدخول
- افتح صفحة `/auth/login`
- اختر role: "university"
- أدخل email و password
- يجب أن تسجل دخول بنجاح

### 3. اختبار صفحة إدارة المستخدمين
- بعد تسجيل الدخول، اذهب إلى `/university/users`
- افتح تبويب "المستخدمين" (University Users)
- يجب أن ترى قائمة بمستخدمي الجامعة

## 📝 ملاحظات مهمة

1. **JWT Token**: يحتوي الآن على `UniversityID` للمستخدمين من الجامعات
2. **الأمان**: كلمات المرور مشفرة باستخدام bcrypt
3. **الحماية**: لا يمكن حذف المدير الرئيسي (`IsMainAdmin = TRUE`)
4. **التلقائي**: عند تسجيل الدخول، يتم تحديث `LastLoginAt` تلقائياً
5. **الصلاحيات**: كل جامعة ترى فقط مستخدميها (filtered by UniversityID)

## 🎉 النتيجة

الآن النظام كامل ومتكامل:
- ✅ جدول منفصل لمستخدمي الجامعات
- ✅ Backend API كامل
- ✅ Frontend مرتبط بالجدول الجديد
- ✅ تسجيل الدخول يعمل بشكل صحيح
- ✅ صفحة إدارة المستخدمين كاملة

كل شيء جاهز للاستخدام! 🚀

