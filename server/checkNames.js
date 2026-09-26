require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({ role: 'admin' });
    console.log('Admin users:');
    users.forEach(u => {
      console.log('Email:', u.email);
      console.log('First name:', u.firstName);
      console.log('Last name:', u.lastName);
      console.log('Full name (concat):', (u.firstName || '') + ' ' + (u.lastName || ''));
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => console.error('Error:', err.message));