# Database Migrations

## إنشاء جداول الصلاحيات والأدوار

### الخطوة 1: إنشاء الجداول

قم بتشغيل ملف SQL لإنشاء الجداول:

```bash
mysql -h mysql5047.site4now.net -u abf0c2_umj -padmin123 db_abf0c2_umj < create_permissions_tables.sql
```

أو استخدم أي MySQL client وافتح ملف `create_permissions_tables.sql` وقم بتنفيذه.

### الخطوة 2: إدراج البيانات الافتراضية

بعد إنشاء الجداول، قم بإدراج البيانات الافتراضية:

```bash
mysql -h mysql5047.site4now.net -u abf0c2_umj -padmin123 db_abf0c2_umj < seed_permissions.sql
```

### الجداول التي سيتم إنشاؤها:

1. **Permissions** - جدول الصلاحيات
   - PermissionID
   - Name
   - Description
   - Module
   - Action

2. **Roles** - جدول الأدوار
   - RoleID
   - Name
   - Description
   - IsCustom
   - IsDefault

3. **RolePermissions** - جدول ربط الأدوار بالصلاحيات
   - RolePermissionID
   - RoleID
   - PermissionID

4. **UserRoles** - جدول ربط المستخدمين بالأدوار
   - UserRoleID
   - UserID
   - UserType
   - RoleID

### البيانات الافتراضية:

سيتم إدراج:
- 16 صلاحية أساسية (عرض، إضافة، تعديل، حذف، إدارة)
- 4 أدوار افتراضية:
  - مدير النظام (جميع الصلاحيات)
  - مدير الجامعة (التخصصات والطلبات)
  - مشرف القبول (إدارة الطلبات)
  - مشرف الإحصائيات (عرض التقارير)

