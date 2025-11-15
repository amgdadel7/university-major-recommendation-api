/**
 * Script to generate password hashes for university users
 * Run: node scripts/generate_university_passwords.js
 */

const bcrypt = require('bcryptjs');

// Default password (you should change this!)
const defaultPassword = 'university123';

// Generate hash
const hash = bcrypt.hashSync(defaultPassword, 10);););););

