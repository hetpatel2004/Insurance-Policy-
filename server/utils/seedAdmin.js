require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Bootstrap admin accounts only.
// Regular users are created either via the Register page or by an admin
// from the Admin Panel (User Management -> Add User). Nothing else is
// hardcoded here — everything else lives in MongoDB.
const admins = [
  {
    firstName: 'Admin',
    lastName: 'One',
    aadharNumber: '111111111111',
    email: 'admin1@securelife.com',
    phone: '+10000000001',
    password: 'admin123',
    role: 'admin',
  },
  {
    firstName: 'Admin',
    lastName: 'Two',
    aadharNumber: '222222222222',
    email: 'admin2@securelife.com',
    phone: '+10000000002',
    password: 'admin123',
    role: 'admin',
  },
  {
    firstName: 'Admin',
    lastName: 'Three',
    aadharNumber: '333333333333',
    email: 'admin3@securelife.com',
    phone: '+10000000003',
    password: 'admin123',
    role: 'admin',
  },
];

const upsert = async (data) => {
  const existing = await User.findOne({ $or: [{ email: data.email }, { aadharNumber: data.aadharNumber }] });
  if (existing) {
    existing.role = data.role;
    existing.aadharNumber = data.aadharNumber;
    existing.email = data.email;
    existing.isVerified = true;
    await existing.save();
    console.log(`  - Updated: ${data.email}`);
    return;
  }
  await User.create(data);
  console.log(`  - Created: ${data.email}`);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Seeding admin accounts...');
    for (const admin of admins) await upsert(admin);
    console.log('\n===== Admin Logins =====');
    admins.forEach(a => console.log(`  ${a.email} / ${a.password}`));
    console.log('\nAll regular users are created through the Register page or the Admin Panel. Done!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding: ${error.message}`);
    process.exit(1);
  }
};

seed();
