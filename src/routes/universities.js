/**
 * Universities Routes / مسارات الجامعات
 * This file handles all university-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالجامعات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin, isUniversity } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const { logAudit } = require('../middleware/logger'); // Audit logging function / دالة تسجيل التدقيق
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/universities
 * Get all universities / الحصول على جميع الجامعات
 * Returns a list of all universities with statistics
 * يعيد قائمة بجميع الجامعات مع الإحصائيات
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const [universities] = await pool.execute(
      `SELECT u.UniversityID as id, 
              u.UniversityID as UniversityID,
              u.Name as Name,
              COALESCE(u.EnglishName, u.Name) as EnglishName,
              u.Location as Location,
              u.Location as address,
              COALESCE(u.Email, '') as email,
              COALESCE(u.Phone, '') as phone,
              COALESCE(u.Website, '') as website,
              COALESCE(u.AccountStatus, 'active') as Status,
              COALESCE(u.AccountStatus, 'active') as accountStatus,
              COALESCE(u.ActiveStatus, 'active') as activeStatus,
              COALESCE(COUNT(DISTINCT um.MajorID), 0) as totalMajors,
              COALESCE(COUNT(DISTINCT a.ApplicationID), 0) as totalApplications,
              COALESCE(u.CreatedAt, NOW()) as CreatedAt,
              u.ApprovedAt as approvedAt
       FROM Universities u
       LEFT JOIN UniversityMajors um ON u.UniversityID = um.UniversityID
       LEFT JOIN Applications a ON u.UniversityID = a.UniversityID
       GROUP BY u.UniversityID, u.Name, u.EnglishName, u.Location, u.Email, u.Phone, u.Website, u.AccountStatus, u.ActiveStatus, u.CreatedAt, u.ApprovedAt
       ORDER BY u.UniversityID DESC`
    );

    res.json({
      success: true,
      data: universities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get universities',
      error: error.message
    });
  }
});

// Get university by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [universities] = await pool.execute(
      `SELECT UniversityID as id, 
              UniversityID as UniversityID,
              Name, 
              COALESCE(EnglishName, Name) as EnglishName,
              Location,
              Location as address,
              COALESCE(Email, '') as email,
              COALESCE(Phone, '') as phone,
              COALESCE(Website, '') as website,
              COALESCE(AccountStatus, 'active') as Status,
              COALESCE(AccountStatus, 'active') as accountStatus,
              COALESCE(ActiveStatus, 'active') as activeStatus,
              COALESCE(CreatedAt, NOW()) as CreatedAt,
              ApprovedAt as approvedAt
       FROM Universities 
       WHERE UniversityID = ?`,
      [id]
    );

    if (universities.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    // Get additional stats
    const [majorCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM UniversityMajors WHERE UniversityID = ?',
      [id]
    );
    const [applicationCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM Applications WHERE UniversityID = ?',
      [id]
    );

    const university = {
      ...universities[0],
      totalMajors: majorCount[0]?.count || 0,
      totalApplications: applicationCount[0]?.count || 0
    };

    res.json({
      success: true,
      data: university
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get university',
      error: error.message
    });
  }
});

// Get university majors
router.get('/:id/majors', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [majors] = await pool.execute(
      `SELECT m.MajorID as id, m.Name, m.Description
       FROM Majors m
       JOIN UniversityMajors um ON m.MajorID = um.MajorID
       WHERE um.UniversityID = ?
       ORDER BY m.Name`,
      [id]
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

// Create university (Admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { 
      name, 
      location, 
      englishName, 
      email, 
      phone, 
      website,
      accountStatus,
      activeStatus
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'University name is required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO Universities 
       (Name, Location, EnglishName, Email, Phone, Website, AccountStatus, ActiveStatus, CreatedAt, ApprovedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        name, 
        location || null,
        englishName || null,
        email || null,
        phone || null,
        website || null,
        accountStatus || 'pending',
        activeStatus || 'active',
        accountStatus === 'active' ? NOW() : null
      ]
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
      'university',
      `تم إنشاء جامعة جديدة: ${name}`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create university',
      error: error.message
    });
  }
});

// Update university
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      location, 
      englishName, 
      email, 
      phone, 
      website,
      accountStatus,
      activeStatus
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('Name = ?');
      values.push(name);
    }
    if (location !== undefined) {
      updates.push('Location = ?');
      values.push(location);
    }
    if (englishName !== undefined) {
      updates.push('EnglishName = ?');
      values.push(englishName);
    }
    if (email !== undefined) {
      updates.push('Email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('Phone = ?');
      values.push(phone);
    }
    if (website !== undefined) {
      updates.push('Website = ?');
      values.push(website);
    }
    if (accountStatus !== undefined) {
      updates.push('AccountStatus = ?');
      values.push(accountStatus);
      // If setting to active, update ApprovedAt
      if (accountStatus === 'active') {
        updates.push('ApprovedAt = NOW()');
      }
    }
    if (activeStatus !== undefined) {
      updates.push('ActiveStatus = ?');
      values.push(activeStatus);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    await pool.execute(
      `UPDATE Universities SET ${updates.join(', ')} WHERE UniversityID = ?`,
      values
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
      'university',
      `تم تعديل الجامعة (ID: ${id}): ${name}`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'University updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update university',
      error: error.message
    });
  }
});

// Delete university
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get university name before deletion for audit log
    const [universities] = await pool.execute(
      'SELECT Name FROM Universities WHERE UniversityID = ?',
      [id]
    );
    const universityName = universities.length > 0 ? universities[0].Name : 'Unknown';

    await pool.execute('DELETE FROM Universities WHERE UniversityID = ?', [id]);

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'delete',
      'university',
      `تم حذف الجامعة (ID: ${id}): ${universityName}`,
      ipAddress,
      userAgent,
      'high'
    );

    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete university',
      error: error.message
    });
  }
});

// Add major to university
router.post('/:id/majors', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;
    const { majorId } = req.body;

    if (!majorId) {
      return res.status(400).json({
        success: false,
        message: 'Major ID is required'
      });
    }

    await pool.execute(
      'INSERT INTO UniversityMajors (UniversityID, MajorID) VALUES (?, ?)',
      [id, majorId]
    );

    res.status(201).json({
      success: true,
      message: 'Major added to university successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add major',
      error: error.message
    });
  }
});

// Remove major from university
router.delete('/:id/majors/:majorId', authenticate, isUniversity, async (req, res) => {
  try {
    const { id, majorId } = req.params;

    await pool.execute(
      'DELETE FROM UniversityMajors WHERE UniversityID = ? AND MajorID = ?',
      [id, majorId]
    );

    res.json({
      success: true,
      message: 'Major removed from university successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove major',
      error: error.message
    });
  }
});

// Get university applications
router.get('/:id/applications', authenticate, isUniversity, async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await pool.execute(
      `SELECT a.ApplicationID as id, a.Status, a.AppliedAt, a.Notes,
              s.StudentID as studentId, s.FullName as studentName, s.Email as studentEmail,
              m.MajorID as majorId, m.Name as majorName
       FROM Applications a
       JOIN Students s ON a.StudentID = s.StudentID
       JOIN Majors m ON a.MajorID = m.MajorID
       WHERE a.UniversityID = ?
       ORDER BY a.AppliedAt DESC`,
      [id]
    );

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

// Approve university (Admin only)
router.post('/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE Universities SET AccountStatus = ?, ApprovedAt = NOW() WHERE UniversityID = ?',
      ['active', id]
    );

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'approve',
      'university',
      `تم قبول الجامعة (ID: ${id})`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'University approved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve university',
      error: error.message
    });
  }
});

// Reject university (Admin only)
router.post('/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE Universities SET AccountStatus = ? WHERE UniversityID = ?',
      ['rejected', id]
    );

    // Log audit trail
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'reject',
      'university',
      `تم رفض الجامعة (ID: ${id})`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'University rejected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject university',
      error: error.message
    });
  }
});

module.exports = router;

