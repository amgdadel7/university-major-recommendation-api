/**
 * Dashboard Routes / مسارات لوحة التحكم
 * This file handles all dashboard-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بلوحة التحكم
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate } = require('../middleware/auth'); // Authentication middleware / برمجية المصادقة
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * @swagger
 * /api/v1/dashboard/stats:
 *   get:
 *     summary: الحصول على إحصائيات لوحة التحكم
 *     description: يعيد جميع الإحصائيات اللازمة لعرض لوحة التحكم الرئيسية
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: الإحصائيات تم جلبها بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: integer
 *                       example: 150
 *                     teachers:
 *                       type: integer
 *                       example: 25
 *                     universities:
 *                       type: integer
 *                       example: 8
 *                     majors:
 *                       type: integer
 *                       example: 50
 *                     applications:
 *                       type: integer
 *                       example: 320
 *                     activityData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           users:
 *                             type: integer
 *                           applications:
 *                             type: integer
 *                           recommendations:
 *                             type: integer
 *                     usersByRole:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           value:
 *                             type: integer
 *                           color:
 *                             type: string
 *                     recommendationsByMonth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           recommendations:
 *                             type: integer
 *                           accuracy:
 *                             type: integer
 *       401:
 *         description: غير مصرح
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    // Get total counts
    const [studentCount] = await pool.execute('SELECT COUNT(*) as count FROM Students');
    const [teacherCount] = await pool.execute('SELECT COUNT(*) as count FROM Teachers WHERE Role = "teacher"');
    const [universityCount] = await pool.execute('SELECT COUNT(*) as count FROM Universities');
    const [majorCount] = await pool.execute('SELECT COUNT(*) as count FROM Majors');
    const [applicationCount] = await pool.execute('SELECT COUNT(*) as count FROM Applications');

    // Get activity data (last 30 days)
    const [activityData] = await pool.execute(
      `SELECT DATE(CreatedAt) as date,
              COUNT(DISTINCT StudentID) as users,
              COUNT(DISTINCT ApplicationID) as applications,
              COUNT(DISTINCT RecommendationID) as recommendations
       FROM (
         SELECT CreatedAt, StudentID, NULL as ApplicationID, NULL as RecommendationID FROM Students
         UNION ALL
         SELECT AppliedAt as CreatedAt, StudentID, ApplicationID, NULL FROM Applications
         UNION ALL
         SELECT GeneratedAt as CreatedAt, StudentID, NULL, RecommendationID FROM Recommendations
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
      { name: 'المدراء', value: (await pool.execute('SELECT COUNT(*) as count FROM Admins'))[0][0].count, color: '#ef4444' }
    ];

    // Get recommendations by month
    const [recommendationsByMonth] = await pool.execute(
      `SELECT DATE_FORMAT(GeneratedAt, '%Y-%m') as month,
              COUNT(*) as recommendations,
              AVG(ConfidenceScore) as accuracy
       FROM Recommendations
       WHERE GeneratedAt >= DATE_SUB(NOW(), INTERVAL 5 MONTH)
       GROUP BY DATE_FORMAT(GeneratedAt, '%Y-%m')
       ORDER BY month`
    );

    res.json({
      success: true,
      data: {
        students: studentCount[0].count,
        teachers: teacherCount[0].count,
        universities: universityCount[0].count,
        majors: majorCount[0].count,
        applications: applicationCount[0].count,
        activityData,
        usersByRole,
        recommendationsByMonth: recommendationsByMonth.map(r => ({
          month: r.month,
          recommendations: r.recommendations,
          accuracy: Math.round(r.accuracy || 0)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router;

