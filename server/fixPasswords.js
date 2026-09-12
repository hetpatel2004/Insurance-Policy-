require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Find all users that don't have a password field or have plain text password
    const users = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: { $not: /^\$2[ab]\$/ } }
      ]
    });
    
    console.log('Users needing password fix:', users.length);
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      user.password = hashedPassword;
      await user.save();
      console.log('Fixed password for:', user.email);
    }
    
    console.log('Done! All users now have hashed passwords.');
    process.exit(0);
  })
  .catch(err => console.error('Error:', err.message));