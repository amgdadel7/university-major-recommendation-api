-- Script to add university users (مستخدمي الجامعات)
-- This script creates sample university users for testing

-- Note: You should update the passwords after running this script
-- Default password hash is for: "university123" (you should change this!)

-- University Users for King Saud University (UniversityID = 1)
INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, Position, IsMainAdmin, IsActive)
VALUES 
(1, 'مدير جامعة الملك سعود', 'admin@ksu.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'university_admin', 'مدير الجامعة', TRUE, TRUE),
(1, 'مسؤول القبول', 'admissions@ksu.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'admissions_officer', 'مسؤول القبول', FALSE, TRUE),
(1, 'منسق التخصصات', 'majors@ksu.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'university_staff', 'منسق التخصصات', FALSE, TRUE)

-- University Users for King Abdulaziz University (UniversityID = 2)
ON DUPLICATE KEY UPDATE Email = Email;

INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, Position, IsMainAdmin, IsActive)
VALUES 
(2, 'مدير جامعة الملك عبد العزيز', 'admin@kau.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'university_admin', 'مدير الجامعة', TRUE, TRUE),
(2, 'مسؤول القبول', 'admissions@kau.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'admissions_officer', 'مسؤول القبول', FALSE, TRUE)

ON DUPLICATE KEY UPDATE Email = Email;

-- University Users for King Fahd University of Petroleum and Minerals (UniversityID = 3)
INSERT INTO UniversityUsers (UniversityID, FullName, Email, PasswordHash, Role, Position, IsMainAdmin, IsActive)
VALUES 
(3, 'مدير جامعة الملك فهد للبترول والمعادن', 'admin@kfupm.edu.sa', '$2a$10$rXKJqLZ1K1yLzKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K1yuHjKqLZ1K', 'university_admin', 'مدير الجامعة', TRUE, TRUE)

ON DUPLICATE KEY UPDATE Email = Email;

-- Note: 
-- 1. The password hash above is just a placeholder. 
-- 2. You should generate proper bcrypt hashes for actual passwords.
-- 3. To generate a password hash, use bcrypt.hashSync('your_password', 10)
-- 4. Or use the Node.js script below to generate proper hashes.

