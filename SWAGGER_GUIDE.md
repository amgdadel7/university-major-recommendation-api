# دليل Swagger Documentation

## الوصول إلى واجهة Swagger

بعد تشغيل السيرفر، يمكنك الوصول إلى واجهة Swagger على:

```
http://localhost:8000/api-docs
```

## الميزات

### 1. واجهة تفاعلية
- تجربة جميع الـ endpoints مباشرة من المتصفح
- إرسال طلبات حقيقية ومراقبة الاستجابات
- أمثلة لجميع الطلبات والاستجابات

### 2. المصادقة (Authentication)
- يمكنك تسجيل الدخول من واجهة Swagger
- استخدم زر "Authorize" في أعلى الصفحة
- أدخل JWT token الذي تحصل عليه من `/auth/login`
- جميع الـ endpoints المحمية ستستخدم هذا الـ token تلقائياً

### 3. تجربة الـ API
1. ابدأ بتسجيل الدخول:
   - انتقل إلى `/api/v1/auth/login`
   - انقر على "Try it out"
   - أدخل بيانات الاعتماد:
     ```json
     {
       "email": "user@example.com",
       "password": "password123",
       "role": "student"
     }
     ```
   - انقر "Execute"
   - انسخ الـ `token` من الاستجابة

2. تفعيل المصادقة:
   - انقر على زر "Authorize" (قفل) في أعلى الصفحة
   - أدخل `Bearer YOUR_TOKEN_HERE` أو فقط `YOUR_TOKEN_HERE`
   - انقر "Authorize" ثم "Close"

3. تجربة endpoints أخرى:
   - جميع الـ endpoints الآن جاهزة للاستخدام
   - انقر على أي endpoint ثم "Try it out"

## إضافة توثيق لـ routes جديدة

لإضافة توثيق Swagger لـ route جديد، أضف JSDoc comments فوق الـ route handler:

```javascript
/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: الحصول على قائمة الطلاب
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: عدد العناصر في الصفحة
 *     responses:
 *       200:
 *         description: قائمة الطلاب
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *       401:
 *         description: غير مصرح
 */
router.get('/', authenticate, async (req, res) => {
  // Route handler code
});
```

## Schemas المشتركة

تم تعريف schemas مشتركة في `src/config/swagger.js`:
- `Error` - نموذج الأخطاء
- `Success` - نموذج الاستجابات الناجحة
- `LoginRequest` - نموذج طلب تسجيل الدخول
- `RegisterRequest` - نموذج طلب التسجيل
- `AuthResponse` - نموذج استجابة المصادقة

يمكنك استخدامها في التوثيق:

```javascript
schema:
  $ref: '#/components/schemas/Error'
```

## تحديث التوثيق

بعد إضافة أو تعديل annotations، أعد تشغيل السيرفر لتحديث واجهة Swagger.

## نصائح

1. **استخدم Tags**: قم بتنظيم endpoints باستخدام tags
2. **أضف أمثلة**: استخدم `example` لإضافة أمثلة واقعية
3. **وصف Parameters**: اشرح كل parameter بوضوح
4. **Response Codes**: حدد جميع رموز الاستجابة المحتملة
5. **Security**: ضع `security: - bearerAuth: []` للـ endpoints المحمية

## استكشاف الأخطاء

### واجهة Swagger لا تظهر
- تأكد من تثبيت الحزم: `npm install`
- تأكد من أن السيرفر يعمل
- تحقق من console للأخطاء

### Token لا يعمل
- تأكد من إضافة `Bearer ` قبل الـ token (أو لا تضيفه، حسب الإعدادات)
- تحقق من أن الـ token لم ينتهِ صلاحيته
- أعد تسجيل الدخول للحصول على token جديد

### Endpoints لا تظهر
- تأكد من أن الملفات موجودة في `src/routes/`
- تحقق من أن `apis` في `swagger.js` تشير إلى المسار الصحيح
- أعد تشغيل السيرفر

