-- =====================================================
-- SQL Script لحذف جميع بيانات الجداول
-- Delete All Data from All Tables
-- =====================================================

-- تعطيل فحوصات Foreign Key مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- حذف جميع البيانات من الجداول
-- الترتيب: الجداول التي تحتوي على Foreign Keys أولاً، ثم الجداول الأساسية

-- 1. حذف بيانات الجداول التابعة (مع Foreign Keys)
TRUNCATE TABLE Messages;
TRUNCATE TABLE Conversations;
TRUNCATE TABLE Interviews;
TRUNCATE TABLE CalendarEvents;
TRUNCATE TABLE TrackingNotes;
TRUNCATE TABLE Monitors;
TRUNCATE TABLE Applications;
TRUNCATE TABLE UniversityMajors;
TRUNCATE TABLE Recommendations;
TRUNCATE TABLE LearningStyles;
TRUNCATE TABLE Interactions;
TRUNCATE TABLE Answers;
TRUNCATE TABLE Semesters;
TRUNCATE TABLE AuditLogs;
TRUNCATE TABLE SystemNotifications;
TRUNCATE TABLE Reports;
TRUNCATE TABLE BackupRecords;
TRUNCATE TABLE Content;

-- 2. حذف بيانات الجداول الأساسية
TRUNCATE TABLE Students;
TRUNCATE TABLE Teachers;
TRUNCATE TABLE Admins;
TRUNCATE TABLE Questions;
TRUNCATE TABLE Majors;
TRUNCATE TABLE Universities;
TRUNCATE TABLE SystemSettings;

-- إعادة تفعيل فحوصات Foreign Key
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- ملاحظة: إذا كنت تريد أيضاً إعادة تعيين AUTO_INCREMENT
-- يمكنك استخدام: ALTER TABLE TableName AUTO_INCREMENT = 1;
-- =====================================================

-- إعادة تعيين AUTO_INCREMENT لجميع الجداول (اختياري)
ALTER TABLE Universities AUTO_INCREMENT = 1;
ALTER TABLE Majors AUTO_INCREMENT = 1;
ALTER TABLE Teachers AUTO_INCREMENT = 1;
ALTER TABLE Students AUTO_INCREMENT = 1;
ALTER TABLE Questions AUTO_INCREMENT = 1;
ALTER TABLE Answers AUTO_INCREMENT = 1;
ALTER TABLE Interactions AUTO_INCREMENT = 1;
ALTER TABLE LearningStyles AUTO_INCREMENT = 1;
ALTER TABLE Recommendations AUTO_INCREMENT = 1;
ALTER TABLE UniversityMajors AUTO_INCREMENT = 1;
ALTER TABLE Applications AUTO_INCREMENT = 1;
ALTER TABLE Monitors AUTO_INCREMENT = 1;
ALTER TABLE AuditLogs AUTO_INCREMENT = 1;
ALTER TABLE TrackingNotes AUTO_INCREMENT = 1;
ALTER TABLE Semesters AUTO_INCREMENT = 1;
ALTER TABLE Interviews AUTO_INCREMENT = 1;
ALTER TABLE CalendarEvents AUTO_INCREMENT = 1;
ALTER TABLE SystemNotifications AUTO_INCREMENT = 1;
ALTER TABLE Reports AUTO_INCREMENT = 1;
ALTER TABLE Content AUTO_INCREMENT = 1;
ALTER TABLE Messages AUTO_INCREMENT = 1;
ALTER TABLE Conversations AUTO_INCREMENT = 1;
ALTER TABLE Admins AUTO_INCREMENT = 1;
ALTER TABLE BackupRecords AUTO_INCREMENT = 1;
ALTER TABLE SystemSettings AUTO_INCREMENT = 1;

-- =====================================================
-- تم حذف جميع البيانات بنجاح!
-- All data has been deleted successfully!
-- =====================================================
