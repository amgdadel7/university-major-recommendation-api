-- Script to link universities to their majors
-- This script links all universities to appropriate majors based on university type

-- Delete existing links (optional - comment out if you want to keep existing links)
-- DELETE FROM UniversityMajors;

-- Link all universities to common majors
-- First, let's link all universities to all majors (you can customize this based on university type)

-- Link all universities to Engineering majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الهندسة المدنية', 'الهندسة المعمارية', 'الهندسة الميكانيكية', 
    'الهندسة الكهربائية', 'الهندسة الصناعية', 'هندسة الحاسب الآلي',
    'هندسة البرمجيات', 'الهندسة الكيميائية', 'هندسة البترول',
    'الهندسة البيئية', 'الهندسة الزراعية'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Medical majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الطب والجراحة', 'طب الأسنان', 'الصيدلة', 'التمريض',
    'الطب البيطري', 'العلوم الطبية التطبيقية', 'العلاج الطبيعي',
    'العلاج الوظيفي'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Sciences majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء',
    'الكيمياء الحيوية', 'الفيزياء الطبية', 'الرياضيات التطبيقية', 'الإحصاء'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Computer Science majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'علوم الحاسب الآلي', 'تقنية المعلومات', 'أمن المعلومات',
    'الذكاء الاصطناعي', 'علوم البيانات', 'الشبكات والحاسب'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Business majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'إدارة الأعمال', 'المحاسبة', 'التسويق', 'التمويل',
    'إدارة الموارد البشرية', 'نظم المعلومات الإدارية', 'إدارة المشاريع'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Islamic Studies majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الشريعة', 'أصول الدين', 'القرآن الكريم وعلومه', 'الحديث النبوي'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Humanities & Social Sciences majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا',
    'علم النفس', 'علم الاجتماع', 'التربية', 'التربية الخاصة',
    'الطفولة المبكرة'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Education majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'تعليم الرياضيات', 'تعليم العلوم', 'تعليم اللغة العربية', 'تعليم اللغة الإنجليزية'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Media & Communication majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الإعلام', 'العلاقات العامة', 'الإذاعة والتلفزيون'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Law
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name = 'القانون'
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Art & Design majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'التربية الفنية', 'التصميم الجرافيكي', 'التصميم الداخلي'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Agriculture majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'الزراعة', 'الهندسة الزراعية'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link all universities to Other majors
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name IN (
    'التربية البدنية', 'التغذية', 'الإدارة الصحية'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Special links for specific universities

-- Link Petroleum Engineering major only to relevant universities
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name = 'هندسة البترول'
AND (
    u.Name LIKE '%البترول%' OR 
    u.Name LIKE '%المعادن%' OR
    u.EnglishName LIKE '%Petroleum%' OR
    u.EnglishName LIKE '%Minerals%'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

-- Link Nuclear Engineering to engineering universities only
INSERT INTO UniversityMajors (UniversityID, MajorID)
SELECT u.UniversityID, m.MajorID
FROM Universities u
CROSS JOIN Majors m
WHERE m.Name = 'الهندسة النووية'
AND (
    u.Name LIKE '%البترول%' OR 
    u.Name LIKE '%التقنية%' OR
    u.EnglishName LIKE '%Technology%' OR
    u.EnglishName LIKE '%Petroleum%'
)
AND NOT EXISTS (
    SELECT 1 FROM UniversityMajors um 
    WHERE um.UniversityID = u.UniversityID AND um.MajorID = m.MajorID
);

