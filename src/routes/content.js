const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all content
router.get('/', authenticate, async (req, res) => {
  try {
    const { contentType, status } = req.query;

    let query = 'SELECT * FROM Content WHERE 1=1';
    const params = [];

    if (contentType) {
      query += ' AND ContentType = ?';
      params.push(contentType);
    }

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }

    query += ' ORDER BY CreatedAt DESC';

    const [content] = await pool.execute(query, params);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message
    });
  }
});

// Get content by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [content] = await pool.execute(
      'SELECT * FROM Content WHERE ContentID = ?',
      [id]
    );

    if (content.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content[0]
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message
    });
  }
});

// Create content
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { contentType, title, content: contentText, status = 'draft' } = req.body;
    const createdBy = req.user.id;

    if (!contentType || !title || !contentText) {
      return res.status(400).json({
        success: false,
        message: 'Content type, title, and content are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO Content (ContentType, Title, Content, Status, CreatedBy, CreatedAt, UpdatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [contentType, title, contentText, status, createdBy]
    );

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content',
      error: error.message
    });
  }
});

// Update content
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content: contentText, status } = req.body;

    await pool.execute(
      `UPDATE Content SET Title = ?, Content = ?, Status = ?, UpdatedAt = NOW()
       WHERE ContentID = ?`,
      [title, contentText, status, id]
    );

    res.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
});

// Delete content
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM Content WHERE ContentID = ?', [id]);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
});

module.exports = router;

