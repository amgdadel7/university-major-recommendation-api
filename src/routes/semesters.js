const express = require('express');
const pool = require('../config/database');
const { authenticate, isUniversity, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get semesters
router.get('/', authenticate, async (req, res) => {
  try {
    const { universityId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT s.*, 
             u.UniversityID, u.Name as universityName,
             COUNT(DISTINCT a.ApplicationID) as totalApplications,
             COUNT(DISTINCT CASE WHEN a.Status = 'accepted' THEN a.ApplicationID END) as acceptedApplications
      FROM Semesters s
      JOIN Universities u ON s.UniversityID = u.UniversityID
      LEFT JOIN Applications a ON s.UniversityID = a.UniversityID 
        AND a.AppliedAt BETWEEN s.ApplicationStartDate AND s.ApplicationEndDate
      WHERE 1=1
    `;
    const params = [];

    if (universityId) {
      query += ' AND s.UniversityID = ?';
      params.push(universityId);
    } else if (userRole === 'university') {
      // Get university ID from user
      const [teachers] = await pool.execute(
        'SELECT UniversityID FROM Teachers WHERE TeacherID = ?',
        [userId]
      );
      if (teachers.length > 0 && teachers[0].UniversityID) {
        query += ' AND s.UniversityID = ?';
        params.push(teachers[0].UniversityID);
      }
    }

    if (status) {
      query += ' AND s.Status = ?';
      params.push(status);
    }

    query += ' GROUP BY s.SemesterID ORDER BY s.StartDate DESC';

    const [semesters] = await pool.execute(query, params);

    res.json({
      success: true,
      data: semesters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get semesters',
      error: error.message
    });
  }
});

// Get semester by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [semesters] = await pool.execute(
      `SELECT s.*, u.Name as universityName
       FROM Semesters s
       JOIN Universities u ON s.UniversityID = u.UniversityID
       WHERE s.SemesterID = ?`,
      [id]
    );

    if (semesters.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    res.json({
      success: true,
      data: semesters[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get semester',
      error: error.message
    });
  }
});

// Create semester
router.post('/', authenticate, isUniversity, async (req, res) => {
  try {
    const { universityId, name, year, startDate, endDate, applicationStartDate, applicationEndDate } = req.body;
    const userId = req.user.id;

    if (!universityId || !name || !year || !startDate || !endDate || !applicationStartDate || !applicationEndDate) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Verify user belongs to university
    const [teachers] = await pool.execute(
      'SELECT UniversityID FROM Teachers WHERE TeacherID = ?',
      [userId]
    );

    if (teachers.length === 0 || teachers[0].UniversityID !== universityId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO Semesters (UniversityID, Name, Year, StartDate, EndDate, ApplicationStartDate, ApplicationEndDate, Status, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming', NOW())`,
      [universityId, name, year, startDate, endDate, applicationStartDate, applicationEndDate]
    );

    res.status(201).json({
      success: true,
      message: 'Semester created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create semester',
      error: error.message
    });
  }
});

// Update semester
router.put('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, startDate, endDate, applicationStartDate, applicationEndDate, status } = req.body;

    await pool.execute(
      `UPDATE Semesters SET Name = ?, Year = ?, StartDate = ?, EndDate = ?, 
       ApplicationStartDate = ?, ApplicationEndDate = ?, Status = ?
       WHERE SemesterID = ?`,
      [name, year, startDate, endDate, applicationStartDate, applicationEndDate, status, id]
    );

    res.json({
      success: true,
      message: 'Semester updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update semester',
      error: error.message
    });
  }
});

// Delete semester
router.delete('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM Semesters WHERE SemesterID = ?', [id]);

    res.json({
      success: true,
      message: 'Semester deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete semester',
      error: error.message
    });
  }
});

module.exports = router;

