require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Check if there are duplicate aadhars or emails
    const countByAadhar = await User.countDocuments({});
    const countByEmail = await User.countDocuments({});
    
    // Check for duplicates
    const dupes = await User.aggregate([
      { $group: { _id: '$aadharNumber', count: { $sum: 1 }, emails: { $addToSet: '$email' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log('Total users:', countByAadhar);
    console.log('Duplicate Aadhars:', dupes.length);
    
    // Check each user's aadhar length
    const users = await User.find({});
    users.forEach(u => {
      console.log(u.email, '| aadhar:', u.aadharNumber, '| length:', u.aadharNumber ? u.aadharNumber.length : 0);
    });
    process.exit(0);
  })
  .catch(err => console.error('Error:', err.message));