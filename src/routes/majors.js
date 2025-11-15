const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const { logAudit } = require('../middleware/logger');
const router = express.Router();

// Get all majors
router.get('/', authenticate, async (req, res) => {
  try {
    const [majors] = await pool.execute(
      'SELECT MajorID as id, Name, Description FROM Majors ORDER BY Name'
    );

    res.json({
      success: true,
      data: majors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get majors',
      error: error.message
    });
  }
});

// Get major by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [majors] = await pool.execute(
      'SELECT MajorID as id, Name, Description FROM Majors WHERE MajorID = ?',
      [id]
    );

    if (majors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Major not found'
      });
    }

    res.json({
      success: true,
      data: majors[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get major',
      error: error.message
    });
  }
});

// Create major
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Major name is required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO Majors (Name, Description) VALUES (?, ?)',
      [name, description || null]
    );

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'create',
      'major',
      `تم إنشاء تخصص جديد: ${name}`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'Major created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create major',
      error: error.message
    });
  }
});

// Update major
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    await pool.execute(
      'UPDATE Majors SET Name = ?, Description = ? WHERE MajorID = ?',
      [name, description, id]
    );

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'update',
      'major',
      `تم تعديل التخصص (ID: ${id}): ${name}`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'Major updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update major',
      error: error.message
    });
  }
});

// Delete major
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get major name before deletion for audit log
    const [majors] = await pool.execute(
      'SELECT Name FROM Majors WHERE MajorID = ?',
      [id]
    );
    const majorName = majors.length > 0 ? majors[0].Name : 'Unknown';

    await pool.execute('DELETE FROM Majors WHERE MajorID = ?', [id]);

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'delete',
      'major',
      `تم حذف التخصص (ID: ${id}): ${majorName}`,
      ipAddress,
      userAgent,
      'high'
    );

    res.json({
      success: true,
      message: 'Major deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete major',
      error: error.message
    });
  }
});

module.exports = router;

