# دليل إعداد نظام الصلاحيات والأدوار

## الخطوات المطلوبة

### 1. إنشاء جداول قاعدة البيانات

قم بتشغيل ملف SQL لإنشاء الجداول:

```sql
-- في MySQL client أو phpMyAdmin
-- قم بتنفيذ محتوى ملف: migrations/create_permissions_tables.sql
```

أو عبر سطر الأوامر:
```bash
mysql -h mysql5047.site4now.net -u abf0c2_umj -padmin123 db_abf0c2_umj < migrations/create_permissions_tables.sql
```

### 2. إدراج البيانات الافتراضية

بعد إنشاء الجداول، قم بإدراج البيانات الافتراضية:

```bash
mysql -h mysql5047.site4now.net -u abf0c2_umj -padmin123 db_abf0c2_umj < migrations/seed_permissions.sql
```

### 3. التحقق من التثبيت

بعد إتمام الخطوات السابقة:

1. أعد تشغيل API server
2. افتح صفحة إدارة الصلاحيات في Dashboard
3. يجب أن تظهر الأدوار والصلاحيات

## API Endpoints المتاحة

### Permissions
- `GET /api/v1/admin/permissions` - الحصول على جميع الصلاحيات
- `GET /api/v1/admin/permissions/:id` - الحصول على صلاحية محددة
- `POST /api/v1/admin/permissions` - إنشاء صلاحية جديدة
- `PUT /api/v1/admin/permissions/:id` - تحديث صلاحية
- `DELETE /api/v1/admin/permissions/:id` - حذف صلاحية

### Roles
- `GET /api/v1/admin/roles` - الحصول على جميع الأدوار
- `GET /api/v1/admin/roles/:id` - الحصول على دور محدد
- `POST /api/v1/admin/roles` - إنشاء دور جديد
- `PUT /api/v1/admin/roles/:id` - تحديث دور
- `DELETE /api/v1/admin/roles/:id` - حذف دور

## ملاحظات مهمة

1. **الأدوار الافتراضية**: لا يمكن تعديل أو حذف الأدوار الافتراضية (IsDefault = TRUE)
2. **الصلاحيات الفريدة**: كل صلاحية فريدة بناءً على Module + Action
3. **الأدوار المخصصة**: يمكن إنشاء وتعديل وحذف الأدوار المخصصة (IsCustom = TRUE)

## استكشاف الأخطاء

### الخطأ: "Table doesn't exist"
- تأكد من تشغيل `create_permissions_tables.sql` أولاً

### الخطأ: "No data found"
- تأكد من تشغيل `seed_permissions.sql` لإدراج البيانات الافتراضية

### الخطأ: "Cannot modify default roles"
- هذا سلوك متوقع: لا يمكن تعديل أو حذف الأدوار الافتراضية

