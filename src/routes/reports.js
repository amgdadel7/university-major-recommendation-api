const express = require('express');
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all reports
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { type, period } = req.query;

    let query = 'SELECT * FROM Reports WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND ReportType = ?';
      params.push(type);
    }

    if (period) {
      query += ' AND Period = ?';
      params.push(period);
    }

    query += ' ORDER BY CreatedAt DESC';

    const [reports] = await pool.execute(query, params);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
});

// Generate report
router.post('/generate', authenticate, isAdmin, async (req, res) => {
  try {
    const { reportName, description, reportType, period, startDate, endDate } = req.body;
    const generatedBy = req.user.id;

    if (!reportName || !reportType || !period) {
      return res.status(400).json({
        success: false,
        message: 'Report name, type, and period are required'
      });
    }

    // Create report record
    const [result] = await pool.execute(
      `INSERT INTO Reports (ReportName, Description, ReportType, Period, StartDate, EndDate, GeneratedBy, GeneratedAt, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [reportName, description || null, reportType, period, startDate || null, endDate || null, generatedBy]
    );

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

// Get report by ID
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [reports] = await pool.execute(
      'SELECT * FROM Reports WHERE ReportID = ?',
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: reports[0]
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get report',
      error: error.message
    });
  }
});

// Update report
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reportName, description, reportType, period, startDate, endDate } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (reportName !== undefined) {
      updates.push('ReportName = ?');
      params.push(reportName);
    }
    if (description !== undefined) {
      updates.push('Description = ?');
      params.push(description);
    }
    if (reportType !== undefined) {
      updates.push('ReportType = ?');
      params.push(reportType);
    }
    if (period !== undefined) {
      updates.push('Period = ?');
      params.push(period);
    }
    if (startDate !== undefined) {
      updates.push('StartDate = ?');
      params.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push('EndDate = ?');
      params.push(endDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Check if report exists
    const [existingReports] = await pool.execute(
      'SELECT * FROM Reports WHERE ReportID = ?',
      [id]
    );

    if (existingReports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    params.push(id);

    const query = `UPDATE Reports SET ${updates.join(', ')} WHERE ReportID = ?`;
    await pool.execute(query, params);

    // Get updated report
    const [updatedReports] = await pool.execute(
      'SELECT * FROM Reports WHERE ReportID = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReports[0]
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
});

// Delete report
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM Reports WHERE ReportID = ?', [id]);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
});

module.exports = router;

