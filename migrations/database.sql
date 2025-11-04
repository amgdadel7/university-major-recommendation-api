CREATE TABLE Universities (
    UniversityID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(100) NULL
) ENGINE=InnoDB;

CREATE TABLE Majors (
    MajorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE Teachers (
    TeacherID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL,
    AccessLevel VARCHAR(50) NULL,
    UniversityID INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID)
) ENGINE=InnoDB;

CREATE TABLE Students (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Age INT,
    Gender ENUM('M','F','Other') NULL,
    AcademicData TEXT NULL,
    Preferences TEXT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE Questions (
    QuestionID INT AUTO_INCREMENT PRIMARY KEY,
    Text TEXT NOT NULL,
    Category VARCHAR(50) NULL,
    Type VARCHAR(50) NULL
) ENGINE=InnoDB;

CREATE TABLE Answers (
    AnswerID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    QuestionID INT NOT NULL,
    Answer TEXT NULL,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (QuestionID) REFERENCES Questions(QuestionID),
    UNIQUE KEY uq_student_question (StudentID, QuestionID)
) ENGINE=InnoDB;

CREATE TABLE Interactions (
    InteractionID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    InteractionType VARCHAR(50) NULL,
    MessageContent TEXT NULL,
    EngagementLevel INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

CREATE TABLE LearningStyles (
    StyleID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL UNIQUE,
    VisualScore INT NULL,
    AuditoryScore INT NULL,
    ReadingScore INT NULL,
    KinestheticScore INT NULL,
    DominantStyle VARCHAR(50) NULL,
    SuggestedStrategies TEXT NULL,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
) ENGINE=InnoDB;

CREATE TABLE Recommendations (
    RecommendationID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    MajorID INT NOT NULL,
    GeneratedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    RecommendationText TEXT NULL,
    ConfidenceScore FLOAT NULL,
    Feedback ENUM('positive', 'negative') NULL,
    BiasDetected BOOLEAN DEFAULT FALSE,
    ModelVersion VARCHAR(50) NULL,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (MajorID) REFERENCES Majors(MajorID),
    INDEX idx_student_confidence (StudentID, ConfidenceScore),
    INDEX idx_feedback (Feedback)
) ENGINE=InnoDB;

CREATE TABLE UniversityMajors (
    UMID INT AUTO_INCREMENT PRIMARY KEY,
    UniversityID INT NOT NULL,
    MajorID INT NOT NULL,
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    FOREIGN KEY (MajorID) REFERENCES Majors(MajorID),
    UNIQUE KEY uq_university_major (UniversityID, MajorID)
) ENGINE=InnoDB;

CREATE TABLE Applications (
    ApplicationID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    UniversityID INT NOT NULL,
    MajorID INT NOT NULL,
    AppliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('pending', 'under-review', 'accepted', 'rejected') DEFAULT 'pending',
    Notes TEXT NULL,
    Documents JSON NULL,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    FOREIGN KEY (MajorID) REFERENCES Majors(MajorID),
    UNIQUE KEY uq_application (StudentID, UniversityID, MajorID),
    INDEX idx_status (Status),
    INDEX idx_applied_at (AppliedAt)
) ENGINE=InnoDB;

CREATE TABLE Monitors (
    MonitorID INT AUTO_INCREMENT PRIMARY KEY,
    TeacherID INT NOT NULL,
    StudentID INT NOT NULL,
    AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeacherID) REFERENCES Teachers(TeacherID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    UNIQUE KEY uq_monitor (TeacherID, StudentID)
) ENGINE=InnoDB;

-- Audit Logs Table - سجل النشاط والتدقيق
CREATE TABLE AuditLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    UserName VARCHAR(100) NOT NULL,
    Action VARCHAR(50) NOT NULL,
    Entity VARCHAR(50) NOT NULL,
    Description TEXT NULL,
    IPAddress VARCHAR(45) NULL,
    UserAgent TEXT NULL,
    Severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_action (UserID, Action),
    INDEX idx_entity (Entity),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB;

-- Tracking Notes Table - ملاحظات المتابعة
CREATE TABLE TrackingNotes (
    NoteID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID INT NOT NULL,
    TeacherID INT NOT NULL,
    NoteType ENUM('academic', 'behavioral', 'guidance', 'general') DEFAULT 'general',
    Note TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    FOREIGN KEY (TeacherID) REFERENCES Teachers(TeacherID),
    INDEX idx_student_teacher (StudentID, TeacherID),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB;

-- Semesters Table - الفصول الدراسية
CREATE TABLE Semesters (
    SemesterID INT AUTO_INCREMENT PRIMARY KEY,
    UniversityID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Year VARCHAR(20) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ApplicationStartDate DATE NOT NULL,
    ApplicationEndDate DATE NOT NULL,
    Status ENUM('upcoming', 'active', 'completed', 'archived') DEFAULT 'upcoming',
    TotalApplications INT DEFAULT 0,
    AcceptedApplications INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UniversityID) REFERENCES Universities(UniversityID),
    INDEX idx_university_status (UniversityID, Status),
    UNIQUE KEY uq_semester (UniversityID, Name, Year)
) ENGINE=InnoDB;

-- Interviews Table - المقابلات
CREATE TABLE Interviews (
    InterviewID INT AUTO_INCREMENT PRIMARY KEY,
    ApplicationID INT NOT NULL,
    StudentID INT NOT NULL,
    InterviewDate DATE NOT NULL,
    InterviewTime TIME NOT NULL,
    Location VARCHAR(200) NULL,
    InterviewerID INT NULL,
    InterviewerName VARCHAR(100) NULL,
    Status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    Result ENUM('accepted', 'rejected', 'pending') NULL,
    Notes TEXT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
    INDEX idx_application (ApplicationID),
    INDEX idx_student_status (StudentID, Status),
    INDEX idx_interview_date (InterviewDate)
) ENGINE=InnoDB;

-- Calendar Events Table - أحداث التقويم
CREATE TABLE CalendarEvents (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    UserType ENUM('teacher', 'university', 'admin') NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NULL,
    EventDate DATE NOT NULL,
    EventTime TIME NULL,
    EventType ENUM('followup', 'meeting', 'deadline', 'report', 'other') DEFAULT 'other',
    Reminder BOOLEAN DEFAULT FALSE,
    RelatedStudentID INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_type (UserID, UserType),
    INDEX idx_event_date (EventDate),
    FOREIGN KEY (RelatedStudentID) REFERENCES Students(StudentID) ON DELETE SET NULL
) ENGINE=InnoDB;

-- System Notifications Table - إشعارات النظام
CREATE TABLE SystemNotifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    UserType ENUM('teacher', 'university', 'admin', 'student') NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    NotificationType ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    IsRead BOOLEAN DEFAULT FALSE,
    RelatedEntityType VARCHAR(50) NULL,
    RelatedEntityID INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_read (UserID, IsRead),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB;

-- Reports Table - التقارير
CREATE TABLE Reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    ReportName VARCHAR(200) NOT NULL,
    Description TEXT NULL,
    ReportType ENUM('system', 'users', 'applications', 'majors', 'custom') NOT NULL,
    Period ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom') NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    FilePath VARCHAR(500) NULL,
    GeneratedBy INT NULL,
    GeneratedAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_type (ReportType),
    INDEX idx_generated_at (GeneratedAt)
) ENGINE=InnoDB;

-- Content Table - المحتوى
CREATE TABLE Content (
    ContentID INT AUTO_INCREMENT PRIMARY KEY,
    ContentType ENUM('announcement', 'faq', 'terms', 'privacy') NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Content TEXT NOT NULL,
    Status ENUM('published', 'draft') DEFAULT 'draft',
    CreatedBy INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_content_type_status (ContentType, Status)
) ENGINE=InnoDB;

-- Messages Table - الرسائل
CREATE TABLE Messages (
    MessageID INT AUTO_INCREMENT PRIMARY KEY,
    ConversationID INT NOT NULL,
    SenderID INT NOT NULL,
    SenderType ENUM('teacher', 'student', 'admin', 'university') NOT NULL,
    ReceiverID INT NOT NULL,
    ReceiverType ENUM('teacher', 'student', 'admin', 'university') NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_conversation (ConversationID),
    INDEX idx_receiver_read (ReceiverID, IsRead),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB;

-- Conversations Table - المحادثات
CREATE TABLE Conversations (
    ConversationID INT AUTO_INCREMENT PRIMARY KEY,
    Participant1ID INT NOT NULL,
    Participant1Type ENUM('teacher', 'student', 'admin', 'university') NOT NULL,
    Participant2ID INT NOT NULL,
    Participant2Type ENUM('teacher', 'student', 'admin', 'university') NOT NULL,
    LastMessageAt DATETIME NULL,
    LastMessageText TEXT NULL,
    UnreadCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_participants (Participant1ID, Participant2ID),
    INDEX idx_last_message (LastMessageAt),
    UNIQUE KEY uq_conversation (Participant1ID, Participant1Type, Participant2ID, Participant2Type)
) ENGINE=InnoDB;

-- Admins Table - المدراء
CREATE TABLE Admins (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'admin',
    AccessLevel VARCHAR(50) NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLoginAt DATETIME NULL,
    INDEX idx_email (Email),
    INDEX idx_active (IsActive)
) ENGINE=InnoDB;

-- Backup Records Table - سجل النسخ الاحتياطية
CREATE TABLE BackupRecords (
    BackupID INT AUTO_INCREMENT PRIMARY KEY,
    BackupType ENUM('full', 'incremental', 'differential') NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize BIGINT NULL,
    Status ENUM('success', 'failed', 'in-progress') DEFAULT 'in-progress',
    CreatedBy INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CompletedAt DATETIME NULL,
    ErrorMessage TEXT NULL,
    INDEX idx_status (Status),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB;

-- System Settings Table - إعدادات النظام
CREATE TABLE SystemSettings (
    SettingID INT AUTO_INCREMENT PRIMARY KEY,
    SettingKey VARCHAR(100) NOT NULL UNIQUE,
    SettingValue TEXT NULL,
    SettingType ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    Category VARCHAR(50) NULL,
    Description TEXT NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (Category)
) ENGINE=InnoDB;