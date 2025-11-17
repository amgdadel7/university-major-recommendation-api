/**
 * Admin Routes / مسارات الإدارة
 * This file handles all admin-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالإدارة
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const { invalidateAIConfigCache } = require('../services/deepseek'); // AI config cache invalidation / إبطال التخزين المؤقت لتكوين AI
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/admin/users
 * Get all users (students, teachers, admins) / الحصول على جميع المستخدمين (طلاب، معلمين، مدراء)
 * Returns a combined list of all users from different tables
 * يعيد قائمة مجمعة لجميع المستخدمين من جداول مختلفة
 */
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const [students] = await pool.execute(
      'SELECT StudentID as id, FullName as name, Email, "student" as role, CreatedAt FROM Students'
    );
    const [teachers] = await pool.execute(
      'SELECT TeacherID as id, FullName as name, Email, Role as role, CreatedAt FROM Teachers'
    );
    const [admins] = await pool.execute(
      'SELECT AdminID as id, FullName as name, Email, Role as role, CreatedAt FROM Admins'
    );

    const allUsers = [
      ...students.map(u => ({ ...u, role: 'student' })),
      ...teachers,
      ...admins.map(u => ({ ...u, role: 'admin' }))
    ].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

    res.json({
      success: true,
      data: allUsers
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Get admin statistics
router.get('/statistics', authenticate, isAdmin, async (req, res) => {
  try {
    // Get total counts
    const [studentCount] = await pool.execute('SELECT COUNT(*) as count FROM Students');
    const [teacherCount] = await pool.execute('SELECT COUNT(*) as count FROM Teachers WHERE Role = "teacher"');
    const [universityCount] = await pool.execute('SELECT COUNT(*) as count FROM Universities');
    const [adminCount] = await pool.execute('SELECT COUNT(*) as count FROM Admins');
    const [majorCount] = await pool.execute('SELECT COUNT(*) as count FROM Majors');
    const [applicationCount] = await pool.execute('SELECT COUNT(*) as count FROM Applications');
    
    // Get university status counts
    const [activeUniversities] = await pool.execute(
      'SELECT COUNT(*) as count FROM Universities WHERE AccountStatus = "active" AND ActiveStatus = "active"'
    );
    const [pendingUniversities] = await pool.execute(
      'SELECT COUNT(*) as count FROM Universities WHERE AccountStatus = "pending"'
    );
    const [rejectedUniversities] = await pool.execute(
      'SELECT COUNT(*) as count FROM Universities WHERE AccountStatus = "rejected"'
    );
    
    // Get total university majors count
    const [universityMajorsCount] = await pool.execute(
      'SELECT COUNT(DISTINCT UniversityID) as universitiesWithMajors, COUNT(*) as totalLinks FROM UniversityMajors'
    );
    
    // Get applications by status
    const [pendingApplications] = await pool.execute(
      'SELECT COUNT(*) as count FROM Applications WHERE Status = "pending"'
    );
    const [acceptedApplications] = await pool.execute(
      'SELECT COUNT(*) as count FROM Applications WHERE Status = "accepted"'
    );
    const [rejectedApplications] = await pool.execute(
      'SELECT COUNT(*) as count FROM Applications WHERE Status = "rejected"'
    );

    // Get activity data
    const [activityData] = await pool.execute(
      `SELECT DATE(CreatedAt) as date,
              COUNT(DISTINCT CASE WHEN table_name = 'Students' THEN id END) as users,
              COUNT(DISTINCT CASE WHEN table_name = 'Applications' THEN id END) as applications,
              COUNT(DISTINCT CASE WHEN table_name = 'Recommendations' THEN id END) as recommendations
       FROM (
         SELECT CreatedAt, StudentID as id, 'Students' as table_name FROM Students
         UNION ALL
         SELECT AppliedAt as CreatedAt, ApplicationID as id, 'Applications' as table_name FROM Applications
         UNION ALL
         SELECT GeneratedAt as CreatedAt, RecommendationID as id, 'Recommendations' as table_name FROM Recommendations
       ) as combined
       WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(CreatedAt)
       ORDER BY date`
    );

    // Get users by role
    const usersByRole = [
      { name: 'الطلاب', value: studentCount[0].count, color: '#3b82f6' },
      { name: 'المعلمون', value: teacherCount[0].count, color: '#10b981' },
      { name: 'الجامعات', value: universityCount[0].count, color: '#8b5cf6' },
      { name: 'المدراء', value: adminCount[0].count, color: '#ef4444' }
    ];
    
    // Get universities by status
    const universitiesByStatus = [
      { name: 'نشطة', value: activeUniversities[0].count, color: '#10b981' },
      { name: 'قيد الانتظار', value: pendingUniversities[0].count, color: '#f59e0b' },
      { name: 'مرفوضة', value: rejectedUniversities[0].count, color: '#ef4444' }
    ];
    
    // Get applications by status
    const applicationsByStatus = [
      { name: 'قيد الانتظار', value: pendingApplications[0].count, color: '#f59e0b' },
      { name: 'مقبولة', value: acceptedApplications[0].count, color: '#10b981' },
      { name: 'مرفوضة', value: rejectedApplications[0].count, color: '#ef4444' }
    ];

    res.json({
      success: true,
      data: {
        students: studentCount[0].count,
        teachers: teacherCount[0].count,
        universities: universityCount[0].count,
        admins: adminCount[0].count,
        majors: majorCount[0].count,
        applications: applicationCount[0].count,
        // University status counts
        activeUniversities: activeUniversities[0].count,
        pendingUniversities: pendingUniversities[0].count,
        rejectedUniversities: rejectedUniversities[0].count,
        // University majors info
        universitiesWithMajors: universityMajorsCount[0].universitiesWithMajors || 0,
        totalUniversityMajorLinks: universityMajorsCount[0].totalLinks || 0,
        // Applications by status
        pendingApplications: pendingApplications[0].count,
        acceptedApplications: acceptedApplications[0].count,
        rejectedApplications: rejectedApplications[0].count,
        // Charts data
        activityData,
        usersByRole,
        universitiesByStatus,
        applicationsByStatus
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

// Get audit logs
router.get('/audit-logs', authenticate, isAdmin, async (req, res) => {
  try {
    const { action, entity, severity, limit = 1000, offset = 0 } = req.query;

    // Build query with filters
    let query = 'SELECT LogID, UserID, UserName, Action, Entity, Description, IPAddress, UserAgent, Severity, CreatedAt FROM AuditLogs WHERE 1=1';
    const params = [];

    if (action && action !== 'all') {
      query += ' AND Action = ?';
      params.push(action.toLowerCase());
    }

    if (entity && entity !== 'all') {
      query += ' AND Entity = ?';
      params.push(entity.toLowerCase());
    }

    if (severity && severity !== 'all') {
      query += ' AND Severity = ?';
      params.push(severity.toLowerCase());
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM AuditLogs WHERE 1=1';
    const countParams = [];
    
    if (action && action !== 'all') {
      countQuery += ' AND Action = ?';
      countParams.push(action.toLowerCase());
    }
    if (entity && entity !== 'all') {
      countQuery += ' AND Entity = ?';
      countParams.push(entity.toLowerCase());
    }
    if (severity && severity !== 'all') {
      countQuery += ' AND Severity = ?';
      countParams.push(severity.toLowerCase());
    }

    // Execute count query
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Add ordering and pagination
    query += ' ORDER BY CreatedAt DESC LIMIT ? OFFSET ?';
    const limitValue = Math.min(parseInt(limit) || 1000, 1000); // Max 1000 records
    const offsetValue = parseInt(offset) || 0;
    params.push(limitValue, offsetValue);

    const [logs] = await pool.execute(query, params);

    if (logs.length > 0) {

    } else {

    }

    res.json({
      success: true,
      data: logs || [], // Ensure it's always an array
      pagination: {
        total,
        limit: limitValue,
        offset: offsetValue,
        count: logs.length
      }
    });
  } catch (error) {

    // Check if table exists
    try {
      const [tables] = await pool.execute("SHOW TABLES LIKE 'AuditLogs'");
      if (tables.length === 0) {

        return res.status(500).json({
          success: false,
          message: 'AuditLogs table does not exist. Please run database migrations.',
          error: 'Table not found'
        });
      }
    } catch (tableCheckError) {

    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error.message
    });
  }
});

// Create audit log (for testing or manual logging)
router.post('/audit-logs', authenticate, isAdmin, async (req, res) => {
  try {
    const { userId, userName, action, entity, description, ipAddress, userAgent, severity } = req.body;

    // Use authenticated user if not provided
    const logUserId = userId || req.user.id || req.user.userId;
    const logUserName = userName || req.user.name || req.user.userName || 'Unknown';
    const logIpAddress = ipAddress || req.ip || req.connection.remoteAddress;
    const logUserAgent = userAgent || req.get('user-agent') || '';

    if (!action || !entity) {
      return res.status(400).json({
        success: false,
        message: 'Action and Entity are required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO AuditLogs (UserID, UserName, Action, Entity, Description, IPAddress, UserAgent, Severity, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [logUserId, logUserName, action, entity, description || '', logIpAddress, logUserAgent, severity || 'medium']
    );

    res.json({
      success: true,
      message: 'Audit log created successfully',
      data: {
        logId: result.insertId
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to create audit log',
      error: error.message
    });
  }
});

// ============= AI Settings API =============

// Get AI settings
router.get('/ai-settings', authenticate, isAdmin, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM AISettings WHERE SettingID = 1'
    );

    if (settings.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        apiKey: '',
        provider: 'deepseek',
        model: 'deepseek-chat',
        temperature: 0.7,
        maxTokens: 2000,
        enableAIFeatures: true,
        enableRecommendations: true,
        enableAnalysis: true,
        apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
        requestTimeout: 30
      };

      res.json({
        success: true,
        data: defaultSettings
      });
      return;
    }

    // Decrypt sensitive data if needed (implement proper encryption/decryption)
    const settingsData = settings[0];
    const aiSettings = {
      apiKey: settingsData.ApiKey ? '***ENCRYPTED***' : '', // Don't send actual API key
      provider: settingsData.Provider || 'deepseek',
      model: settingsData.Model || 'deepseek-chat',
      temperature: settingsData.Temperature || 0.7,
      maxTokens: settingsData.MaxTokens || 2000,
      enableAIFeatures: settingsData.EnableAIFeatures === 1,
      enableRecommendations: settingsData.EnableRecommendations === 1,
      enableAnalysis: settingsData.EnableAnalysis === 1,
      apiEndpoint: settingsData.ApiEndpoint || 'https://api.deepseek.com/v1/chat/completions',
      requestTimeout: settingsData.RequestTimeout || 30
    };

    res.json({
      success: true,
      data: aiSettings
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get AI settings',
      error: error.message
    });
  }
});

// Update AI settings
router.put('/ai-settings', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      apiKey,
      provider,
      model,
      temperature,
      maxTokens,
      enableAIFeatures,
      enableRecommendations,
      enableAnalysis,
      apiEndpoint,
      requestTimeout
    } = req.body;

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT SettingID FROM AISettings WHERE SettingID = 1'
    );

    if (existing.length === 0) {
      // Insert new settings
      await pool.execute(
        `INSERT INTO AISettings (
          SettingID, ApiKey, Provider, Model, Temperature, MaxTokens,
          EnableAIFeatures, EnableRecommendations, EnableAnalysis,
          ApiEndpoint, RequestTimeout, UpdatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          1,
          apiKey || null, // Encrypt API key here if needed
          provider || 'deepseek',
          model || 'deepseek-chat',
          temperature || 0.7,
          maxTokens || 2000,
          enableAIFeatures ? 1 : 0,
          enableRecommendations ? 1 : 0,
          enableAnalysis ? 1 : 0,
          apiEndpoint || 'https://api.deepseek.com/v1/chat/completions',
          requestTimeout || 30
        ]
      );
    } else {
      // Update existing settings
      const updateData = {
        Provider: provider || 'deepseek',
        Model: model || 'deepseek-chat',
        Temperature: temperature || 0.7,
        MaxTokens: maxTokens || 2000,
        EnableAIFeatures: enableAIFeatures ? 1 : 0,
        EnableRecommendations: enableRecommendations ? 1 : 0,
        EnableAnalysis: enableAnalysis ? 1 : 0,
        ApiEndpoint: apiEndpoint || 'https://api.deepseek.com/v1/chat/completions',
        RequestTimeout: requestTimeout || 30,
        UpdatedAt: new Date()
      };

      // Only update API key if provided and not masked
      if (apiKey && !apiKey.includes('***')) {
        updateData.ApiKey = apiKey; // Encrypt here if needed
      }

      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);

      await pool.execute(
        `UPDATE AISettings SET ${setClause} WHERE SettingID = 1`,
        values
      );
    }

    invalidateAIConfigCache();

    res.json({
      success: true,
      message: 'AI settings updated successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update AI settings',
      error: error.message
    });
  }
});

// Test AI API connection
router.post('/ai-settings/test-connection', authenticate, isAdmin, async (req, res) => {
  try {
    const { apiKey, provider, apiEndpoint, model, temperature, maxTokens } = req.body;

    if (!apiKey || apiKey.includes('***')) {
      return res.status(400).json({
        success: false,
        message: 'Valid API key is required for testing'
      });
    }

    // For now, simulate connection test - in real implementation, make actual API call
    // This is a placeholder that should be replaced with actual AI provider API calls
    const isValidConnection = apiKey.length > 10; // Basic validation

    if (isValidConnection) {
      res.json({
        success: true,
        message: 'API connection successful',
        data: {
          provider,
          model,
          status: 'connected'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API connection failed. Please check your API key.'
      });
    }
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to test API connection',
      error: error.message
    });
  }
});

// Get AI usage statistics
router.get('/ai-usage-stats', authenticate, isAdmin, async (req, res) => {
  try {
    // Get today's requests
    const [todayStats] = await pool.execute(
      'SELECT COUNT(*) as count FROM AuditLogs WHERE Entity = "ai" AND DATE(CreatedAt) = CURDATE()'
    );

    // Get this month's requests
    const [monthStats] = await pool.execute(
      'SELECT COUNT(*) as count FROM AuditLogs WHERE Entity = "ai" AND YEAR(CreatedAt) = YEAR(CURDATE()) AND MONTH(CreatedAt) = MONTH(CURDATE())'
    );

    // Get average response time (mock data for now)
    const avgResponseTime = 234; // This should be calculated from actual AI API calls

    res.json({
      success: true,
      data: {
        todayRequests: todayStats[0]?.count || 0,
        monthRequests: monthStats[0]?.count || 0,
        avgResponseTime
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get AI usage statistics',
      error: error.message
    });
  }
});

// ============= System Settings API =============

// Get system settings
router.get('/system-settings', authenticate, isAdmin, async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM SystemSettings WHERE SettingID = 1'
    );

    if (settings.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        privacyPolicy: 'We respect your privacy and are committed to protecting your personal data...',
        termsOfService: 'By using this platform, you agree to the following terms...',
        applicationStartDate: '2024-01-01',
        applicationEndDate: '2024-06-30',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'noreply@university.edu',
        emailFrom: 'University Admission System',
        emailEnabled: true,
        platformName: 'University Major Recommendation System',
        platformLogo: '/logo.png',
        primaryColor: '#3B82F6',
        secondaryColor: '#8B5CF6',
        defaultLanguage: 'ar',
        supportedLanguages: ['ar', 'en'],
        timezone: 'Asia/Riyadh',
        enableAIRecommendations: true,
        enableStudentTracking: true,
        enableNotifications: true,
        maintenanceMode: false
      };

      res.json({
        success: true,
        data: defaultSettings
      });
      return;
    }

    const settingsData = settings[0];
    const systemSettings = {
      privacyPolicy: settingsData.PrivacyPolicy || '',
      termsOfService: settingsData.TermsOfService || '',
      applicationStartDate: settingsData.ApplicationStartDate ? settingsData.ApplicationStartDate.toISOString().split('T')[0] : '2024-01-01',
      applicationEndDate: settingsData.ApplicationEndDate ? settingsData.ApplicationEndDate.toISOString().split('T')[0] : '2024-06-30',
      smtpHost: settingsData.SMTPHost || 'smtp.gmail.com',
      smtpPort: settingsData.SMTPPort || 587,
      smtpUser: settingsData.SMTPUser || 'noreply@university.edu',
      emailFrom: settingsData.EmailFrom || 'University Admission System',
      emailEnabled: settingsData.EmailEnabled === 1,
      platformName: settingsData.PlatformName || 'University Major Recommendation System',
      platformLogo: settingsData.PlatformLogo || '/logo.png',
      primaryColor: settingsData.PrimaryColor || '#3B82F6',
      secondaryColor: settingsData.SecondaryColor || '#8B5CF6',
      defaultLanguage: settingsData.DefaultLanguage || 'ar',
      supportedLanguages: settingsData.SupportedLanguages ? settingsData.SupportedLanguages.split(',') : ['ar', 'en'],
      timezone: settingsData.Timezone || 'Asia/Riyadh',
      enableAIRecommendations: settingsData.EnableAIRecommendations === 1,
      enableStudentTracking: settingsData.EnableStudentTracking === 1,
      enableNotifications: settingsData.EnableNotifications === 1,
      maintenanceMode: settingsData.MaintenanceMode === 1
    };

    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to get system settings',
      error: error.message
    });
  }
});

// Update system settings
router.put('/system-settings', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      privacyPolicy,
      termsOfService,
      applicationStartDate,
      applicationEndDate,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      emailFrom,
      emailEnabled,
      platformName,
      platformLogo,
      primaryColor,
      secondaryColor,
      defaultLanguage,
      supportedLanguages,
      timezone,
      enableAIRecommendations,
      enableStudentTracking,
      enableNotifications,
      maintenanceMode
    } = req.body;

    // Check if settings exist
    const [existing] = await pool.execute(
      'SELECT SettingID FROM SystemSettings WHERE SettingID = 1'
    );

    if (existing.length === 0) {
      // Insert new settings
      await pool.execute(
        `INSERT INTO SystemSettings (
          SettingID, PrivacyPolicy, TermsOfService, ApplicationStartDate, ApplicationEndDate,
          SMTPHost, SMTPPort, SMTPUser, SMTPPassword, EmailFrom, EmailEnabled,
          PlatformName, PlatformLogo, PrimaryColor, SecondaryColor,
          DefaultLanguage, SupportedLanguages, Timezone,
          EnableAIRecommendations, EnableStudentTracking, EnableNotifications, MaintenanceMode,
          UpdatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          1,
          privacyPolicy || null,
          termsOfService || null,
          applicationStartDate || null,
          applicationEndDate || null,
          smtpHost || null,
          smtpPort || null,
          smtpUser || null,
          smtpPassword || null, // Should be encrypted in production
          emailFrom || null,
          emailEnabled ? 1 : 0,
          platformName || 'University Major Recommendation System',
          platformLogo || null,
          primaryColor || '#3B82F6',
          secondaryColor || '#8B5CF6',
          defaultLanguage || 'ar',
          Array.isArray(supportedLanguages) ? supportedLanguages.join(',') : (supportedLanguages || 'ar,en'),
          timezone || 'Asia/Riyadh',
          enableAIRecommendations ? 1 : 0,
          enableStudentTracking ? 1 : 0,
          enableNotifications ? 1 : 0,
          maintenanceMode ? 1 : 0
        ]
      );
    } else {
      // Update existing settings
      const updateData = {
        PrivacyPolicy: privacyPolicy,
        TermsOfService: termsOfService,
        ApplicationStartDate: applicationStartDate,
        ApplicationEndDate: applicationEndDate,
        SMTPHost: smtpHost,
        SMTPPort: smtpPort,
        SMTPUser: smtpUser,
        EmailFrom: emailFrom,
        EmailEnabled: emailEnabled ? 1 : 0,
        PlatformName: platformName,
        PlatformLogo: platformLogo,
        PrimaryColor: primaryColor,
        SecondaryColor: secondaryColor,
        DefaultLanguage: defaultLanguage,
        SupportedLanguages: Array.isArray(supportedLanguages) ? supportedLanguages.join(',') : supportedLanguages,
        Timezone: timezone,
        EnableAIRecommendations: enableAIRecommendations ? 1 : 0,
        EnableStudentTracking: enableStudentTracking ? 1 : 0,
        EnableNotifications: enableNotifications ? 1 : 0,
        MaintenanceMode: maintenanceMode ? 1 : 0,
        UpdatedAt: new Date()
      };

      // Only update password if provided
      if (smtpPassword && smtpPassword !== '***ENCRYPTED***') {
        updateData.SMTPPassword = smtpPassword; // Should be encrypted in production
      }

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });

      if (Object.keys(updateData).length > 0) {
        const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);

        await pool.execute(
          `UPDATE SystemSettings SET ${setClause} WHERE SettingID = 1`,
          values
        );
      }
    }

    res.json({
      success: true,
      message: 'System settings updated successfully'
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
});

module.exports = router;

