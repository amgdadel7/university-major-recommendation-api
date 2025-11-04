const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Get calendar events
router.get('/', authenticate, async (req, res) => {
  try {
    const { userId, userType, startDate, endDate } = req.query;
    const currentUserId = req.user.id;
    const currentUserType = req.user.role;

    let query = 'SELECT * FROM CalendarEvents WHERE 1=1';
    const params = [];

    // If userId and userType are provided, use them; otherwise use current user
    const targetUserId = userId || currentUserId;
    const targetUserType = userType || (currentUserType === 'admin' ? 'admin' : currentUserType === 'teacher' ? 'teacher' : 'university');

    query += ' AND UserID = ? AND UserType = ?';
    params.push(targetUserId, targetUserType);

    if (startDate) {
      query += ' AND EventDate >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND EventDate <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY EventDate, EventTime';

    const [events] = await pool.execute(query, params);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar events',
      error: error.message
    });
  }
});

// Create calendar event
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, eventType, reminder, relatedStudentId } = req.body;
    const userId = req.user.id;
    const userType = req.user.role === 'admin' ? 'admin' : req.user.role === 'teacher' ? 'teacher' : 'university';

    if (!title || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and event date are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO CalendarEvents (UserID, UserType, Title, Description, EventDate, EventTime, EventType, Reminder, RelatedStudentID, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, userType, title, description || null, eventDate, eventTime || null, eventType || 'other', reminder || false, relatedStudentId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create calendar event',
      error: error.message
    });
  }
});

// Update calendar event
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eventDate, eventTime, eventType, reminder } = req.body;
    const userId = req.user.id;

    // Verify event belongs to user
    const [events] = await pool.execute(
      'SELECT * FROM CalendarEvents WHERE EventID = ? AND UserID = ?',
      [id, userId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await pool.execute(
      `UPDATE CalendarEvents SET Title = ?, Description = ?, EventDate = ?, EventTime = ?, EventType = ?, Reminder = ?
       WHERE EventID = ? AND UserID = ?`,
      [title, description, eventDate, eventTime, eventType, reminder, id, userId]
    );

    res.json({
      success: true,
      message: 'Calendar event updated successfully'
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update calendar event',
      error: error.message
    });
  }
});

// Delete calendar event
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM CalendarEvents WHERE EventID = ? AND UserID = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete calendar event',
      error: error.message
    });
  }
});

module.exports = router;

