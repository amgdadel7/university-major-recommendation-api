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
    console.log('🔄 Starting to add sample questions...\n');

    // Check if questions already exist
    const [existingQuestions] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );

    const count = existingQuestions[0].count;
    console.log(`📊 Current questions in database: ${count}\n`);

    if (count > 0) {
      console.log('⚠️  Database already contains questions.');
      console.log('💡 To add new questions, delete existing ones first or modify this script.\n');
      
      // Show existing questions
      const [questions] = await pool.execute(
        'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
      );
      
      console.log('📝 Existing questions:');
      questions.forEach((q, index) => {
        console.log(`   ${index + 1}. [${q.Type}] ${q.Text.substring(0, 50)}...`);
      });
      
      return;
    }

    // Insert questions
    console.log('➕ Inserting sample questions...\n');
    
    for (const question of sampleQuestions) {
      try {
        await pool.execute(
          'INSERT INTO Questions (Text, Type, Category) VALUES (?, ?, ?)',
          [question.Text, question.Type, question.Category]
        );
        console.log(`✅ Added: [${question.Type}] ${question.Text.substring(0, 50)}...`);
      } catch (error) {
        console.error(`❌ Error adding question: ${question.Text.substring(0, 50)}...`);
        console.error(`   Error: ${error.message}`);
      }
    }

    // Verify inserted questions
    console.log('\n🔍 Verifying inserted questions...\n');
    
    const [allQuestions] = await pool.execute(
      'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
    );

    console.log(`📊 Total questions in database: ${allQuestions.length}\n`);
    
    const interestsCount = allQuestions.filter(q => q.Type === 'interests').length;
    const learningStyleCount = allQuestions.filter(q => q.Type === 'learning_style' || q.Type === 'learning-style').length;

    console.log(`📈 Statistics:`);
    console.log(`   - Interest questions: ${interestsCount}`);
    console.log(`   - Learning style questions: ${learningStyleCount}`);
    console.log(`   - Total: ${allQuestions.length}\n`);

    console.log('✅ Sample questions added successfully!\n');
    console.log('💡 Refresh the surveys page to see the questions.\n');

  } catch (error) {
    console.error('❌ Error adding sample questions:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run the script
addSampleQuestions();

