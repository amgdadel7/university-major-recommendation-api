/**
 * Script to delete questions from the database
 * Run with: node scripts/delete-questions.js
 * 
 * ⚠️ Warning: This will delete all questions from the Questions table
 */

const pool = require('../src/config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function deleteQuestions() {
  try {
    console.log('🗑️  Question Deletion Script\n');

    // Get current questions count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );
    const totalQuestions = countResult[0].count;

    if (totalQuestions === 0) {
      console.log('✅ No questions found in database. Nothing to delete.\n');
      return;
    }

    console.log(`📊 Current questions in database: ${totalQuestions}\n`);

    // Show existing questions
    const [questions] = await pool.execute(
      'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
    );

    console.log('📝 Existing questions:');
    questions.forEach((q, index) => {
      console.log(`   ${index + 1}. [ID: ${q.QuestionID}] [${q.Type}] ${q.Text.substring(0, 50)}...`);
    });
    console.log('');

    // Ask for confirmation
    console.log('⚠️  WARNING: This will delete ALL questions from the database!\n');
    const confirm1 = await question('Are you sure you want to delete all questions? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled.\n');
      return;
    }

    const confirm2 = await question('Type "DELETE ALL" to confirm: ');
    
    if (confirm2 !== 'DELETE ALL') {
      console.log('❌ Confirmation failed. Operation cancelled.\n');
      return;
    }

    // Delete all questions
    console.log('\n🔄 Deleting all questions...\n');
    
    const [result] = await pool.execute('DELETE FROM Questions');
    
    console.log(`✅ Deleted ${result.affectedRows} question(s) successfully.\n`);

    // Verify deletion
    const [verifyResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );
    const remainingCount = verifyResult[0].count;

    if (remainingCount === 0) {
      console.log('✅ All questions deleted successfully.\n');
    } else {
      console.log(`⚠️  Warning: ${remainingCount} question(s) still remain.\n`);
    }

  } catch (error) {
    console.error('❌ Error deleting questions:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

// Run the script
deleteQuestions();

