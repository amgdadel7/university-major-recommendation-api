const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all backups
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM BackupRecords WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND Status = ?';
      params.push(status);
    }

    query += ' ORDER BY CreatedAt DESC';

    const [backups] = await pool.execute(query, params);

    res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backups',
      error: error.message
    });
  }
});

// Create backup
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { backupType = 'manual' } = req.body;
    const createdBy = req.user.id;

    // Create backup record (in real app, you would create actual backup file)
    const fileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.sql`;
    const filePath = `/backups/${fileName}`;

    const [result] = await pool.execute(
      `INSERT INTO BackupRecords (BackupType, FilePath, Status, CreatedBy, CreatedAt)
       VALUES (?, ?, 'in-progress', ?, NOW())`,
      [backupType, filePath, createdBy]
    );

    // Simulate backup process (in real app, run actual backup)
    setTimeout(async () => {
      try {
        await pool.execute(
          'UPDATE BackupRecords SET Status = ?, FileSize = ?, CompletedAt = NOW() WHERE BackupID = ?',
          ['success', 2500000000, result.insertId] // 2.5 GB
        );
      } catch (error) {
        console.error('Update backup status error:', error);
      }
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'Backup created successfully',
      data: {
        id: result.insertId,
        filePath
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: error.message
    });
  }
});

// Get backup by ID
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [backups] = await pool.execute(
      'SELECT * FROM BackupRecords WHERE BackupID = ?',
      [id]
    );

    if (backups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    res.json({
      success: true,
      data: backups[0]
    });
  } catch (error) {
    console.error('Get backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup',
      error: error.message
    });
  }
});

// Restore backup (simplified - in real app, this would restore database)
router.post('/:id/restore', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [backups] = await pool.execute(
      'SELECT * FROM BackupRecords WHERE BackupID = ? AND Status = ?',
      [id, 'success']
    );

    if (backups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found or not completed'
      });
    }

    // In real app, restore database from backup file
    // For now, just return success

    res.json({
      success: true,
      message: 'Backup restored successfully'
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore backup',
      error: error.message
    });
  }
});

// Delete backup
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM BackupRecords WHERE BackupID = ?', [id]);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup',
      error: error.message
    });
  }
});

module.exports = router;

