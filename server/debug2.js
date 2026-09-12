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
    console.log('All fields:', Object.keys(user._doc || user));
    console.log('Full doc:', JSON.stringify(user._doc || user, null, 2));
  })
  .catch(err => console.error('Error:', err.message));