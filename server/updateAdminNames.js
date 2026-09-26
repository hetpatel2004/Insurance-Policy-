require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Update admin1: het patel
    await User.updateOne({ email: 'admin1@securelife.com' }, { firstName: 'het', lastName: 'patel' });
    console.log('Updated admin1: het patel');
    
    // Update admin2: hardik patel
    await User.updateOne({ email: 'admin2@securelife.com' }, { firstName: 'hardik', lastName: 'patel' });
    console.log('Updated admin2: hardik patel');
    
    // Update admin3: pankta patel (note: original was "pankta" not "pankha")
    await User.updateOne({ email: 'admin3@securelife.com' }, { firstName: 'pankta', lastName: 'patel' });
    console.log('Updated admin3: pankta patel');
    
    // Verify updates
    const users = await User.find({ role: 'admin' });
    users.forEach(u => {
      console.log(`${u.email}: ${u.firstName} ${u.lastName}`);
    });
    
    console.log('\n✅ All admin names updated!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });