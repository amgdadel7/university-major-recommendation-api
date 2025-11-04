const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: الحصول على التوصيات للمستخدم الحالي
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة التوصيات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
// Get recommendations for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    let recommendations = [];

    if (role === 'student') {
      // Get recommendations for student
      const [studentRecommendations] = await pool.execute(
        `SELECT r.RecommendationID as id, r.GeneratedAt, r.RecommendationText, 
                r.ConfidenceScore, r.Feedback, r.BiasDetected, r.ModelVersion,
                m.MajorID as majorId, m.Name as majorName, m.Description as majorDescription,
                u.Name as universityName, u.UniversityID as universityId
         FROM Recommendations r
         JOIN Majors m ON r.MajorID = m.MajorID
         LEFT JOIN UniversityMajors um ON m.MajorID = um.MajorID
         LEFT JOIN Universities u ON um.UniversityID = u.UniversityID
         WHERE r.StudentID = ?
         ORDER BY r.GeneratedAt DESC`,
        [id]
      );
      recommendations = studentRecommendations;
    } else if (role === 'teacher') {
      // Teachers can see recommendations for their students
      // Get all students for this teacher
      const [teacherStudents] = await pool.execute(
        'SELECT StudentID FROM Students WHERE TeacherID = ?',
        [id]
      );
      
      if (teacherStudents.length > 0) {
        const studentIds = teacherStudents.map(s => s.StudentID);
        const placeholders = studentIds.map(() => '?').join(',');
        
        const [teacherRecommendations] = await pool.execute(
          `SELECT r.RecommendationID as id, r.GeneratedAt, r.RecommendationText, 
                  r.ConfidenceScore, r.Feedback, r.BiasDetected, r.ModelVersion,
                  m.MajorID as majorId, m.Name as majorName, m.Description as majorDescription,
                  u.Name as universityName, u.UniversityID as universityId,
                  s.FullName as studentName, s.StudentID as studentId
           FROM Recommendations r
           JOIN Majors m ON r.MajorID = m.MajorID
           LEFT JOIN UniversityMajors um ON m.MajorID = um.MajorID
           LEFT JOIN Universities u ON um.UniversityID = u.UniversityID
           JOIN Students s ON r.StudentID = s.StudentID
           WHERE r.StudentID IN (${placeholders})
           ORDER BY r.GeneratedAt DESC`,
          studentIds
        );
        recommendations = teacherRecommendations;
      }
    } else if (role === 'admin') {
      // Admins can see all recommendations
      const [adminRecommendations] = await pool.execute(
        `SELECT r.RecommendationID as id, r.GeneratedAt, r.RecommendationText, 
                r.ConfidenceScore, r.Feedback, r.BiasDetected, r.ModelVersion,
                m.MajorID as majorId, m.Name as majorName, m.Description as majorDescription,
                u.Name as universityName, u.UniversityID as universityId,
                s.FullName as studentName, s.StudentID as studentId
         FROM Recommendations r
         JOIN Majors m ON r.MajorID = m.MajorID
         LEFT JOIN UniversityMajors um ON m.MajorID = um.MajorID
         LEFT JOIN Universities u ON um.UniversityID = u.UniversityID
         LEFT JOIN Students s ON r.StudentID = s.StudentID
         ORDER BY r.GeneratedAt DESC
         LIMIT 100`,
        []
      );
      recommendations = adminRecommendations;
    }

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

module.exports = router;

