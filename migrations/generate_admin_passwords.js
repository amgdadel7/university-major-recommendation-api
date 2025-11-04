// Generate secure passwords for admin accounts
const bcrypt = require('bcryptjs');

// Admin accounts and their passwords
const admins = [
  {
    name: 'أحمد بن محمد',
    email: 'admin@umr.edu.sa',
    password: 'Admin123!', // يمكن تغييرها
    role: 'admin',
    accessLevel: 'super'
  },
  {
    name: 'سارة بنت عبدالله',
    email: 'sara.admin@umr.edu.sa',
    password: 'Sara123!', // يمكن تغييرها
    role: 'admin',
    accessLevel: 'admin'
  },
  {
    name: 'خالد بن سعود',
    email: 'khalid.admin@umr.edu.sa',
    password: 'Khalid123!', // يمكن تغييرها
    role: 'admin',
    accessLevel: 'admin'
  }
];

console.log('='.repeat(60));
console.log('كلمات مرور الإداريين - Admin Passwords');
console.log('='.repeat(60));
console.log('\n');

// Generate hashed passwords
admins.forEach((admin, index) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
  
  console.log(`${index + 1}. ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password (Plain): ${admin.password}`);
  console.log(`   Password (Hashed): ${hash}`);
  console.log(`   Role: ${admin.role} | Access: ${admin.accessLevel}`);
  console.log('\n');
});

console.log('='.repeat(60));
console.log('SQL UPDATE Statements:');
console.log('='.repeat(60));
console.log('\n');

// Generate SQL UPDATE statements
admins.forEach((admin) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
  
  console.log(`UPDATE Admins SET PasswordHash = '${hash}' WHERE Email = '${admin.email}';`);
});

// Also generate for seed_data.sql format
console.log('\n');
console.log('='.repeat(60));
console.log('For seed_data.sql:');
console.log('='.repeat(60));
console.log('\n');

console.log('INSERT INTO Admins (FullName, Email, PasswordHash, Role, AccessLevel, IsActive) VALUES');
admins.forEach((admin, index) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
  const comma = index < admins.length - 1 ? ',' : ';';
  console.log(`('${admin.name}', '${admin.email}', '${hash}', '${admin.role}', '${admin.accessLevel}', TRUE)${comma}`);
});

