const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin, isUniversity, isStudent } = require('../middleware/auth');
const router = express.Router();

// Get all applications
router.get('/', authenticate, async (req, res) => {
  try {
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

    if (status) {
      query += ' WHERE a.Status = ?';
      params.push(status);
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

