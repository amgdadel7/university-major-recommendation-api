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
    // Get current questions count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );
    const totalQuestions = countResult[0].count;

    if (totalQuestions === 0) {
      return;
    }
    // Show existing questions
    const [questions] = await pool.execute(
      'SELECT QuestionID, Text, Type, Category FROM Questions ORDER BY Type, QuestionID'
    );
    questions.forEach((q, index) => {}...`);
    });
    // Ask for confirmation
    const confirm1 = await question('Are you sure you want to delete all questions? (yes/no): ');
    
    if (confirm1.toLowerCase() !== 'yes') {
      return;
    }

    const confirm2 = await question('Type "DELETE ALL" to confirm: ');
    
    if (confirm2 !== 'DELETE ALL') {
      return;
    }

    // Delete all questions
    const [result] = await pool.execute('DELETE FROM Questions');successfully.\n`);

    // Verify deletion
    const [verifyResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM Questions'
    );
    const remainingCount = verifyResult[0].count;

    if (remainingCount === 0) {
    } else {still remain.\n`);
    }

  } catch (error) {
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
    process.exit(0);
  }
}

// Run the script
deleteQuestions();

