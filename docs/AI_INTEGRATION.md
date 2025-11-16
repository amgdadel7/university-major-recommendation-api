## تكامل الذكاء الاصطناعي / AI Integration

يوضح هذا المستند كيفية عمل التكامل مع DeepSeek وكيفية تهيئته.

---

### نظرة عامة / Overview
- ملف الخدمة: `src/services/deepseek.js`
- يعتمد على الإعدادات من قاعدة البيانات (جدول `AISettings`) أو متغيرات البيئة كبديل.
- يوفر الدوال:
  - `getAIConfig()`: يجلب الإعدادات مع كاش داخلي TTL.
  - `isConfigured()`: يتحقق من صلاحية التكوين (API Key وتفعيل الميزات).
  - `generateRecommendations(messages, options)`: يستدعي DeepSeek ويعيد نتائج بصيغة JSON قياسية.

---

### المتغيرات البيئية / Environment Variables
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=<required>
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_MAX_TOKENS=2000
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_TIMEOUT=30

ENABLE_AI_FEATURES=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_AI_ANALYSIS=true
```

ملاحظات:
- في حال عدم وجود سجل في `AISettings`, سيتم استخدام القيم من البيئة.
- الكاش مؤقت لتحسين الأداء وإعادة استخدام الإعدادات.

---

### نقاط النهاية ذات الصلة / Related Endpoints
- `GET /api/v1/recommendations` — يعرض توصيات محفوظة حسب الدور.
- `POST /api/v1/recommendations/generate` — يولد توصيات جديدة عبر DeepSeek.
  - الطلاب لا يمكنهم توليد توصيات لغير أنفسهم.
  - يتطلب وجود تخصصات في جدول `Majors`.
  - يتم تخزين النتائج في جدول `Recommendations` مع `ModelVersion`.

---

### معالجة الاستجابة / Response Handling
تتوقع الخدمة JSON كالتالي:
```json
{
  "recommendations": [
    { "majorName": "Computer Science", "reason": "...", "confidence": 92 }
  ],
  "analysisSummary": "ملخص تحليلي"
}
```
- يتم مطابقة `majorName` مع جدول `Majors` (مطابقة مباشرة أو جزئية).
- `confidence` يُحوّل إلى نطاق 0..1 عند التخزين.

---

### تشخيص المشاكل / Troubleshooting
- رسالة: "DeepSeek integration is not configured" → تأكد من `DEEPSEEK_API_KEY` وتفعيل `ENABLE_AI_FEATURES` و`ENABLE_AI_RECOMMENDATIONS`.
- رسالة: "No majors are registered" → أضف تخصصات إلى `Majors`.
- خطأ JSON عند التحليل → تحقق من تنسيق ردّ المزود.


