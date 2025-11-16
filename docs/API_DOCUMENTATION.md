## توثيق API / API Documentation

هذا المستند يوضح النقاط الأساسية باللغتين العربية والإنجليزية. جميع المسارات تبدأ بـ `"/api/{API_VERSION}"` وافتراضياً `v1`. This file presents core endpoints in Arabic and English; all paths are prefixed with `"/api/{API_VERSION}"` (default `v1`).

---

### الرؤوس العامة / Common Headers
- `Authorization: Bearer <JWT>`
- `Content-Type: application/json`

أخطاء عامة / Common Errors: 400, 401, 403, 404, 500 (see Swagger `/api-docs`).

Swagger UI: `GET /api-docs`

---

## المصادقة | Authentication

- `POST /auth/register`
  - العربية: تسجيل مستخدم جديد.
  - English: Register a new user.
  - Body:
    ```json
    { "fullName": "User", "email": "u@e.com", "password": "secret", "role": "student", "age": 20, "gender": "M", "universityId": 1 }
    ```
  - Response: JWT + user.

- `POST /auth/login`
  - العربية: تسجيل الدخول.
  - English: Login.
  - Body:
    ```json
    { "email": "u@e.com", "password": "secret", "role": "student" }
    ```
  - Response example:
    ```json
    {
      "success": true,
      "data": { "token": "eyJ...", "user": { "id": 1, "email": "u@e.com", "name": "User", "role": "student" } }
    }
    ```

- `GET /auth/me` (JWT)
  - العربية: معلومات المستخدم الحالي.
  - English: Current user info.

---

## التوصيات | Recommendations (JWT)

- `GET /recommendations`
  - العربية: الطالب يرى توصياته، المعلم يرى توصيات طلابه، المدير يرى الكل.
  - English: Student sees own, teacher sees students’, admin sees all.
  - Response (sample):
    ```json
    { "success": true, "data": [ { "id": 10, "majorName": "Computer Science", "confidence": 0.87 } ] }
    ```

- `POST /recommendations/generate`
  - العربية: إنشاء توصيات عبر DeepSeek (يتطلب تفعيل AI).
  - English: Generate AI recommendations (AI must be enabled).
  - Body (optional):
    ```json
    { "studentId": 123, "additionalContext": "extra notes" }
    ```
  - Notes:
    - العربية: الطالب لا ينشئ لغير نفسه.
    - English: Students can only generate for themselves.
  - Response (sample):
    ```json
    {
      "success": true,
      "message": "تم إنشاء التوصيات بنجاح",
      "data": {
        "recommendations": [
          { "id": 10, "studentId": 5, "majorId": 2, "majorName": "Computer Science", "confidence": 0.87, "reasoning": "..." }
        ],
        "analysisSummary": "..."
      }
    }
    ```

---

## الاستبيانات | Survey (JWT)

- `GET /survey/questions` — العربية: جلب الأسئلة. English: List questions.
- `GET /survey/questions/:id` — العربية: سؤال محدد. English: Get a question.
- `POST /survey/questions` (Admin) — العربية: إنشاء سؤال. English: Create a question.
- `PUT /survey/questions/:id` (Admin) — العربية: تحديث سؤال. English: Update a question.
- `DELETE /survey/questions/:id` (Admin) — العربية: حذف سؤال. English: Delete a question.
- `POST /survey/submit` — العربية: إرسال إجابات الطالب. English: Submit student answers.
- `POST /survey/save-answer` — العربية: حفظ إجابة مفردة. English: Save single answer.
- `GET /survey/completion-status` — العربية: حالة إكمال الاستبيان. English: Completion status.
- `GET /survey/my-answers` — العربية: إجابات الطالب. English: Student answers.

Request example | مثال طلب:
```http
POST /api/v1/survey/submit
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "answers": [ { "questionId": 1, "answer": "Yes" }, { "questionId": 2, "answer": "No" } ] }
```

---

## الطلاب | Students (JWT)
- `GET /students`
- `GET /students/:id`
- `GET /students/:id/tracking`
- `POST /students/:id/tracking` (Teacher/Admin)
- `GET /students/:id/applications`
- `GET /students/:id/recommendations`
- `GET /students/me/grades`
- `POST /students/me/grades`

---

