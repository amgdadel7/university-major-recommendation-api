-- SQL code لحذف بيانات جدول الأسئلة

-- ⚠️ تحذير: هذا الاستعلام سيمسح جميع البيانات من جدول Questions
-- ⚠️ Warning: This query will delete all data from the Questions table

-- الطريقة 1: حذف جميع الأسئلة (Delete all questions)
DELETE FROM Questions;

-- الطريقة 2: حذف الأسئلة حسب النوع (Delete questions by type)
-- حذف أسئلة الاهتمامات فقط (Delete only interest questions)
DELETE FROM Questions WHERE Type = 'interests';

-- حذف أسئلة أسلوب التعلم فقط (Delete only learning style questions)
DELETE FROM Questions WHERE Type = 'learning_style' OR Type = 'learning-style';

-- الطريقة 3: حذف الأسئلة حسب الفئة (Delete questions by category)
DELETE FROM Questions WHERE Category = 'أكاديمي';

-- الطريقة 4: حذف سؤال محدد (Delete specific question)
-- استبدل QuestionID برقم السؤال المطلوب
DELETE FROM Questions WHERE QuestionID = 1;

-- الطريقة 5: حذف عدة أسئلة محددة (Delete multiple specific questions)
DELETE FROM Questions WHERE QuestionID IN (1, 2, 3);

-- الطريقة 6: إعادة تعيين جدول الأسئلة (Reset Questions table)
-- يحذف جميع البيانات ويعيد تعيين AUTO_INCREMENT
TRUNCATE TABLE Questions;

-- الطريقة 7: حذف وإعادة إنشاء الجدول (Drop and recreate table)
-- ⚠️ تحذير: هذا سيمسح الجدول تماماً ويحتاج إعادة إنشائه
-- DROP TABLE IF EXISTS Questions;
-- CREATE TABLE Questions (
--     QuestionID INT AUTO_INCREMENT PRIMARY KEY,
--     Text TEXT NOT NULL,
--     Category VARCHAR(50) NULL,
--     Type VARCHAR(50) NULL
-- ) ENGINE=InnoDB;

-- للتحقق من عدد الأسئلة المتبقية (Verify remaining questions count)
SELECT COUNT(*) as total_questions FROM Questions;

-- للتحقق من الأسئلة المتبقية (View remaining questions)
SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY QuestionID;

