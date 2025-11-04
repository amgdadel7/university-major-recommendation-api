-- Create University Users Table
-- This table stores login credentials for university users
-- Each university can have multiple users (administrators, staff, etc.)

CREATE TABLE IF NOT EXISTS UniversityUsers (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UniversityID INT NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'university_staff',
    Position VARCHAR(100) NULL,
    Phone VARCHAR(20) NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    IsMainAdmin BOOLEAN DEFAULT FALSE, -- Main admin for the university (usually the first user)
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID) ON DELETE CASCADE,
    INDEX idx_email (Email),
    INDEX idx_university (UniversityID),
    INDEX idx_active (IsActive),
    INDEX idx_role (Role),
    UNIQUE KEY uq_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE UniversityUsers COMMENT = 'مستخدمي الجامعات - بيانات تسجيل الدخول';

