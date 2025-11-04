-- Seed Audit Logs - بيانات تجريبية لسجل النشاط والتدقيق
-- استخدم هذا الملف لإنشاء بيانات تجريبية للاختبار

-- ملاحظة: تأكد من وجود مستخدمين في جداول Admins, Teachers, أو Students
-- قبل تشغيل هذا الملف

-- الحصول على ID أول مستخدم (Admin أو Teacher)
SET @user_id = COALESCE(
  (SELECT AdminID FROM Admins LIMIT 1),
  (SELECT TeacherID FROM Teachers LIMIT 1),
  (SELECT StudentID FROM Students LIMIT 1),
  1
);

SET @user_name = COALESCE(
  (SELECT FullName FROM Admins LIMIT 1),
  (SELECT FullName FROM Teachers LIMIT 1),
  (SELECT FullName FROM Students LIMIT 1),
  'Admin Test'
);

-- إدراج سجلات تجريبية
INSERT INTO AuditLogs (UserID, UserName, Action, Entity, Description, IPAddress, UserAgent, Severity, CreatedAt) VALUES
-- سجلات إنشاء (create)
(@user_id, @user_name, 'create', 'user', 'تم إنشاء مستخدم جديد - أحمد محمد', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'medium', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@user_id, @user_name, 'create', 'major', 'تم إضافة تخصص جديد - هندسة البرمجيات', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'medium', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(@user_id, @user_name, 'create', 'application', 'تم إنشاء طلب جديد - طلب قبول طالب', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- سجلات تحديث (update)
(@user_id, @user_name, 'update', 'system', 'تم تعديل إعدادات النظام - تغيير فترة القبول', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'high', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(@user_id, @user_name, 'update', 'major', 'تم تحديث معلومات التخصص - علوم الحاسب', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'medium', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(@user_id, @user_name, 'update', 'application', 'تم تحديث حالة طلب - قبول طالب', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'medium', DATE_SUB(NOW(), INTERVAL 12 HOUR)),

-- سجلات حذف (delete)
(@user_id, @user_name, 'delete', 'user', 'تم حذف مستخدم - مستخدم غير نشط', '192.168.1.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'critical', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(@user_id, @user_name, 'delete', 'student', 'تم حذف بيانات طالب - إلغاء تسجيل', '192.168.1.107', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'high', DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- سجلات تسجيل الدخول (login)
(@user_id, @user_name, 'login', 'system', 'تم تسجيل دخول المستخدم', '192.168.1.108', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(@user_id, @user_name, 'login', 'system', 'تم تسجيل دخول المستخدم', '192.168.1.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- سجلات مشاهدة (view)
(@user_id, @user_name, 'view', 'dashboard', 'تم عرض لوحة التحكم', '192.168.1.110', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(@user_id, @user_name, 'view', 'reports', 'تم عرض التقارير', '192.168.1.111', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'low', DATE_SUB(NOW(), INTERVAL 15 MINUTE));

-- عرض السجلات المضافة
SELECT 
    LogID,
    UserName,
    Action,
    Entity,
    Description,
    Severity,
    CreatedAt
FROM AuditLogs
ORDER BY CreatedAt DESC
LIMIT 20;

-- عدد السجلات حسب نوع الإجراء
SELECT 
    Action,
    COUNT(*) as count
FROM AuditLogs
GROUP BY Action;

-- عدد السجلات حسب مستوى الخطورة
SELECT 
    Severity,
    COUNT(*) as count
FROM AuditLogs
GROUP BY Severity;

