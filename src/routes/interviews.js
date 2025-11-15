const express = require('express');
const pool = require('../config/database');
const { authenticate, isUniversity, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get interviews
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT i.*, 
             a.ApplicationID, a.Status as applicationStatus,
             s.StudentID, s.FullName as studentName, s.Email as studentEmail,
             u.UniversityID, u.Name as universityName
      FROM Interviews i
      JOIN Applications a ON i.ApplicationID = a.ApplicationID
      JOIN Students s ON i.StudentID = s.StudentID
      JOIN Universities u ON a.UniversityID = u.UniversityID
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'student') {
      query += ' AND i.StudentID = ?';
      params.push(userId);
    } else if (userRole === 'university') {
      query += ' AND u.UniversityID IN (SELECT UniversityID FROM Teachers WHERE TeacherID = ?)';
      params.push(userId);
    }

    if (status) {
      query += ' AND i.Status = ?';
      params.push(status);
    }

    if (studentId) {
      query += ' AND i.StudentID = ?';
      params.push(studentId);
    }

    query += ' ORDER BY i.InterviewDate, i.InterviewTime';

    const [interviews] = await pool.execute(query, params);

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get interviews',
      error: error.message
    });
  }
});

// Get interview by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [interviews] = await pool.execute(
      `SELECT i.*, 
              a.ApplicationID, a.Status as applicationStatus,
              s.StudentID, s.FullName as studentName, s.Email as studentEmail,
              u.UniversityID, u.Name as universityName
       FROM Interviews i
       JOIN Applications a ON i.ApplicationID = a.ApplicationID
       JOIN Students s ON i.StudentID = s.StudentID
       JOIN Universities u ON a.UniversityID = u.UniversityID
       WHERE i.InterviewID = ?`,
      [id]
    );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      data: interviews[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get interview',
      error: error.message
    });
  }
});

// Schedule interview
router.post('/', authenticate, isUniversity, async (req, res) => {
  try {
    const { applicationId, interviewDate, interviewTime, location, interviewerName } = req.body;
    const userId = req.user.id;

    if (!applicationId || !interviewDate || !interviewTime) {
      return res.status(400).json({
        success: false,
        message: 'Application ID, interview date, and time are required'
      });
    }

    // Get application and verify it belongs to user's university
    const [applications] = await pool.execute(
      `SELECT a.*, u.UniversityID 
       FROM Applications a
       JOIN Universities u ON a.UniversityID = u.UniversityID
       WHERE a.ApplicationID = ?
       AND u.UniversityID IN (SELECT UniversityID FROM Teachers WHERE TeacherID = ?)`,
      [applicationId, userId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = applications[0];

    const [result] = await pool.execute(
      `INSERT INTO Interviews (ApplicationID, StudentID, InterviewDate, InterviewTime, Location, InterviewerID, InterviewerName, Status, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())`,
      [applicationId, application.StudentID, interviewDate, interviewTime, location || null, userId, interviewerName || null]
    );

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// Update interview
router.put('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewDate, interviewTime, location, interviewerName, status, result: interviewResult, notes } = req.body;

    await pool.execute(
      `UPDATE Interviews SET InterviewDate = ?, InterviewTime = ?, Location = ?, 
       InterviewerName = ?, Status = ?, Result = ?, Notes = ?
       WHERE InterviewID = ?`,
      [interviewDate, interviewTime, location, interviewerName, status, interviewResult, notes, id]
    );

    res.json({
      success: true,
      message: 'Interview updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
});

// Cancel interview
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE Interviews SET Status = ? WHERE InterviewID = ?',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'Interview cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel interview',
      error: error.message
    });
  }
});

module.exports = router;

