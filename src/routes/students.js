const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin, isTeacher } = require('../middleware/auth');
const router = express.Router();

// Get all students (with pagination)
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
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

// Get student by ID
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
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student',
      error: error.message
    });
  }
});

// Get student tracking notes
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
    console.error('Get tracking notes error:', error);
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
    console.error('Add tracking note error:', error);
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
    console.error('Get student applications error:', error);
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
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

module.exports = router;

