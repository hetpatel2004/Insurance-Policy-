require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => User.create({
    firstName: 'Test',
    lastName: 'User',
    aadharNumber: '111111111111',  // Already exists - admin1
    email: 'new@example.com',
    phone: '+919876543210',
    password: 'testpass123'
  }))
  .then(u => {
    console.log('User created:', u.email);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating user:');
    if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach(key => {
        console.log('  -', key + ':', err.errors[key].message);
      });
    } else {
      console.log(err.message);
    }
    process.exit(1);
  });