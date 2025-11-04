-- Insert default permissions
INSERT INTO Permissions (Name, Description, Module, Action) VALUES
('عرض المستخدمين', 'إمكانية عرض قائمة المستخدمين', 'users', 'read'),
('إضافة مستخدمين', 'إمكانية إضافة مستخدمين جدد', 'users', 'create'),
('تعديل المستخدمين', 'إمكانية تعديل بيانات المستخدمين', 'users', 'update'),
('حذف المستخدمين', 'إمكانية حذف المستخدمين', 'users', 'delete'),
('عرض الاستبيانات', 'إمكانية عرض الاستبيانات', 'surveys', 'read'),
('إدارة الاستبيانات', 'إمكانية إضافة وتعديل الاستبيانات', 'surveys', 'manage'),
('عرض التخصصات', 'إمكانية عرض التخصصات', 'majors', 'read'),
('إدارة التخصصات', 'إمكانية إضافة وتعديل التخصصات', 'majors', 'manage'),
('عرض الطلبات', 'إمكانية عرض طلبات التقديم', 'applications', 'read'),
('قبول/رفض الطلبات', 'إمكانية قبول أو رفض الطلبات', 'applications', 'manage'),
('عرض التقارير', 'إمكانية عرض التقارير والإحصائيات', 'reports', 'read'),
('تصدير التقارير', 'إمكانية تصدير التقارير', 'reports', 'export'),
('عرض الجامعات', 'إمكانية عرض الجامعات', 'universities', 'read'),
('إدارة الجامعات', 'إمكانية إضافة وتعديل الجامعات', 'universities', 'manage'),
('عرض الصلاحيات', 'إمكانية عرض الصلاحيات والأدوار', 'permissions', 'read'),
('إدارة الصلاحيات', 'إمكانية إدارة الصلاحيات والأدوار', 'permissions', 'manage')
ON DUPLICATE KEY UPDATE Description = VALUES(Description);

-- Insert default roles
INSERT INTO Roles (Name, Description, IsCustom, IsDefault) VALUES
('مدير النظام', 'صلاحيات كاملة على جميع أجزاء النظام', FALSE, TRUE),
('مدير الجامعة', 'إدارة التخصصات والطلبات', FALSE, TRUE),
('مشرف القبول', 'إدارة طلبات التقديم فقط', FALSE, TRUE),
('مشرف الإحصائيات', 'عرض التقارير والإحصائيات فقط', FALSE, TRUE)
ON DUPLICATE KEY UPDATE Description = VALUES(Description);

-- Assign all permissions to admin role
SET @adminRoleId = (SELECT RoleID FROM Roles WHERE Name = 'مدير النظام' LIMIT 1);
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT @adminRoleId, PermissionID FROM Permissions
ON DUPLICATE KEY UPDATE RoleID = RoleID;

-- Assign permissions to university manager role
SET @universityRoleId = (SELECT RoleID FROM Roles WHERE Name = 'مدير الجامعة' LIMIT 1);
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT @universityRoleId, PermissionID FROM Permissions 
WHERE Module IN ('majors', 'applications', 'reports') AND Action IN ('read', 'manage')
ON DUPLICATE KEY UPDATE RoleID = RoleID;

-- Assign permissions to admission supervisor role
SET @admissionRoleId = (SELECT RoleID FROM Roles WHERE Name = 'مشرف القبول' LIMIT 1);
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT @admissionRoleId, PermissionID FROM Permissions 
WHERE Module = 'applications'
ON DUPLICATE KEY UPDATE RoleID = RoleID;

-- Assign permissions to statistics supervisor role
SET @statsRoleId = (SELECT RoleID FROM Roles WHERE Name = 'مشرف الإحصائيات' LIMIT 1);
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT @statsRoleId, PermissionID FROM Permissions 
WHERE Module = 'reports'
ON DUPLICATE KEY UPDATE RoleID = RoleID;

