## هيكل قاعدة البيانات / Database Schema

هذا المستند يلخص الجداول الأساسية كما في `migrations/database.sql` مع أبرز الحقول والعلاقات.

---

### Universities
- UniversityID (PK)
- Name, Location

### Majors
- MajorID (PK)
- Name, Description

### UniversityMajors (Many-to-Many)
- UMID (PK)
- UniversityID (FK -> Universities)
- MajorID (FK -> Majors)
- UNIQUE (UniversityID, MajorID)

### Students
- StudentID (PK)
- FullName, Email (INDEX), PasswordHash
- Age, Gender ENUM('M','F','Other')
- AcademicData (JSON/TEXT), Preferences (JSON/TEXT)
- CreatedAt

### Teachers
- TeacherID (PK)
- FullName, Email, PasswordHash
- Role, AccessLevel, UniversityID (FK)
- CreatedAt

### Applications
- ApplicationID (PK)
- StudentID (FK), UniversityID (FK), MajorID (FK)
- AppliedAt, Status ENUM('pending','under-review','accepted','rejected')
- Notes, Documents JSON
- UNIQUE (StudentID, UniversityID, MajorID)
- INDEX (Status), INDEX (AppliedAt)

### Questions
- QuestionID (PK)
- Text, Category, Type

### Answers
- AnswerID (PK)
- StudentID (FK), QuestionID (FK)
- Answer
- UNIQUE (StudentID, QuestionID)

### Recommendations
- RecommendationID (PK)
- StudentID (FK), MajorID (FK)
- GeneratedAt, RecommendationText
- ConfidenceScore FLOAT (0..1)
- Feedback ENUM('positive','negative'), BiasDetected BOOL
- ModelVersion
- INDEX (StudentID, ConfidenceScore)
- INDEX (Feedback)

### LearningStyles
- StyleID (PK)
- StudentID (FK, UNIQUE)
- VisualScore, AuditoryScore, ReadingScore, KinestheticScore
- DominantStyle, SuggestedStrategies

### Interactions
- InteractionID (PK)
- StudentID (FK)
- InteractionType, MessageContent, EngagementLevel
- CreatedAt

### TrackingNotes
- NoteID (PK)
- StudentID (FK), TeacherID (FK)
- NoteType ENUM('academic','behavioral','guidance','general')
- Note, CreatedAt, UpdatedAt
- INDEX (StudentID, TeacherID), INDEX (CreatedAt)

### Semesters
- SemesterID (PK)
- UniversityID (FK)
- Name, Year
- StartDate, EndDate
- ApplicationStartDate, ApplicationEndDate
- Status ENUM('upcoming','active','completed','archived')
- TotalApplications, AcceptedApplications
- UNIQUE (UniversityID, Name, Year)
- INDEX (UniversityID, Status)

### Interviews
- InterviewID (PK)
- ApplicationID (FK), StudentID (FK)
- InterviewDate, InterviewTime
- Location, InterviewerID, InterviewerName
- Status ENUM('scheduled','completed','cancelled','no-show')
- Result ENUM('accepted','rejected','pending')
- Notes, CreatedAt
- INDEX (ApplicationID), INDEX (StudentID, Status), INDEX (InterviewDate)

### CalendarEvents
- EventID (PK)
- UserID, UserType ENUM('teacher','university','admin')
- Title, Description
- EventDate, EventTime
- EventType ENUM('followup','meeting','deadline','report','other')
- Reminder BOOL, RelatedStudentID (FK, NULL)
- INDEX (UserID, UserType), INDEX (EventDate)

### SystemNotifications
- NotificationID (PK)
- UserID, UserType ENUM('teacher','university','admin','student')
- Title, Message
- NotificationType ENUM('info','success','warning','error')
- IsRead BOOL, RelatedEntityType, RelatedEntityID
- CreatedAt
- INDEX (UserID, IsRead), INDEX (CreatedAt)

### Content
- ContentID (PK)
- ContentType ENUM('announcement','faq','terms','privacy')
- Title, Content, Status ENUM('published','draft')
- CreatedBy, CreatedAt, UpdatedAt
- INDEX (ContentType, Status)

### Conversations
- ConversationID (PK)
- Participant1ID, Participant1Type
- Participant2ID, Participant2Type
- LastMessageAt, LastMessageText, UnreadCount
- UNIQUE (Participant1ID, Participant1Type, Participant2ID, Participant2Type)
- INDEX (LastMessageAt)

### Messages
- MessageID (PK)
- ConversationID (INDEX)
- SenderID, SenderType
- ReceiverID, ReceiverType
- Message, IsRead, CreatedAt
- INDEX (ReceiverID, IsRead), INDEX (CreatedAt)

### Admins
- AdminID (PK)
- FullName, Email (UNIQUE)
- PasswordHash, Role DEFAULT 'admin'
- AccessLevel, IsActive, CreatedAt, LastLoginAt
- INDEX (Email), INDEX (IsActive)

### BackupRecords
- BackupID (PK)
- BackupType ENUM('full','incremental','differential')
- FilePath, FileSize, Status ENUM('success','failed','in-progress')
- CreatedBy, CreatedAt, CompletedAt, ErrorMessage
- INDEX (Status), INDEX (CreatedAt)

### SystemSettings
- SettingID (PK)
- SettingKey (UNIQUE), SettingValue, SettingType ENUM('text','number','boolean','json')
- Category, Description, UpdatedAt
- INDEX (Category)

---

ملاحظات / Notes:
- استخدم `migrations/*.sql` لإنشاء الجداول وإدراج البيانات البذرية.
- راجع ملفات: `create_permissions_tables.sql`, `seed_permissions.sql`, `create_ai_settings_table.sql`.


