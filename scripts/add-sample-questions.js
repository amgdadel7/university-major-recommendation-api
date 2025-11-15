/**
 * Script to add sample questions to the database
 * Run with: node scripts/add-sample-questions.js
 */

const pool = require('../src/config/database');

const sampleQuestions = [
  // Interest Questions (أسئلة الاهتمامات)
  {
    Text: 'ما هي المجالات الأكاديمية التي تهمك أكثر؟',
    Type: 'interests',
    Category: 'أكاديمي'
  },
  {
    Text: 'ما هي المواد الدراسية التي تفضل دراستها؟',
    Type: 'interests',
    Category: 'أكاديمي'
  },
  {
    Text: 'ما هي الاهتمامات العلمية التي ترغب في استكشافها؟',
    Type: 'interests',
    Category: 'علمي'
  },
  {
    Text: 'ما هي المجالات المهنية التي تثير اهتمامك؟',
    Type: 'interests',
    Category: 'مهني'
  },
  {
    Text: 'ما هي الأنشطة التي تستمتع بها في وقت الفراغ؟',
    Type: 'interests',
    Category: 'شخصي'
  },
  // Learning Style Questions (أسئلة أسلوب التعلم)
  {
    Text: 'ما هو أسلوب التعلم المفضل لديك؟',
    Type: 'learning_style',
    Category: 'تعليمي'
  },
  {
    Text: 'كيف تفضل استقبال المعلومات الجديدة؟',
    Type: 'learning_style',
    Category: 'تعليمي'
  },
  {
    Text: 'هل تفضل التعلم النظري أم العملي؟',
    Type: 'learning_style',
    Category: 'تعليمي'
  },
  {
    Text: 'ما هي البيئة التعليمية التي تناسبك أكثر؟',
    Type: 'learning_style',
    Category: 'تعليمي'
  },
  {
    Text: 'كيف تفضل تنظيم وقت التعلم؟',
    Type: 'learning_style',
    Category: 'تعليمي'
  }
];

async function addSampleQuestions() {
  try {
    // Check if questions already exist
    const [existingQuestions] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );

    const count = existingQuestions[0].count;
    if (count > 0) {
      // Show existing questions
      const [questions] = await pool.execute(
        'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
      );
      questions.forEach((q, index) => {}...`);
      });
      
      return;
    }

    // Insert questions
    for (const question of sampleQuestions) {
      try {
        await pool.execute(
          'INSERT INTO Questions (Text, Type, Category) VALUES (?, ?, ?)',
          [question.Text, question.Type, question.Category]
        );}...`);
      } catch (error) {}...`);
      }
    }

    // Verify inserted questions
    const [allQuestions] = await pool.execute(
      'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
    );
    const interestsCount = allQuestions.filter(q => q.Type === 'interests').length;
    const learningStyleCount = allQuestions.filter(q => q.Type === 'learning_style' || q.Type === 'learning-style').length;
  } catch (error) {
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the script
addSampleQuestions();

