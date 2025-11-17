/**
 * Survey Routes / مسارات الاستبيانات
 * This file handles all survey-related API endpoints
 * هذا الملف يتعامل مع جميع نقاط نهاية API المتعلقة بالاستبيانات
 */

const express = require('express');
const pool = require('../config/database'); // Database connection pool / مجموعة اتصالات قاعدة البيانات
const { authenticate, isAdmin } = require('../middleware/auth'); // Authentication and authorization middleware / برمجيات المصادقة والتفويض
const router = express.Router(); // Express router instance / مثيل موجه Express

/**
 * GET /api/v1/survey
 * Survey API info endpoint / نقطة نهاية معلومات API الاستبيان
 * Returns available survey endpoints
 * يعيد نقاط نهاية الاستبيان المتاحة
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Survey API',
    endpoints: {
      questions: '/survey/questions',
      submit: '/survey/submit',
      myAnswers: '/survey/my-answers'
    }
  });
});

// Get survey questions
router.get('/questions', authenticate, async (req, res) => {
  try {
    const { type, category } = req.query;

    let query = `SELECT QuestionID as id, 
                        QuestionID as QuestionID,
                        Text as question, 
                        Text as Question,
                        Category, 
                        Type,
                        Type as type
                 FROM Questions WHERE 1=1`;
    const params = [];

    if (type) {
      // Normalize type: handle both 'learning-style' and 'learning_style' formats
      const normalizedType = type.replace('-', '_');
      const normalizedType2 = type.replace('_', '-');
      query += ' AND (Type = ? OR Type = ? OR Type = ?)';
      params.push(type, normalizedType, normalizedType2);
    }

    if (category) {
      query += ' AND Category = ?';
      params.push(category);
    }

    query += ' ORDER BY Category, QuestionID';

    const [questions] = await pool.execute(query, params);

    // Map questions to include options (empty array for now, as Options column doesn't exist in DB)
    // In future, if Options column is added, we can parse it here
    const questionsWithOptions = questions.map(q => ({
      ...q,
      QuestionID: q.id || q.QuestionID,
      Text: q.question || q.Question,
      Question: q.question || q.Question,
      Type: q.Type || q.type || 'interests',
      Category: q.Category || q.category || '',
      // Options are stored in Answers table for now, or can be empty
      Options: [],
      options: []
    }));

    res.json({
      success: true,
      data: questionsWithOptions,
      count: questionsWithOptions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
      error: error.message
    });
  }
});

// Get question by ID
router.get('/questions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const [questions] = await pool.execute(
      `SELECT QuestionID as id, 
              QuestionID as QuestionID,
              Text as question, 
              Text as Question,
              Category, 
              Type,
              Type as type
       FROM Questions WHERE QuestionID = ?`,
      [id]
    );

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const question = {
      ...questions[0],
      Options: [],
      options: []
    };

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get question',
      error: error.message
    });
  }
});

// Create question
router.post('/questions', authenticate, isAdmin, async (req, res) => {
  try {
    const { question, category, type } = req.body;

    if (!question || !type) {
      return res.status(400).json({
        success: false,
        message: 'Question text and type are required'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO Questions (Text, Category, Type) VALUES (?, ?, ?)',
      [question, category || null, type]
    );

    // Log audit trail
    const { logAudit } = require('../middleware/logger');
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'create',
      'question',
      `تم إنشاء سؤال جديد (Type: ${type})`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
});

// Update question
router.put('/questions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, category, type } = req.body;

    await pool.execute(
      'UPDATE Questions SET Text = ?, Category = ?, Type = ? WHERE QuestionID = ?',
      [question, category, type, id]
    );

    // Log audit trail
    const { logAudit } = require('../middleware/logger');
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'update',
      'question',
      `تم تعديل السؤال (ID: ${id})`,
      ipAddress,
      userAgent,
      'medium'
    );

    res.json({
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update question',
      error: error.message
    });
  }
});

// Delete question
router.delete('/questions/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get question text before deletion for audit log
    const [questions] = await pool.execute(
      'SELECT Text, Type FROM Questions WHERE QuestionID = ?',
      [id]
    );
    const questionText = questions.length > 0 ? questions[0].Text?.substring(0, 50) : 'Unknown';

    await pool.execute('DELETE FROM Questions WHERE QuestionID = ?', [id]);

    // Log audit trail
    const { logAudit } = require('../middleware/logger');
    const userId = req.user?.id || req.user?.userId || req.user?.AdminID || 0;
    const userName = req.user?.name || req.user?.userName || req.user?.FullName || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    await logAudit(
      userId,
      userName,
      'delete',
      'question',
      `تم حذف السؤال (ID: ${id}): ${questionText}`,
      ipAddress,
      userAgent,
      'high'
    );

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete question',
      error: error.message
    });
  }
});

// Helper function to check if all surveys are complete
async function checkAllSurveysComplete(studentId) {
  try {
    // Get all distinct survey types
    const [types] = await pool.execute(
      'SELECT DISTINCT Type FROM Questions'
    );

    if (types.length === 0) {
      return { complete: false, missingTypes: [] };
    }

    const surveyTypes = types.map(t => t.Type);
    const missingTypes = [];

    // Check if student has answered at least one question from each type
    for (const type of surveyTypes) {
      const [answers] = await pool.execute(
        `SELECT COUNT(*) as count 
         FROM Answers a
         JOIN Questions q ON a.QuestionID = q.QuestionID
         WHERE a.StudentID = ? AND q.Type = ?`,
        [studentId, type]
      );

      if (answers[0].count === 0) {
        missingTypes.push(type);
      }
    }

    return {
      complete: missingTypes.length === 0,
      missingTypes
    };
  } catch (error) {
    console.error('Error checking survey completion:', error);
    return { complete: false, missingTypes: [], error: error.message };
  }
}

// Submit survey answers
router.post('/submit', authenticate, async (req, res) => {
  try {
    const { answers } = req.body;
    const studentId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Insert or update answers
    for (const answer of answers) {
      const { questionId, answer: answerText } = answer;

      if (!questionId || !answerText) {
        continue; // Skip invalid answers
      }

      await pool.execute(
        `INSERT INTO Answers (StudentID, QuestionID, Answer) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE Answer = ?`,
        [studentId, questionId, answerText, answerText]
      );
    }

    // Check if all surveys are complete
    const completionCheck = await checkAllSurveysComplete(studentId);
    
    const response = {
      success: true,
      message: 'Survey answers submitted successfully',
      allSurveysComplete: completionCheck.complete
    };

    // If all surveys are complete, trigger recommendation generation
    if (completionCheck.complete) {
      try {
        const { generateRecommendations } = require('../services/deepseek');
        const { getAIConfig, isConfigured } = require('../services/deepseek');
        
        const aiConfig = await getAIConfig();
        
        if (await isConfigured({ config: aiConfig })) {
          // Import the recommendation generation logic
          const axios = require('axios');
          
          // Make internal call to generate recommendations
          const apiUrl = req.protocol + '://' + req.get('host');
          const token = req.headers.authorization;
          
          try {
            const recommendationResponse = await axios.post(
              `${apiUrl}/api/v1/recommendations/generate`,
              {},
              {
                headers: {
                  'Authorization': token,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (recommendationResponse.data.success) {
              response.recommendationsGenerated = true;
              response.recommendations = recommendationResponse.data.data;
            }
          } catch (recommendationError) {
            // Log error but don't fail the survey submission
            console.error('Error generating recommendations:', recommendationError);
            response.recommendationError = recommendationError.message;
          }
        }
      } catch (error) {
        // Log error but don't fail the survey submission
        console.error('Error checking AI configuration:', error);
      }
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit answers',
      error: error.message
    });
  }
});

// Save single answer (for progress tracking)
router.post('/save-answer', authenticate, async (req, res) => {
  try {
    const { questionId, answer: answerText } = req.body;
    const studentId = req.user.id;

    if (!questionId || !answerText) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and answer are required'
      });
    }

    // Insert or update single answer
    await pool.execute(
      `INSERT INTO Answers (StudentID, QuestionID, Answer) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE Answer = ?`,
      [studentId, questionId, answerText, answerText]
    );

    res.json({
      success: true,
      message: 'Answer saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save answer',
      error: error.message
    });
  }
});

// Check if all surveys are complete
router.get('/completion-status', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const completionCheck = await checkAllSurveysComplete(studentId);
    
    res.json({
      success: true,
      data: completionCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check completion status',
      error: error.message
    });
  }
});

// Get my answers
// Get my survey answers - filtered by current student
// الحصول على إجابات الاستبيان الخاصة بي - مفلترة حسب الطالب الحالي
router.get('/my-answers', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;

    // Only students can access their own answers
    // فقط الطلاب يمكنهم الوصول إلى إجاباتهم
    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access their survey answers'
      });
    }

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

    const [answers] = await pool.execute(
      `SELECT a.AnswerID as id, a.Answer, a.QuestionID,
              q.Text as question, q.Category, q.Type
       FROM Answers a
       JOIN Questions q ON a.QuestionID = q.QuestionID
       WHERE a.StudentID = ?
       ORDER BY q.Category, q.QuestionID`,
      [studentId]
    );

    res.json({
      success: true,
      data: answers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get answers',
      error: error.message
    });
  }
});

module.exports = router;

