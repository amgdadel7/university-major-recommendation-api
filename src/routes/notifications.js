/**
 * Notifications Routes / مسارات الإشعارات
 * This file handles all notification-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالإشعارات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate } = require('../middleware/auth'); // Authentication middleware / برمجية المصادقة
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/notifications
 * Get notifications / الحصول على الإشعارات
 * Returns notifications for the authenticated user
 * يعيد الإشعارات للمستخدم المصادق عليه
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { isRead } = req.query;
    const userId = req.user.id;
    const userType = req.user.role === 'admin' ? 'admin' : req.user.role === 'teacher' ? 'teacher' : req.user.role === 'university' ? 'university' : 'student';

    let query = 'SELECT * FROM SystemNotifications WHERE UserID = ? AND UserType = ?';
    const params = [userId, userType];

    if (isRead !== undefined) {
      query += ' AND IsRead = ?';
      params.push(isRead === 'true' ? 1 : 0);
    }

    query += ' ORDER BY CreatedAt DESC LIMIT 50';

    const [notifications] = await pool.execute(query, params);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      'UPDATE SystemNotifications SET IsRead = TRUE WHERE NotificationID = ? AND UserID = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role === 'admin' ? 'admin' : req.user.role === 'teacher' ? 'teacher' : req.user.role === 'university' ? 'university' : 'student';

    await pool.execute(
      'UPDATE SystemNotifications SET IsRead = TRUE WHERE UserID = ? AND UserType = ?',
      [userId, userType]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Create notification (Admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, userType, title, message, notificationType, relatedEntityType, relatedEntityId } = req.body;

    if (!userId || !userType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, user type, title, and message are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO SystemNotifications (UserID, UserType, Title, Message, NotificationType, RelatedEntityType, RelatedEntityID, IsRead, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      [userId, userType, title, message, notificationType || 'info', relatedEntityType || null, relatedEntityId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      'DELETE FROM SystemNotifications WHERE NotificationID = ? AND UserID = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

module.exports = router;

