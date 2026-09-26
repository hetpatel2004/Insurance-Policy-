require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => User.create({
    firstName: 'Test',
    lastName: 'User',
    aadharNumber: '999999999999',
    email: 'test@example.com',
    phone: '+919876543210',
    password: 'testpass123'
  }))
  .then(u => {
    console.log('User created:', u.email);
    console.log('Password stored:', u.password ? 'YES (starts with ' + u.password.substring(0, 5) + '...)' : 'NO');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error creating user:', err.message);
    // Check if it's a validation error
    if (err.name === 'ValidationError') {
      console.log('Validation errors:');
      Object.keys(err.errors).forEach(key => {
        console.log('  -', key + ':', err.errors[key].message);
      });
    }
    process.exit(1);
  });