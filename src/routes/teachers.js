/**
 * Teachers Routes / مسارات المعلمين
 * This file handles all teacher-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالمعلمين
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin, isTeacher } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/teachers
 * Get all teachers / الحصول على جميع المعلمين
 * Returns a list of all teachers with their university information
 * يعيد قائمة بجميع المعلمين مع معلومات جامعاتهم
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const [teachers] = await pool.execute(
      `SELECT t.TeacherID as id, t.FullName as name, t.Email, t.Role, 
              t.AccessLevel, t.CreatedAt,
              u.UniversityID as universityId, u.Name as universityName
       FROM Teachers t
       LEFT JOIN Universities u ON t.UniversityID = u.UniversityID
       ORDER BY t.CreatedAt DESC`
    );

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get teachers',
      error: error.message
    });
  }
});

// Get teacher by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [teachers] = await pool.execute(
      `SELECT t.TeacherID as id, t.FullName as name, t.Email, t.Role, 
              t.AccessLevel, t.CreatedAt,
              u.UniversityID as universityId, u.Name as universityName
       FROM Teachers t
       LEFT JOIN Universities u ON t.UniversityID = u.UniversityID
       WHERE t.TeacherID = ?`,
      [id]
    );

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: teachers[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get teacher',
      error: error.message
    });
  }
});

// Get teacher's students
router.get('/:id/students', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await pool.execute(
      `SELECT s.StudentID as id, s.FullName as name, s.Email, s.Age, s.Gender,
              s.CreatedAt, m.AssignedAt
       FROM Students s
       JOIN Monitors m ON s.StudentID = m.StudentID
       WHERE m.TeacherID = ?
       ORDER BY m.AssignedAt DESC`,
      [id]
    );

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

// Assign student to teacher
router.post('/:id/students', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Check if already assigned
    const [existing] = await pool.execute(
      'SELECT * FROM Monitors WHERE TeacherID = ? AND StudentID = ?',
      [id, studentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Student is already assigned to this teacher'
      });
    }

    await pool.execute(
      'INSERT INTO Monitors (TeacherID, StudentID, AssignedAt) VALUES (?, ?, NOW())',
      [id, studentId]
    );

    res.status(201).json({
      success: true,
      message: 'Student assigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign student',
      error: error.message
    });
  }
});

// Unassign student from teacher
router.delete('/:id/students/:studentId', authenticate, isAdmin, async (req, res) => {
  try {
    const { id, studentId } = req.params;

    await pool.execute(
      'DELETE FROM Monitors WHERE TeacherID = ? AND StudentID = ?',
      [id, studentId]
    );

    res.json({
      success: true,
      message: 'Student unassigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unassign student',
      error: error.message
    });
  }
});

module.exports = router;