## الجامعات | Universities (JWT)
- `GET /universities`
- `GET /universities/:id`
- `GET /universities/:id/majors`
- `POST /universities` (Admin)
- `PUT /universities/:id` (Admin)
- `DELETE /universities/:id` (Admin)
- `POST /universities/:id/majors` (University)
- `DELETE /universities/:id/majors/:majorId` (University)
- `GET /universities/:id/applications` (University)
- `POST /universities/:id/approve` (Admin)
- `POST /universities/:id/reject` (Admin)

Example | مثال:
```http
GET /api/v1/universities
Authorization: Bearer <token>
```
```json
{
  "success": true,
  "data": [
    { "UniversityID": 1, "Name": "King Saud University", "Location": "Riyadh" }
  ]
}
```

---

## التخصصات | Majors (JWT)
- `GET /majors`
- `GET /majors/:id`
- `POST /majors` (Admin)
- `PUT /majors/:id` (Admin)
- `DELETE /majors/:id` (Admin)

Examples | أمثلة:
```http
GET /api/v1/majors/2
Authorization: Bearer <token>
```
```json
{
  "success": true,
  "data": { "MajorID": 2, "Name": "Computer Science", "Description": "..." }
}
```
```http
POST /api/v1/majors
Authorization: Bearer <admin-token>
Content-Type: application/json
```
```json
{ "name": "Software Engineering", "description": "..." }
```
```json
{ "success": true, "message": "Created", "data": { "MajorID": 10 } }
```

---

## الطلبات | Applications (JWT)
- `GET /applications`
- `POST /applications` (Student)
- `GET /applications/:id`
- `PATCH /applications/:id/status`
- `PUT /applications/:id` (Student)
- `DELETE /applications/:id` (Student)

Examples | أمثلة:
```http
POST /api/v1/applications
Authorization: Bearer <student-token>
Content-Type: application/json
```
```json
{ "universityId": 1, "majorId": 2, "notes": "I'd like to apply." }
```
```json
{
  "success": true,
  "data": {
    "ApplicationID": 101,
    "Status": "pending",
    "StudentID": 5,
    "UniversityID": 1,
    "MajorID": 2
  }
}
```
```http
PATCH /api/v1/applications/101/status
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{ "status": "under-review" }
```
```json
{ "success": true, "message": "Updated" }
```

---

## لوحة التحكم | Dashboard (JWT)
- `GET /dashboard/stats`

---

## التقويم | Calendar (JWT)
- `GET /calendar`
- `POST /calendar`
- `PUT /calendar/:id`
- `DELETE /calendar/:id`

---

## المحتوى | Content (JWT)
- `GET /content`
- `GET /content/:id`
- `POST /content` (Admin)
- `PUT /content/:id` (Admin)
- `DELETE /content/:id` (Admin)

---

## الإشعارات | Notifications (JWT)
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `POST /notifications`
- `DELETE /notifications/:id`

---

## الرسائل | Messages (JWT)
- `GET /messages/conversations`
- `GET /messages/conversations/:conversationId/messages`
- `POST /messages/conversations/:conversationId/messages`
- `POST /messages/conversations`

---

## المقابلات | Interviews (JWT)
- `GET /interviews`
- `GET /interviews/:id`
- `POST /interviews` (University)
- `PUT /interviews/:id` (University)
- `PATCH /interviews/:id/cancel`

---

## الصلاحيات والأدوار | Permissions & Roles (JWT, Admin)
- `GET /admin/users`
- `GET /admin/statistics`
- `GET /admin/audit-logs`
- `POST /admin/audit-logs`
- `GET /admin/ai-settings`
- `PUT /admin/ai-settings`
- `POST /admin/ai-settings/test-connection`
- `GET /admin/ai-usage-stats`
- `GET /admin/system-settings`
- `PUT /admin/system-settings`
- `GET /admin/permissions`
- `GET /admin/permissions/:id`
- `POST /admin/permissions`
- `PUT /admin/permissions/:id`
- `DELETE /admin/permissions/:id`
- `GET /admin/roles`
- `GET /admin/roles/:id`
- `POST /admin/roles`
- `PUT /admin/roles/:id`
- `DELETE /admin/roles/:id`

---

ملاحظات أمنية | Security Notes:
- استخدم HTTPS دائماً. Always use HTTPS.
- أرسل JWT ضمن ترويسة Authorization فقط. Send JWT only via Authorization header.
- استخدم `JWT_SECRET` قوي وفريد في الإنتاج. Use a strong unique `JWT_SECRET` in production.


