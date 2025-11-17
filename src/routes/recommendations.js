/**
 * Recommendations Routes / مسارات التوصيات
 * This file handles all recommendation-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالتوصيات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { logAudit } = require('../middleware/logger'); // Audit logging function / دالة تسجيل التدقيق
const { generateRecommendations, isConfigured, getAIConfig } = require('../services/deepseek'); // AI recommendation services / خدمات توصيات AI
const { authenticate } = require('../middleware/auth'); // Authentication middleware / برمجية المصادقة
const router = express.Router(); // Express router instance / مثيل موجه Express

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
// الحصول على التوصيات للمستخدم الحالي
router.get('/', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    let recommendations = [];

    if (role === 'student') {
      // Get StudentID from Students table to ensure we have the correct ID
      // الحصول على StudentID من جدول Students للتأكد من أن لدينا المعرف الصحيح
      const [studentRows] = await pool.execute(
        'SELECT StudentID FROM Students WHERE StudentID = ?',
        [id]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      const studentId = studentRows[0].StudentID;

      // Get recommendations for student - filter by StudentID
      // الحصول على التوصيات للطالب - التصفية حسب StudentID
      const [studentRecommendations] = await pool.execute(
        `SELECT r.RecommendationID as id, r.StudentID as studentId, r.GeneratedAt, r.RecommendationText, 
                r.ConfidenceScore, r.Feedback, r.BiasDetected, r.ModelVersion,
                m.MajorID as majorId, m.Name as majorName, m.Description as majorDescription,
                u.Name as universityName, u.UniversityID as universityId
         FROM Recommendations r
         JOIN Majors m ON r.MajorID = m.MajorID
         LEFT JOIN UniversityMajors um ON m.MajorID = um.MajorID
         LEFT JOIN Universities u ON um.UniversityID = u.UniversityID
         WHERE r.StudentID = ?
         ORDER BY r.GeneratedAt DESC`,
        [studentId]
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

    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// Generate recommendations via DeepSeek
router.post('/generate', authenticate, async (req, res) => {
  try {
    const aiConfig = await getAIConfig();

    if (!(await isConfigured({ config: aiConfig }))) {
      let message = 'DeepSeek integration is not configured. Please update AI settings.';

      if (!aiConfig.apiKey) {
        message =
          'DeepSeek integration is not configured. يرجى إضافة مفتاح API في إعدادات الذكاء الاصطناعي.';
      } else if (!aiConfig.enableAIFeatures) {
        message = 'تم تعطيل ميزات الذكاء الاصطناعي من قبل المسؤول.';
      } else if (!aiConfig.enableRecommendations) {
        message = 'تم تعطيل توصيات الذكاء الاصطناعي من قبل المسؤول.';
      }

      return res.status(503).json({
        success: false,
        message
      });
    }

    const { studentId: requestedStudentId, additionalContext } = req.body || {};
    let targetStudentId = requestedStudentId;

    if (!targetStudentId) {
      targetStudentId = req.user.id;
    }

    if (req.user.role === 'student' && targetStudentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Students can only generate recommendations for their own profile'
      });
    }

    // Validate student exists
    const [studentRows] = await pool.execute(
      `SELECT StudentID, FullName, Email, Age, Gender, AcademicData, Preferences
       FROM Students WHERE StudentID = ?`,
      [targetStudentId]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const student = studentRows[0];
    let academicRecords = [];
    let extraPreferences = {};

    if (student.AcademicData) {
      try {
        const parsed = JSON.parse(student.AcademicData);
        if (Array.isArray(parsed)) {
          academicRecords = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          academicRecords = parsed.courses || parsed.subjects || [];
          extraPreferences = parsed.preferences || {};
        }
      } catch (error) {

      }
    }

    if (student.Preferences) {
      try {
        const parsed = JSON.parse(student.Preferences);
        if (typeof parsed === 'object' && parsed !== null) {
          extraPreferences = { ...extraPreferences, ...parsed };
        }
      } catch (error) {

      }
    }

    const [answerRows] = await pool.execute(
      `SELECT q.QuestionID, q.Text, q.Type, q.Category, a.Answer
       FROM Answers a
       JOIN Questions q ON a.QuestionID = q.QuestionID
       WHERE a.StudentID = ?
       ORDER BY q.Type, q.QuestionID`,
      [targetStudentId]
    );

    const [majorRows] = await pool.execute(
      `SELECT DISTINCT m.MajorID, m.Name, COALESCE(m.Description, '') AS Description
       FROM Majors m
       ORDER BY m.Name`
    );

    if (majorRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No majors are registered in the system to recommend from'
      });
    }

    const promptMessages = [
      {
        role: 'user',
        content:
          'حلل بيانات الطالب التالية واقترح أفضل ثلاثة تخصصات جامعية من القائمة المتاحة. قدم توصية موجزة وواضحة باللغة العربية، ودرجة ثقة لكل تخصص بين 0 و100.'
      },
      {
        role: 'user',
        content: JSON.stringify(
          {
            student: {
              id: student.StudentID,
              name: student.FullName,
              age: student.Age,
              gender: student.Gender,
              academicRecords,
              preferences: extraPreferences,
              additionalContext: additionalContext || null
            },
            surveyAnswers: answerRows.map((answer) => ({
              questionId: answer.QuestionID,
              question: answer.Text,
              type: answer.Type,
              category: answer.Category,
              answer: answer.Answer
            })),
            availableMajors: majorRows.map((major) => ({
              id: major.MajorID,
              name: major.Name,
              description: major.Description
            }))
          },
          null,
          2
        )
      }
    ];

    const aiResponse = await generateRecommendations(promptMessages, { config: aiConfig });
    const recommendations = Array.isArray(aiResponse?.recommendations)
      ? aiResponse.recommendations
      : [];

    if (recommendations.length === 0) {
      return res.status(502).json({
        success: false,
        message: 'لم يتمكن نموذج الذكاء الاصطناعي من إرجاع توصيات قابلة للاستخدام'
      });
    }

    const modelVersion = `${aiConfig.provider || 'deepseek'}:${aiConfig.model || 'deepseek-chat'}`;
    const insertedRecommendations = [];
    const majorNameLookup = new Map(
      majorRows.map((major) => [major.Name.toLowerCase(), major])
    );

    for (const recommendation of recommendations) {
      if (!recommendation?.majorName) {
        continue;
      }

      const matchedMajor =
        majorNameLookup.get(recommendation.majorName.toLowerCase()) ||
        majorRows.find(
          (major) =>
            major.Name.toLowerCase().includes(recommendation.majorName.toLowerCase()) ||
            recommendation.majorName.toLowerCase().includes(major.Name.toLowerCase())
        );

      if (!matchedMajor) {
        continue;
      }

      const confidence =
        typeof recommendation.confidence === 'number'
          ? Math.max(0, Math.min(100, recommendation.confidence))
          : 0;

      const confidenceScore = confidence > 1 ? confidence / 100 : confidence;

      const [insertResult] = await pool.execute(
        `INSERT INTO Recommendations (
            StudentID, MajorID, GeneratedAt, RecommendationText,
            ConfidenceScore, Feedback, BiasDetected, ModelVersion
         ) VALUES (?, ?, NOW(), ?, ?, NULL, FALSE, ?)`,
        [
          student.StudentID,
          matchedMajor.MajorID,
          recommendation.reason || recommendation.analysis || '',
          confidenceScore,
          modelVersion
        ]
      );

      insertedRecommendations.push({
        id: insertResult.insertId,
        studentId: student.StudentID,
        majorId: matchedMajor.MajorID,
        majorName: matchedMajor.Name,
        confidence: confidenceScore,
        reasoning: recommendation.reason || recommendation.analysis || '',
        modelVersion
      });
    }

    if (insertedRecommendations.length === 0) {
      return res.status(502).json({
        success: false,
        message:
          'تعذر مطابقة توصيات الذكاء الاصطناعي مع التخصصات المتاحة في قاعدة البيانات'
      });
    }

    await logAudit(
      req.user.id || req.user.userId,
      req.user.name || req.user.userName || 'Unknown',
      'create',
      'ai_recommendation',
      `تم إنشاء ${insertedRecommendations.length} توصية بواسطة DeepSeek للطالب ${student.FullName}`,
      req.ip || req.connection?.remoteAddress || '',
      req.get('user-agent') || '',
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء التوصيات بنجاح',
      data: {
        recommendations: insertedRecommendations,
        analysisSummary: aiResponse.analysisSummary || null
      }
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

module.exports = router;

