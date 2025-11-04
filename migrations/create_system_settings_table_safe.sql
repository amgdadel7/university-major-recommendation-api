-- System Settings Table - جدول الإعدادات العامة للنظام (Safe Version - يحافظ على البيانات الموجودة)
-- Use this if you want to keep existing data

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS SystemSettings (
    SettingID INT PRIMARY KEY DEFAULT 1,
    -- Privacy & Terms
    PrivacyPolicy TEXT NULL,
    TermsOfService TEXT NULL,
    -- Application Period
    ApplicationStartDate DATE NULL,
    ApplicationEndDate DATE NULL,
    -- Email Settings
    SMTPHost VARCHAR(255) NULL,
    SMTPPort INT NULL,
    SMTPUser VARCHAR(255) NULL,
    SMTPPassword TEXT NULL, -- Encrypted password
    EmailFrom VARCHAR(255) NULL,
    EmailEnabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- Branding
    PlatformName VARCHAR(255) NOT NULL DEFAULT 'University Major Recommendation System',
    PlatformLogo VARCHAR(500) NULL,
    PrimaryColor VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    SecondaryColor VARCHAR(7) NOT NULL DEFAULT '#8B5CF6',
    -- Language & Timezone
    DefaultLanguage VARCHAR(10) NOT NULL DEFAULT 'ar',
    SupportedLanguages VARCHAR(255) NOT NULL DEFAULT 'ar,en',
    Timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Riyadh',
    -- Features
    EnableAIRecommendations BOOLEAN NOT NULL DEFAULT TRUE,
    EnableStudentTracking BOOLEAN NOT NULL DEFAULT TRUE,
    EnableNotifications BOOLEAN NOT NULL DEFAULT TRUE,
    MaintenanceMode BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings only if SettingID=1 doesn't exist
INSERT INTO SystemSettings (
    SettingID,
    PrivacyPolicy,
    TermsOfService,
    ApplicationStartDate,
    ApplicationEndDate,
    SMTPHost,
    SMTPPort,
    SMTPUser,
    EmailFrom,
    EmailEnabled,
    PlatformName,
    PlatformLogo,
    PrimaryColor,
    SecondaryColor,
    DefaultLanguage,
    SupportedLanguages,
    Timezone,
    EnableAIRecommendations,
    EnableStudentTracking,
    EnableNotifications,
    MaintenanceMode
) 
SELECT 
    1,
    'We respect your privacy and are committed to protecting your personal data...',
    'By using this platform, you agree to the following terms...',
    '2024-01-01',
    '2024-06-30',
    'smtp.gmail.com',
    587,
    'noreply@university.edu',
    'University Admission System',
    TRUE,
    'University Major Recommendation System',
    '/logo.png',
    '#3B82F6',
    '#8B5CF6',
    'ar',
    'ar,en',
    'Asia/Riyadh',
    TRUE,
    TRUE,
    TRUE,
    FALSE
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM SystemSettings WHERE SettingID = 1
);

