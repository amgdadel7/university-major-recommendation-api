/**
 * Script to generate password hashes for university users
 * Run: node scripts/generate_university_passwords.js
 */

const bcrypt = require('bcryptjs');

// Default password (you should change this!)
const defaultPassword = 'university123';

// Generate hash
const hash = bcrypt.hashSync(defaultPassword, 10);

console.log('='.repeat(60));
console.log('University Users Password Hash Generator');
console.log('='.repeat(60));
console.log('\nDefault Password:', defaultPassword);
console.log('Generated Hash:', hash);
console.log('\n' + '='.repeat(60));
console.log('\nTo create university users, use this hash in the SQL script.');
console.log('Remember to change the default password after first login!');
console.log('\n' + '='.repeat(60));

