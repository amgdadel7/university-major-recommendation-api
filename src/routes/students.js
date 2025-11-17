/**
 * Students Routes / مسارات الطلاب
 * This file handles all student-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالطلاب
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin, isTeacher } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/students
 * Get all students with pagination / الحصول على جميع الطلاب مع التقسيم
 * Returns a paginated list of all students
 * يعيد قائمة مقسمة لجميع الطلاب
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [students] = await pool.execute(
      `SELECT StudentID as id, FullName as name, Email, Age, Gender, CreatedAt 
       FROM Students 
       ORDER BY CreatedAt DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM Students');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/students/:id
 * Get student by ID / الحصول على طالب بالمعرف
 * Returns detailed information about a specific student
 * يعيد معلومات مفصلة عن طالب محدد
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(
      `SELECT StudentID as id, FullName as name, Email, Age, Gender, 
              AcademicData, Preferences, CreatedAt 
       FROM Students 
       WHERE StudentID = ?`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get student',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/students/:id/tracking
 * Get student tracking notes / الحصول على ملاحظات متابعة الطالب
 * Returns all tracking notes for a specific student
 * يعيد جميع ملاحظات المتابعة لطالب محدد
 */
router.get('/:id/tracking', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [notes] = await pool.execute(
      `SELECT tn.NoteID as id, tn.NoteType as noteType, tn.Note, 
              tn.CreatedAt, tn.UpdatedAt,
              t.TeacherID as teacherId, t.FullName as teacherName
       FROM TrackingNotes tn
       JOIN Teachers t ON tn.TeacherID = t.TeacherID
       WHERE tn.StudentID = ?
       ORDER BY tn.CreatedAt DESC`,
      [id]
    );

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tracking notes',
      error: error.message
    });
  }
});

// Add tracking note
router.post('/:id/tracking', authenticate, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { noteType, note } = req.body;
    const teacherId = req.user.id;

    if (!noteType || !note) {
      return res.status(400).json({
        success: false,
        message: 'Note type and note are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO TrackingNotes (StudentID, TeacherID, NoteType, Note, CreatedAt, UpdatedAt) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [id, teacherId, noteType, note]
    );

    res.status(201).json({
      success: true,
      message: 'Tracking note added successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add tracking note',
      error: error.message
    });
  }
});

// Get student applications
router.get('/:id/applications', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(
      `SELECT a.ApplicationID as id, a.Status, a.AppliedAt, a.Notes,
              u.UniversityID as universityId, u.Name as universityName,
              m.MajorID as majorId, m.Name as majorName
       FROM Applications a
       JOIN Universities u ON a.UniversityID = u.UniversityID
       JOIN Majors m ON a.MajorID = m.MajorID
       WHERE a.StudentID = ?
       ORDER BY a.AppliedAt DESC`,
      [id]
    );

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get applications',
      error: error.message
    });
  }
});

// Get student recommendations
router.get('/:id/recommendations', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [recommendations] = await pool.execute(
      `SELECT r.RecommendationID as id, r.GeneratedAt, r.RecommendationText, 
              r.ConfidenceScore, r.Feedback, r.BiasDetected, r.ModelVersion,
              m.MajorID as majorId, m.Name as majorName, m.Description as majorDescription
       FROM Recommendations r
       JOIN Majors m ON r.MajorID = m.MajorID
       WHERE r.StudentID = ?
       ORDER BY r.GeneratedAt DESC`,
      [id]
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Get student grades (AcademicData) - filtered by current student
// الحصول على درجات الطالب (AcademicData) - مفلترة حسب الطالب الحالي
router.get('/me/grades', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    // Only students can access their own grades
    // فقط الطلاب يمكنهم الوصول إلى درجاتهم
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access their grades'
      });
    }

    // Get StudentID from Students table to ensure we have the correct ID
    // الحصول على StudentID من جدول Students للتأكد من أن لدينا المعرف الصحيح
    const [studentIdRows] = await pool.execute(
      'SELECT StudentID FROM Students WHERE StudentID = ?',
      [id]
    );

    if (studentIdRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = studentIdRows[0].StudentID;

    // Get student AcademicData
    // الحصول على AcademicData للطالب
    const [studentRows] = await pool.execute(
      'SELECT AcademicData FROM Students WHERE StudentID = ?',
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    let grades = [];
    const academicData = studentRows[0].AcademicData;

    if (academicData) {
      try {
        const parsed = JSON.parse(academicData);
        
        // Check for new format: {courses: [{subject, grade}, ...]}
        if (parsed.courses && Array.isArray(parsed.courses)) {
          grades = parsed.courses.map(course => ({
            subject: course.subject || course.name || '',
            grade: parseFloat(course.grade) || 0
          }));
        }
        // Check for old format: {math: 95, science: 88, english: 80}
        else if (typeof parsed === 'object' && parsed !== null) {
          // Convert object format to array format
          grades = Object.entries(parsed)
            .filter(([key, value]) => {
              // Skip metadata fields like 'updatedAt', 'createdAt', etc.
              const metadataFields = ['updatedAt', 'createdAt', 'timestamp'];
              return !metadataFields.includes(key) && typeof value === 'number';
            })
            .map(([subject, grade]) => ({
              subject: subject,
              grade: parseFloat(grade) || 0
            }));
        }
        
        console.log(`Loaded ${grades.length} grades for student ${studentId}`);
      } catch (error) {
        // If parsing fails, return empty array
        console.error('Error parsing AcademicData:', error);
        console.error('AcademicData content:', academicData);
      }
    } else {
      console.log(`No AcademicData found for student ${studentId}`);
    }

    res.json({
      success: true,
      data: {
        grades: grades
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get grades',
      error: error.message
    });
  }
});

// Save student grades (AcademicData) - filtered by current student
// حفظ درجات الطالب (AcademicData) - مفلترة حسب الطالب الحالي
router.post('/me/grades', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;
    const { grades } = req.body;

    // Only students can save their own grades
    // فقط الطلاب يمكنهم حفظ درجاتهم
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can save their grades'
      });
    }

    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({
        success: false,
        message: 'Grades array is required'
      });
    }

    // Get StudentID from Students table to ensure we have the correct ID
    // الحصول على StudentID من جدول Students للتأكد من أن لدينا المعرف الصحيح
    const [studentIdRows] = await pool.execute(
      'SELECT StudentID FROM Students WHERE StudentID = ?',
      [id]
    );

    if (studentIdRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const studentId = studentIdRows[0].StudentID;

    // Get current AcademicData
    // الحصول على AcademicData الحالي
    const [studentRows] = await pool.execute(
      'SELECT AcademicData FROM Students WHERE StudentID = ?',
      [studentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Prepare academic data with grades
    const academicData = {
      courses: grades.map(grade => ({
        subject: grade.subject || grade.name,
        grade: parseFloat(grade.grade) || 0
      })),
      updatedAt: new Date().toISOString()
    };

    // Update AcademicData
    await pool.execute(
      'UPDATE Students SET AcademicData = ? WHERE StudentID = ?',
      [JSON.stringify(academicData), studentId]
    );

    res.json({
      success: true,
      message: 'Grades saved successfully',
      data: academicData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save grades',
      error: error.message
    });
  }
});

module.exports = router;

