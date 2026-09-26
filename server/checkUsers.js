require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Check current user structure
    const users = await User.find({ role: 'user' }).limit(3);
    users.forEach(u => {
      console.log('Email:', u.email);
      console.log('First name:', u.firstName);
      console.log('Last name:', u.lastName);
      console.log('Aadhar:', u.aadharNumber);
      console.log('Password exists:', !!u.password);
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => console.error('Error:', err.message));