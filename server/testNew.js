require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => User.create({
    firstName: 'New',
    lastName: 'User',
    aadharNumber: '555555555555',  // Fresh aadhar not in DB
    email: 'newuser@test.com',    // Fresh email not in DB
    phone: '+919876543210',
    password: 'pass123'           // 7 chars, > 6 minimum
  }))
  .then(u => {
    console.log('✅ User created successfully:', u.email);
    console.log('Password hash:', u.password ? u.password.substring(0, 10) + '...' : 'N/A');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error creating user:');
    if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach(key => {
        console.log('   -', key + ':', err.errors[key].message);
      });
    } else {
      console.log('   ', err.message);
    }
    process.exit(1);
  });