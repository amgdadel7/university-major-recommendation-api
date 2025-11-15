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
];););
// Generate hashed passwords
admins.forEach((admin, index) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);: ${admin.password}`);: ${hash}`);
});););
// Generate SQL UPDATE statements
admins.forEach((admin) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
});

// Also generate for seed_data.sql format););VALUES');
admins.forEach((admin, index) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(admin.password, salt);
  const comma = index < admins.length - 1 ? ',' : ';';${comma}`);
});

