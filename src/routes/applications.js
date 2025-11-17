/**
 * Applications Routes / مسارات الطلبات
 * This file handles all application-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالطلبات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin, isUniversity, isStudent } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/applications
 * Get applications for current user / الحصول على الطلبات للمستخدم الحالي
 * Returns a list of applications filtered by user role:
 * - Students: only their own applications
 * - Teachers: applications of their students
 * - Admins/Universities: all applications (with optional status filter)
 * يعيد قائمة بالطلبات المفلترة حسب دور المستخدم:
 * - الطلاب: طلباتهم فقط
 * - المعلمون: طلبات طلابهم
 * - المديرون/الجامعات: جميع الطلبات (مع فلتر الحالة الاختياري)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;
    const status = req.query.status;
    
    let query = `
      SELECT a.ApplicationID as id, a.Status, a.AppliedAt, a.Notes,
             s.StudentID as studentId, s.FullName as studentName, s.Email as studentEmail,
             u.UniversityID as universityId, u.Name as universityName,
             m.MajorID as majorId, m.Name as majorName
      FROM Applications a
      JOIN Students s ON a.StudentID = s.StudentID
      JOIN Universities u ON a.UniversityID = u.UniversityID
      JOIN Majors m ON a.MajorID = m.MajorID
    `;
    const params = [];
    const whereConditions = [];

    // Filter by user role
    // التصفية حسب دور المستخدم
    if (role === 'student') {
      // Students can only see their own applications
      // الطلاب يمكنهم رؤية طلباتهم فقط
      // Get StudentID from Students table to ensure we have the correct ID
      // الحصول على StudentID من جدول Students للتأكد من أن لدينا المعرف الصحيح
      const [studentRows] = await pool.execute(
        'SELECT StudentID FROM Students WHERE StudentID = ?',
        [id]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const studentId = studentRows[0].StudentID;
      whereConditions.push('a.StudentID = ?');
      params.push(studentId);
    } else if (role === 'teacher') {
      // Teachers can see applications of their students
      // المعلمون يمكنهم رؤية طلبات طلابهم
      const [teacherStudents] = await pool.execute(
        'SELECT StudentID FROM Students WHERE TeacherID = ?',
        [id]
      );
      
      if (teacherStudents.length === 0) {
        // No students assigned to this teacher
        // لا يوجد طلاب مخصصون لهذا المعلم
        return res.json({
          success: true,
          data: []
        });
      }
      
      const studentIds = teacherStudents.map(s => s.StudentID);
      const placeholders = studentIds.map(() => '?').join(',');
      whereConditions.push(`a.StudentID IN (${placeholders})`);
      params.push(...studentIds);
    } else if (role === 'university') {
      // Universities can see applications for their university
      // الجامعات يمكنها رؤية الطلبات لجامعتها
      const [universityRows] = await pool.execute(
        'SELECT UniversityID FROM UniversityUsers WHERE UserID = ?',
        [id]
      );
      
      if (universityRows.length > 0) {
        const universityId = universityRows[0].UniversityID;
        whereConditions.push('a.UniversityID = ?');
        params.push(universityId);
      }
    }
    // Admins can see all applications (no additional filter)
    // المديرون يمكنهم رؤية جميع الطلبات (لا يوجد فلتر إضافي)

    // Add status filter if provided
    // إضافة فلتر الحالة إذا تم توفيره
    if (status) {
      whereConditions.push('a.Status = ?');
      params.push(status);
    }

    // Build WHERE clause
    // بناء بند WHERE
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY a.AppliedAt DESC';

    const [applications] = await pool.execute(query, params);

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

// Create application
router.post('/', authenticate, isStudent, async (req, res) => {
  try {
    const { universityId, majorId } = req.body;
    const studentId = req.user.id;

    if (!universityId || !majorId) {
      return res.status(400).json({
        success: false,
        message: 'University ID and Major ID are required'
      });
    }

    // Check if application already exists
    const [existing] = await pool.execute(
      'SELECT * FROM Applications WHERE StudentID = ? AND UniversityID = ? AND MajorID = ?',
      [studentId, universityId, majorId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Application already exists'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO Applications (StudentID, UniversityID, MajorID, AppliedAt, Status) VALUES (?, ?, ?, NOW(), ?)',
      [studentId, universityId, majorId, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message
    });
  }
});

// Get application by ID (must come after specific routes)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(
      `SELECT a.ApplicationID as id, a.Status, a.AppliedAt, a.Notes, a.Documents,
             s.StudentID as studentId, s.FullName as studentName, s.Email as studentEmail,
             u.UniversityID as universityId, u.Name as universityName,
             m.MajorID as majorId, m.Name as majorName
       FROM Applications a
       JOIN Students s ON a.StudentID = s.StudentID
       JOIN Universities u ON a.UniversityID = u.UniversityID
       JOIN Majors m ON a.MajorID = m.MajorID
       WHERE a.ApplicationID = ?`,
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: applications[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get application',
      error: error.message
    });
  }
});

// Update application status (specific route must come before general /:id route)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'under-review', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await pool.execute(
      'UPDATE Applications SET Status = ?, Notes = ? WHERE ApplicationID = ?',
      [status, notes || null, id]
    );

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// Update application (for students to edit their pending applications)
router.put('/:id', authenticate, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const { notes, universityId, majorId } = req.body;

    // Verify the application belongs to the student and is pending
    const [applications] = await pool.execute(
      'SELECT * FROM Applications WHERE ApplicationID = ? AND StudentID = ?',
      [id, studentId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = applications[0];

    // Only allow editing if status is pending
    if (application.Status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be edited'
      });
    }

    // Build update query dynamically based on what's provided
    const updates = [];
    const params = [];

    if (notes !== undefined) {
      updates.push('Notes = ?');
      params.push(notes);
    }

    if (universityId !== undefined) {
      updates.push('UniversityID = ?');
      params.push(universityId);
    }

    if (majorId !== undefined) {
      updates.push('MajorID = ?');
      params.push(majorId);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);

    await pool.execute(
      `UPDATE Applications SET ${updates.join(', ')} WHERE ApplicationID = ?`,
      params
    );

    // Get updated application
    const [updated] = await pool.execute(
      `SELECT a.ApplicationID as id, a.Status, a.AppliedAt, a.Notes, a.Documents,
             s.StudentID as studentId, s.FullName as studentName, s.Email as studentEmail,
             u.UniversityID as universityId, u.Name as universityName,
             m.MajorID as majorId, m.Name as majorName
       FROM Applications a
       JOIN Students s ON a.StudentID = s.StudentID
       JOIN Universities u ON a.UniversityID = u.UniversityID
       JOIN Majors m ON a.MajorID = m.MajorID
       WHERE a.ApplicationID = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updated[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
});

// Delete application
router.delete('/:id', authenticate, isStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Verify the application belongs to the student
    const [applications] = await pool.execute(
      'SELECT * FROM Applications WHERE ApplicationID = ? AND StudentID = ?',
      [id, studentId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await pool.execute('DELETE FROM Applications WHERE ApplicationID = ?', [id]);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
});

module.exports = router;

