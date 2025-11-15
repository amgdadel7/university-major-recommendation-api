// Generate bcrypt hashed passwords for admin accounts
const bcrypt = require('bcryptjs');

// Admin passwords
const adminPasswords = {
  'admin@umr.edu.sa': 'Admin123!',
  'sara.admin@umr.edu.sa': 'Sara123!',
  'khalid.admin@umr.edu.sa': 'Khalid123!'
};););
// Generate hashed passwords
const results = {};

for (const [email, password] of Object.entries(adminPasswords)) {
  const hash = bcrypt.hashSync(password, 10);
  results[email] = { password, hash };);
}

// Generate SQL UPDATE statements););
for (const [email, { hash }] of Object.entries(results)) {
}

// Generate INSERT statement for seed_data.sql);:'););
const admins = [
  { name: 'أحمد بن محمد', email: 'admin@umr.edu.sa', role: 'admin', accessLevel: 'super' },
  { name: 'سارة بنت عبدالله', email: 'sara.admin@umr.edu.sa', role: 'admin', accessLevel: 'admin' },
  { name: 'خالد بن سعود', email: 'khalid.admin@umr.edu.sa', role: 'admin', accessLevel: 'admin' }
];VALUES');
admins.forEach((admin, index) => {
  const hash = results[admin.email].hash;
  const comma = index < admins.length - 1 ? ',' : ';';${comma}`);
});

