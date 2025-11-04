-- Sample questions for testing
-- Run this SQL script to add sample questions to the Questions table

-- Insert Interest Questions (أسئلة الاهتمامات)
INSERT INTO Questions (Text, Type, Category) VALUES
('ما هي المجالات الأكاديمية التي تهمك أكثر؟', 'interests', 'أكاديمي'),
('ما هي المواد الدراسية التي تفضل دراستها؟', 'interests', 'أكاديمي'),
('ما هي الاهتمامات العلمية التي ترغب في استكشافها؟', 'interests', 'علمي'),
('ما هي المجالات المهنية التي تثير اهتمامك؟', 'interests', 'مهني'),
('ما هي الأنشطة التي تستمتع بها في وقت الفراغ؟', 'interests', 'شخصي');

-- Insert Learning Style Questions (أسئلة أسلوب التعلم)
INSERT INTO Questions (Text, Type, Category) VALUES
('ما هو أسلوب التعلم المفضل لديك؟', 'learning_style', 'تعليمي'),
('كيف تفضل استقبال المعلومات الجديدة؟', 'learning_style', 'تعليمي'),
('هل تفضل التعلم النظري أم العملي؟', 'learning_style', 'تعليمي'),
('ما هي البيئة التعليمية التي تناسبك أكثر؟', 'learning_style', 'تعليمي'),
('كيف تفضل تنظيم وقت التعلم؟', 'learning_style', 'تعليمي');

-- Verify the inserted questions
SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID;

