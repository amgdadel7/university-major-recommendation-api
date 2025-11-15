const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { authenticate, isUniversity, isAdmin } = require('../middleware/auth');
const { logAudit } = require('../middleware/logger');
const router = express.Router();

// Get all university users (for the logged-in university)
router.get('/', authenticate, isUniversity, async (req, res) => {
  try {
    const universityId = req.user.UniversityID || req.user.universityId;

    if (!universityId) {
      return res.status(403).json({
        success: false,
        message: 'University ID not found'
      });
    }

    const [users] = await pool.execute(
      `SELECT UserID as id, FullName as name, Email, Role, Position, 
              Phone, IsActive, IsMainAdmin, CreatedAt, LastLoginAt
       FROM UniversityUsers 
       WHERE UniversityID = ?
       ORDER BY IsMainAdmin DESC, CreatedAt DESC`,
      [universityId]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get university users',
      error: error.message
    });
  }
});

// Get university user by ID
router.get('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = req.user.UniversityID || req.user.universityId;

    const [users] = await pool.execute(
      `SELECT UserID as id, FullName as name, Email, Role, Position, 
              Phone, IsActive, IsMainAdmin, CreatedAt, LastLoginAt
       FROM UniversityUsers 
       WHERE UserID = ? AND UniversityID = ?`,
      [id, universityId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get university user',
      error: error.message
    });
  }
});

// Create university user
router.post('/', authenticate, isUniversity, async (req, res) => {
  try {
    const { fullName, email, password, role, position, phone } = req.body;
    const universityId = req.user.UniversityID || req.user.universityId;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT Email FROM UniversityUsers WHERE Email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO UniversityUsers 
       (UniversityID, FullName, Email, PasswordHash, Role, Position, Phone, IsActive, IsMainAdmin, CreatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, NOW())`,
      [
        universityId,
        fullName,
        email,
        passwordHash,
        role || 'university_staff',
        position || null,
        phone || null
      ]
    );

    // Log audit
    const userId = req.user?.id || req.user?.userId || 0;
    const userName = req.user?.name || req.user?.userName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'create',
      'university_user',
      `تم إنشاء مستخدم جامعة جديد: ${fullName}`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'University user created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create university user',
      error: error.message
    });
  }
});

// Update university user
router.put('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role, position, phone, isActive } = req.body;
    const universityId = req.user.UniversityID || req.user.universityId;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (fullName !== undefined) {
      updates.push('FullName = ?');
      values.push(fullName);
    }
    if (email !== undefined) {
      updates.push('Email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('Role = ?');
      values.push(role);
    }
    if (position !== undefined) {
      updates.push('Position = ?');
      values.push(position);
    }
    if (phone !== undefined) {
      updates.push('Phone = ?');
      values.push(phone);
    }
    if (isActive !== undefined) {
      updates.push('IsActive = ?');
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id, universityId);

    await pool.execute(
      `UPDATE UniversityUsers SET ${updates.join(', ')} 
       WHERE UserID = ? AND UniversityID = ?`,
      values
    );

    // Log audit
    const userId = req.user?.id || req.user?.userId || 0;
    const userName = req.user?.name || req.user?.userName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'update',
      'university_user',
      `تم تعديل مستخدم الجامعة (ID: ${id})`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'University user updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update university user',
      error: error.message
    });
  }
});

// Update user password
router.put('/:id/password', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const universityId = req.user.UniversityID || req.user.universityId;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // If password is provided, verify it (for non-main-admin users)
    if (password) {
      const [users] = await pool.execute(
        'SELECT PasswordHash FROM UniversityUsers WHERE UserID = ? AND UniversityID = ?',
        [id, universityId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isValid = await bcrypt.compare(password, users[0].PasswordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      'UPDATE UniversityUsers SET PasswordHash = ? WHERE UserID = ? AND UniversityID = ?',
      [passwordHash, id, universityId]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

// Delete university user
router.delete('/:id', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = req.user.UniversityID || req.user.universityId;

    // Prevent deleting main admin
    const [users] = await pool.execute(
      'SELECT IsMainAdmin, FullName FROM UniversityUsers WHERE UserID = ? AND UniversityID = ?',
      [id, universityId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (users[0].IsMainAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete main admin user'
      });
    }

    await pool.execute(
      'DELETE FROM UniversityUsers WHERE UserID = ? AND UniversityID = ?',
      [id, universityId]
    );

    // Log audit
    const userId = req.user?.id || req.user?.userId || 0;
    const userName = req.user?.name || req.user?.userName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'delete',
      'university_user',
      `تم حذف مستخدم الجامعة (ID: ${id}): ${users[0].FullName}`,
      ipAddress,
      userAgent,
      'high'
    );

    res.json({
      success: true,
      message: 'University user deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete university user',
      error: error.message
    });
  }
});

module.exports = router;

