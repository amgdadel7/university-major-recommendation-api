/**
 * Schema Routes / مسارات مخطط قاعدة البيانات
 * This file handles database schema-related API endpoints
 * هذا الملف يتعامل مع نقاط نهاية API المتعلقة بمخطط قاعدة البيانات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/schema/:tableName
 * Get table schema (columns information) / الحصول على مخطط الجدول (معلومات الأعمدة)
 * Returns column information for a specific database table
 * يعيد معلومات الأعمدة لجدول قاعدة بيانات محدد
 */
router.get('/:tableName', authenticate, isAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Sanitize table name to prevent SQL injection
    const allowedTables = [
      'Universities', 'Majors', 'Students', 'Teachers', 'Questions', 
      'Content', 'Permissions', 'Roles', 'Applications', 'Semesters',
      'Interviews', 'CalendarEvents', 'SystemNotifications', 'Reports',
      'Messages', 'Conversations', 'Admins', 'UniversityUsers'
    ];
    
    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid table name'
      });
    }

    // Get column information from INFORMATION_SCHEMA
    const [columns] = await pool.execute(
      `SELECT 
        COLUMN_NAME as name,
        DATA_TYPE as type,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_KEY as key,
        COLUMN_TYPE as fullType,
        EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION`,
      [tableName]
    );

    // Format columns with additional metadata
    const formattedColumns = columns.map(col => {
      // Determine field type based on data type
      let fieldType = 'text';
      if (col.type === 'int' || col.type === 'bigint' || col.type === 'tinyint') {
        fieldType = 'number';
      } else if (col.type === 'datetime' || col.type === 'date' || col.type === 'timestamp') {
        fieldType = 'datetime';
      } else if (col.type === 'time') {
        fieldType = 'time';
      } else if (col.fullType && col.fullType.includes('enum')) {
        // Extract enum values
        const enumMatch = col.fullType.match(/enum\((.+)\)/);
        if (enumMatch) {
          const enumValues = enumMatch[1]
            .replace(/'/g, '')
            .split(',')
            .map(v => v.trim());
          fieldType = 'enum';
          col.enumValues = enumValues;
        }
      } else if (col.type === 'text' || col.type === 'longtext') {
        fieldType = 'textarea';
      } else if (col.type === 'json') {
        fieldType = 'json';
      }

      return {
        name: col.name,
        type: fieldType,
        dataType: col.type,
        nullable: col.nullable === 'YES',
        defaultValue: col.defaultValue,
        isPrimaryKey: col.key === 'PRI',
        isAutoIncrement: col.extra === 'auto_increment',
        fullType: col.fullType,
        enumValues: col.enumValues || null
      };
    });

    res.json({
      success: true,
      data: {
        tableName,
        columns: formattedColumns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get table schema',
      error: error.message
    });
  }
});

// Get all available tables
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const [tables] = await pool.execute(
      `SELECT TABLE_NAME as name
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME`
    );

    res.json({
      success: true,
      data: tables.map(t => t.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get tables',
      error: error.message
    });
  }
});

module.exports = router;

