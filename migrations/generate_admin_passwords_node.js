// Generate bcrypt hashed passwords for admin accounts
const bcrypt = require('bcryptjs');

// Admin passwords
const adminPasswords = {
  'admin@umr.edu.sa': 'Admin123!',
  'sara.admin@umr.edu.sa': 'Sara123!',
  'khalid.admin@umr.edu.sa': 'Khalid123!'
};

console.log('='.repeat(70));
console.log('كلمات مرور الإداريين - Admin Passwords');
console.log('='.repeat(70));
console.log('\n');

// Generate hashed passwords
const results = {};

for (const [email, password] of Object.entries(adminPasswords)) {
  const hash = bcrypt.hashSync(password, 10);
  results[email] = { password, hash };
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('-' .repeat(70));
  console.log('\n');
}

// Generate SQL UPDATE statements
console.log('='.repeat(70));
console.log('SQL UPDATE Statements:');
console.log('='.repeat(70));
console.log('\n');

for (const [email, { hash }] of Object.entries(results)) {
  console.log(`UPDATE Admins SET PasswordHash = '${hash}' WHERE Email = '${email}';`);
}

// Generate INSERT statement for seed_data.sql
console.log('\n');
console.log('='.repeat(70));
console.log('For seed_data.sql (INSERT statement):');
console.log('='.repeat(70));
console.log('\n');

const admins = [
  { name: 'أحمد بن محمد', email: 'admin@umr.edu.sa', role: 'admin', accessLevel: 'super' },
  { name: 'سارة بنت عبدالله', email: 'sara.admin@umr.edu.sa', role: 'admin', accessLevel: 'admin' },
  { name: 'خالد بن سعود', email: 'khalid.admin@umr.edu.sa', role: 'admin', accessLevel: 'admin' }
];

console.log('INSERT INTO Admins (FullName, Email, PasswordHash, Role, AccessLevel, IsActive) VALUES');
admins.forEach((admin, index) => {
  const hash = results[admin.email].hash;
  const comma = index < admins.length - 1 ? ',' : ';';
  console.log(`('${admin.name}', '${admin.email}', '${hash}', '${admin.role}', '${admin.accessLevel}', TRUE)${comma}`);
});

