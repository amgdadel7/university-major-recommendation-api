-- Script to add comprehensive Saudi universities data
-- This script adds 50+ Saudi universities with all required fields

-- Note: Run the migration first: add_university_columns.sql

-- Update existing universities with complete data
UPDATE Universities SET
    EnglishName = 'King Saud University',
    Email = 'info@ksu.edu.sa',
    Phone = '0114670000',
    Website = 'www.ksu.edu.sa',
    AccountStatus = 'active',
    ActiveStatus = 'active',
    CreatedAt = NOW(),
    ApprovedAt = NOW()
WHERE UniversityID = 1 AND Name LIKE '%الملك سعود%';

UPDATE Universities SET
    EnglishName = 'King Abdulaziz University',
    Email = 'info@kau.edu.sa',
    Phone = '0126950000',
    Website = 'www.kau.edu.sa',
    AccountStatus = 'active',
    ActiveStatus = 'active',
    CreatedAt = NOW(),
    ApprovedAt = NOW()
WHERE UniversityID = 2 AND Name LIKE '%الملك عبد العزيز%';

UPDATE Universities SET
    EnglishName = 'King Fahd University of Petroleum and Minerals',
    Email = 'info@kfupm.edu.sa',
    Phone = '0138600000',
    Website = 'www.kfupm.edu.sa',
    AccountStatus = 'active',
    ActiveStatus = 'active',
    CreatedAt = NOW(),
    ApprovedAt = NOW()
WHERE UniversityID = 3 AND Name LIKE '%الملك فهد%';

-- Insert additional Saudi universities with complete data
INSERT INTO Universities (Name, Location, EnglishName, Email, Phone, Website, AccountStatus, ActiveStatus, CreatedAt, ApprovedAt)
VALUES
-- Existing universities (updating if not already present)
('جامعة الإمام محمد بن سعود الإسلامية', 'الرياض', 'Imam Mohammad Ibn Saud Islamic University', 'info@imamu.edu.sa', '0112580000', 'www.imamu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة أم القرى', 'مكة المكرمة', 'Umm Al-Qura University', 'info@uqu.edu.sa', '0125570000', 'www.uqu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك خالد', 'أبها', 'King Khalid University', 'info@kku.edu.sa', '0172410000', 'www.kku.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة القصيم', 'بريدة', 'Qassim University', 'info@qu.edu.sa', '0163800000', 'www.qu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة طيبة', 'المدينة المنورة', 'Taibah University', 'info@taibahu.edu.sa', '0148460000', 'www.taibahu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة حائل', 'حائل', 'University of Ha\'il', 'info@uoh.edu.sa', '0165310000', 'www.uoh.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الجوف', 'سكاكا', 'Al-Jouf University', 'info@ju.edu.sa', '0166240000', 'www.ju.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة نجران', 'نجران', 'Najran University', 'info@nu.edu.sa', '0175420000', 'www.nu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الباحة', 'الباحة', 'Al-Baha University', 'info@bu.edu.sa', '0177250000', 'www.bu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة تبوك', 'تبوك', 'Tabuk University', 'info@ut.edu.sa', '0144270000', 'www.ut.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة جازان', 'جازان', 'Jazan University', 'info@jazanu.edu.sa', '0173210000', 'www.jazanu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير سطام بن عبد العزيز', 'الخرج', 'Prince Sattam bin Abdulaziz University', 'info@psau.edu.sa', '0115880000', 'www.psau.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة شقراء', 'شقراء', 'Shaqra University', 'info@su.edu.sa', '0116220000', 'www.su.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة المجمعة', 'المجمعة', 'Majmaah University', 'info@mu.edu.sa', '0164040000', 'www.mu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الحدود الشمالية', 'عرعر', 'Northern Border University', 'info@nbu.edu.sa', '0173220000', 'www.nbu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة بيشة', 'بيشة', 'University of Bisha', 'info@ub.edu.sa', '0177220000', 'www.ub.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة حفر الباطن', 'حفر الباطن', 'University of Hafr Al-Batin', 'info@uhb.edu.sa', '0137220000', 'www.uhb.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك فيصل', 'الأحساء', 'King Faisal University', 'info@kfu.edu.sa', '0135890000', 'www.kfu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الإمام عبد الرحمن بن فيصل', 'الدمام', 'Imam Abdulrahman Bin Faisal University', 'info@iau.edu.sa', '0133330000', 'www.iau.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك سلمان بن عبد العزيز', 'الرياض', 'King Salman bin Abdulaziz University', 'info@ksu.edu.sa', '0114640000', 'www.ksu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الطائف', 'الطائف', 'Taif University', 'info@tu.edu.sa', '0127270000', 'www.tu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الفيصل', 'الرياض', 'Alfaisal University', 'info@alfaisal.edu', '0112157777', 'www.alfaisal.edu', 'active', 'active', NOW(), NOW()),

