# دليل البدء السريع

## خطوات التشغيل

### 1. تثبيت المتطلبات

```bash
cd university-major-recommendation-api
npm install
```

### 2. إعداد ملف البيئة

قم بنسخ ملف `.env.example` إلى `.env` وقم بتعديل إعدادات قاعدة البيانات:

```bash
cp .env.example .env
```

ملف `.env` يجب أن يحتوي على:
```env
DB_HOST=mysql5047.site4now.net
DB_NAME=db_abf0c2_umj
DB_USER=abf0c2_umj
DB_PASSWORD=admin123
DB_PORT=3306
PORT=8000
JWT_SECRET=your-secret-key-here
```

### 3. تشغيل السيرفر

```bash
# للتطوير (مع إعادة التشغيل التلقائي)
npm run dev

# للإنتاج
npm start
```

السيرفر سيعمل على: `http://localhost:8000`

## اختبار API

### 1. اختبار الاتصال

```bash
curl http://localhost:8000/health
```

يجب أن تحصل على:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-02-01T12:00:00.000Z"
}
```

### 2. تسجيل الدخول

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password",
    "role": "admin"
  }'
```

### 3. الحصول على الإحصائيات (يتطلب token)

```bash
curl -X GET http://localhost:8000/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Endpoints المتاحة

### المصادقة
- `POST /api/v1/auth/register` - التسجيل
- `POST /api/v1/auth/login` - تسجيل الدخول
- `GET /api/v1/auth/me` - معلومات المستخدم الحالي

### الطلاب
- `GET /api/v1/students` - قائمة الطلاب
- `GET /api/v1/students/:id` - تفاصيل طالب
- `GET /api/v1/students/:id/tracking` - ملاحظات المتابعة
- `POST /api/v1/students/:id/tracking` - إضافة ملاحظة متابعة

### المعلمون
- `GET /api/v1/teachers` - قائمة المعلمين
- `GET /api/v1/teachers/:id` - تفاصيل معلم
- `GET /api/v1/teachers/:id/students` - طلاب المعلم

### الجامعات
- `GET /api/v1/universities` - قائمة الجامعات
- `GET /api/v1/universities/:id` - تفاصيل جامعة
- `GET /api/v1/universities/:id/majors` - تخصصات الجامعة

### التخصصات
- `GET /api/v1/majors` - قائمة التخصصات
- `GET /api/v1/majors/:id` - تفاصيل تخصص

### الطلبات
- `GET /api/v1/applications` - قائمة الطلبات
- `POST /api/v1/applications` - إنشاء طلب جديد
- `PATCH /api/v1/applications/:id/status` - تحديث حالة الطلب

### الاستبيانات
- `GET /api/v1/survey/questions` - الأسئلة
- `POST /api/v1/survey/submit` - إرسال الإجابات

### لوحة التحكم
- `GET /api/v1/dashboard/stats` - الإحصائيات

### الإدارة
- `GET /api/v1/admin/users` - جميع المستخدمين
- `GET /api/v1/admin/statistics` - إحصائيات الإدارة
- `GET /api/v1/admin/audit-logs` - سجل النشاط

## ملاحظات مهمة

1. **المصادقة**: معظم endpoints تتطلب token في header:
   ```
   Authorization: Bearer <token>
   ```

2. **الأدوار**: 
   - `admin` - مدير النظام
   - `teacher` - معلم
   - `university` - جامعة
   - `student` - طالب

3. **الأخطاء**: جميع الأخطاء تُرجع في شكل:
   ```json
   {
     "success": false,
     "message": "Error message"
   }
   ```

4. **النجاح**: الاستجابات الناجحة:
   ```json
   {
     "success": true,
     "data": {...}
   }
   ```

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
- تأكد من صحة بيانات الاتصال في `.env`
- تأكد من أن قاعدة البيانات متاحة

### خطأ 401 Unauthorized
- تأكد من إرسال token صحيح في header
- تأكد من أن token لم ينتهِ صلاحيته

### خطأ 403 Forbidden
- تأكد من أن لديك الصلاحيات المناسبة للوصول للـ endpoint

