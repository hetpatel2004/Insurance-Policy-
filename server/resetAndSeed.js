require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Delete all existing admin users
    const result = await User.deleteMany({ email: { $in: ['admin1@securelife.com', 'admin2@securelife.com', 'admin3@securelife.com'] } });
    console.log('Deleted', result.deletedCount, 'admin users');
    
    // Create admin1 with password (will be auto-hashed by pre('save') hook)
    const admin1 = await User.create({
      firstName: 'Admin',
      lastName: 'One',
      aadharNumber: '111111111111',
      email: 'admin1@securelife.com',
      phone: '+10000000001',
      role: 'admin',
      password: 'admin123'
    });
    console.log('Created admin1, password hashed:', admin1.password.substring(0, 10) + '...');
    
    // Create admin2 with password
    const admin2 = await User.create({
      firstName: 'Admin',
      lastName: 'Two',
      aadharNumber: '222222222222',
      email: 'admin2@securelife.com',
      phone: '+10000000002',
      role: 'admin',
      password: 'admin123'
    });
    console.log('Created admin2, password hashed:', admin2.password.substring(0, 10) + '...');
    
    // Create admin3 with password
    const admin3 = await User.create({
      firstName: 'Admin',
      lastName: 'Three',
      aadharNumber: '333333333333',
      email: 'admin3@securelife.com',
      phone: '+10000000003',
      role: 'admin',
      password: 'admin123'
    });
    console.log('Created admin3, password hashed:', admin3.password.substring(0, 10) + '...');
    
    // Test login: verify password matches
    const pwMatch1 = await admin1.matchPassword('admin123');
    const pwMatch2 = await admin2.matchPassword('admin123');
    console.log('admin1 password match:', pwMatch1);
    console.log('admin2 password match:', pwMatch2);
    
    console.log('\n✅ All admin accounts created with hashed passwords!');
    console.log('🔑 Login credentials: admin1@securelife.com / admin123');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });