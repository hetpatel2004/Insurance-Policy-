require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Check all users - with and without password
    const users = await User.find({});
    console.log('Total users:', users.length);
    users.forEach(u => {
      const hasPassword = u.password ? u.password.startsWith('$2') : 'NO FIELD';
      console.log(u.email, '| role:', u.role, '| hasPassword:', hasPassword);
    });
    process.exit(0);
  })
  .catch(err => console.error('Error:', err.message));