require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => User.findOne({ email: 'admin1@securelife.com' }))
  .then(user => {
    if (!user) {
      console.log('User NOT found in database');
      process.exit(0);
    }
    console.log('User found:', user.email);
    console.log('Password field exists:', !!user.password);
    if (user.password) {
      console.log('Password length:', user.password.length);
      console.log('Password first 5 chars:', user.password.substring(0, 5));
      console.log('Starts with $2a$:', user.password.startsWith('$2a$'));
      console.log('Starts with $2b$:', user.password.startsWith('$2b$'));
    }
    // Test matchPassword directly
    if (user.password) {
      const bcrypt = require('bcryptjs');
      bcrypt.compare('admin123', user.password).then(match => {
        console.log('bcrypt compare result (admin123 vs stored):', match);
      });
    }
  })
  .catch(err => console.error('Error:', err.message));