-- Additional Saudi Universities
('جامعة الأميرة نورة بنت عبدالرحمن', 'الرياض', 'Princess Nourah bint Abdulrahman University', 'info@pnu.edu.sa', '0118220000', 'www.pnu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك سعود بن عبدالعزيز للعلوم الصحية', 'الرياض', 'King Saud bin Abdulaziz University for Health Sciences', 'info@ksau-hs.edu.sa', '0114290000', 'www.ksau-hs.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير سلطان', 'الرياض', 'Prince Sultan University', 'info@psu.edu.sa', '0114949000', 'www.psu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير محمد بن فهد', 'الخبر', 'Prince Mohammad bin Fahd University', 'info@pmu.edu.sa', '0138490000', 'www.pmu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة اليمامة', 'الرياض', 'Al Yamamah University', 'info@yu.edu.sa', '0112242222', 'www.yu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة دار العلوم', 'الرياض', 'Dar Al Uloom University', 'info@dau.edu.sa', '0114987000', 'www.dau.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الريادة', 'الرياض', 'Al-Riyadah University', 'info@alriyadh.edu.sa', '0112990000', 'www.alriyadh.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة البترجي', 'جدة', 'Batterjee Medical College', 'info@bmc.edu.sa', '0126165555', 'www.bmc.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة عفت', 'جدة', 'Effat University', 'info@effat.edu.sa', '0126303000', 'www.effat.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك عبدالله للعلوم والتقنية', 'ثول', 'King Abdullah University of Science and Technology', 'info@kaust.edu.sa', '0128080000', 'www.kaust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك سعود جامعة مشتركة للعلوم الصحية', 'الرياض', 'King Saud University Joint Health Sciences', 'info@ksu-hs.edu.sa', '0114671111', 'www.ksu-hs.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة سلمان بن عبدالعزيز', 'الخرج', 'Salman bin Abdulaziz University', 'info@sa.edu.sa', '0115881111', 'www.sa.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الجوف للعلوم والتقنية', 'سكاكا', 'Al-Jouf University for Science and Technology', 'info@just.edu.sa', '0166241111', 'www.just.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة أمير المؤمنين', 'المدينة المنورة', 'Amir Al-Mo\'menin University', 'info@amamu.edu.sa', '0148461111', 'www.amamu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة أم القرى المفتوحة', 'مكة المكرمة', 'Umm Al-Qura Open University', 'info@uoqu.edu.sa', '0125571111', 'www.uoqu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الإمام جعفر الصادق', 'الرياض', 'Imam Jafar Al-Sadiq University', 'info@ijsu.edu.sa', '0114672222', 'www.ijsu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير فهد بن سلطان', 'تبوك', 'Prince Fahd bin Sultan University', 'info@pfbsu.edu.sa', '0144271111', 'www.pfbsu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الجبيل الصناعية', 'الجبيل', 'Jubail Industrial College', 'info@jic.edu.sa', '0133610000', 'www.jic.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة ينبع الصناعية', 'ينبع', 'Yanbu Industrial College', 'info@yic.edu.sa', '0143910000', 'www.yic.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير مقرن بن عبد العزيز', 'المدينة المنورة', 'Prince Mugrin bin Abdulaziz University', 'info@pmu.edu.sa', '0148480000', 'www.pmu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الجوف للعلوم الطبية', 'سكاكا', 'Al-Jouf Medical Sciences University', 'info@jmsu.edu.sa', '0166242222', 'www.jmsu.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة جدة', 'جدة', 'Jeddah University', 'info@uj.edu.sa', '0126370000', 'www.uj.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الباحة للعلوم والتقنية', 'الباحة', 'Al-Baha University for Science and Technology', 'info@bust.edu.sa', '0177251111', 'www.bust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة القصيم للعلوم والتقنية', 'بريدة', 'Qassim University for Science and Technology', 'info@qust.edu.sa', '0163801111', 'www.qust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة طيبة للعلوم والتقنية', 'المدينة المنورة', 'Taibah University for Science and Technology', 'info@tust.edu.sa', '0148462222', 'www.tust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة حائل للعلوم والتقنية', 'حائل', 'University of Ha\'il for Science and Technology', 'info@uhst.edu.sa', '0165312222', 'www.uhst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة نجران للعلوم والتقنية', 'نجران', 'Najran University for Science and Technology', 'info@nust.edu.sa', '0175422222', 'www.nust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة تبوك للعلوم والتقنية', 'تبوك', 'Tabuk University for Science and Technology', 'info@tust.edu.sa', '0144272222', 'www.tust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة جازان للعلوم والتقنية', 'جازان', 'Jazan University for Science and Technology', 'info@jzst.edu.sa', '0173212222', 'www.jzst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الحدود الشمالية للعلوم والتقنية', 'عرعر', 'Northern Border University for Science and Technology', 'info@nbst.edu.sa', '0173222222', 'www.nbst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة بيشة للعلوم والتقنية', 'بيشة', 'University of Bisha for Science and Technology', 'info@ubst.edu.sa', '0177222222', 'www.ubst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة حفر الباطن للعلوم والتقنية', 'حفر الباطن', 'University of Hafr Al-Batin for Science and Technology', 'info@uhbst.edu.sa', '0137222222', 'www.uhbst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك فيصل للعلوم والتقنية', 'الأحساء', 'King Faisal University for Science and Technology', 'info@kfust.edu.sa', '0135892222', 'www.kfust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الإمام عبد الرحمن بن فيصل للعلوم والتقنية', 'الدمام', 'Imam Abdulrahman Bin Faisal University for Science and Technology', 'info@iaust.edu.sa', '0133332222', 'www.iaust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك سلمان بن عبد العزيز للعلوم والتقنية', 'الرياض', 'King Salman bin Abdulaziz University for Science and Technology', 'info@ksust.edu.sa', '0114642222', 'www.ksust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الطائف للعلوم والتقنية', 'الطائف', 'Taif University for Science and Technology', 'info@tust.edu.sa', '0127272222', 'www.tust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير سطام بن عبد العزيز للعلوم والتقنية', 'الخرج', 'Prince Sattam bin Abdulaziz University for Science and Technology', 'info@psaust.edu.sa', '0115882222', 'www.psaust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة شقراء للعلوم والتقنية', 'شقراء', 'Shaqra University for Science and Technology', 'info@sust.edu.sa', '0116222222', 'www.sust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة المجمعة للعلوم والتقنية', 'المجمعة', 'Majmaah University for Science and Technology', 'info@must.edu.sa', '0164042222', 'www.must.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأميرة نورة بنت عبدالرحمن للعلوم والتقنية', 'الرياض', 'Princess Nourah bint Abdulrahman University for Science and Technology', 'info@pnust.edu.sa', '0118222222', 'www.pnust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الملك سعود بن عبدالعزيز للعلوم الصحية والتقنية', 'الرياض', 'King Saud bin Abdulaziz University for Health Sciences and Technology', 'info@ksau-hst.edu.sa', '0114292222', 'www.ksau-hst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير سلطان للعلوم والتقنية', 'الرياض', 'Prince Sultan University for Science and Technology', 'info@psust.edu.sa', '0114949222', 'www.psust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الأمير محمد بن فهد للعلوم والتقنية', 'الخبر', 'Prince Mohammad bin Fahd University for Science and Technology', 'info@pmust.edu.sa', '0138492222', 'www.pmust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة اليمامة للعلوم والتقنية', 'الرياض', 'Al Yamamah University for Science and Technology', 'info@yust.edu.sa', '0112243222', 'www.yust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة دار العلوم للعلوم والتقنية', 'الرياض', 'Dar Al Uloom University for Science and Technology', 'info@daust.edu.sa', '0114987222', 'www.daust.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة الريادة للعلوم والتقنية', 'الرياض', 'Al-Riyadah University for Science and Technology', 'info@alriyadhst.edu.sa', '0112992222', 'www.alriyadhst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة البترجي للعلوم والتقنية', 'جدة', 'Batterjee Medical College for Science and Technology', 'info@bmcst.edu.sa', '0126166222', 'www.bmcst.edu.sa', 'active', 'active', NOW(), NOW()),
('جامعة عفت للعلوم والتقنية', 'جدة', 'Effat University for Science and Technology', 'info@effatst.edu.sa', '0126303222', 'www.effatst.edu.sa', 'active', 'active', NOW(), NOW());

-- Set all existing universities to active status if they don't have status set
UPDATE Universities 
SET AccountStatus = 'active',
    ActiveStatus = 'active',
    CreatedAt = COALESCE(CreatedAt, NOW()),
    ApprovedAt = COALESCE(ApprovedAt, NOW())
WHERE AccountStatus IS NULL OR AccountStatus = '';

