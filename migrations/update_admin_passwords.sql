-- =====================================================
-- تحديث كلمات مرور الإداريين
-- Update Admin Passwords
-- =====================================================
-- 
-- كلمات المرور الافتراضية (يمكن تغييرها لاحقاً):
-- Default Passwords (can be changed later):
-- 
-- 1. admin@umr.edu.sa        -> Admin123!
-- 2. sara.admin@umr.edu.sa  -> Sara123!
-- 3. khalid.admin@umr.edu.sa -> Khalid123!
-- =====================================================

-- تحديث كلمات المرور باستخدام bcrypt hash
-- Update passwords using bcrypt hash

-- كلمة مرور: Admin123!
UPDATE Admins SET PasswordHash = '$2a$10$frvwvzOIeXOwlEAfNbjmHeW3xdiKi.SFLUv8Bdvzz1Pad4YL0YD4W' WHERE Email = 'admin@umr.edu.sa';

-- كلمة مرور: Sara123!
UPDATE Admins SET PasswordHash = '$2a$10$1XQd7.xkkPzkN7rsL6NiFuZHuKYT3WGNQWLZgOgIw.iymYUfexPB6' WHERE Email = 'sara.admin@umr.edu.sa';

-- كلمة مرور: Khalid123!
UPDATE Admins SET PasswordHash = '$2a$10$wMitoHUvauO2jMqs/bzmwOiurNKqU03UpL6aB7l34YZnyEQKuqTGi' WHERE Email = 'khalid.admin@umr.edu.sa';

