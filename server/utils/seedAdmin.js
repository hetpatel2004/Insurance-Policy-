require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');

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

const sampleUsers = [
  {
    firstName: 'Rahul',
    lastName: 'Sharma',
    aadharNumber: '444444444444',
    email: 'rahul@gmail.com',
    phone: '+919876543210',
    password: 'user123',
    role: 'user',
    isVerified: true,
  },
  {
    firstName: 'Priya',
    lastName: 'Patel',
    aadharNumber: '555555555555',
    email: 'priya@gmail.com',
    phone: '+919876543211',
    password: 'user123',
    role: 'user',
    isVerified: true,
  },
  {
    firstName: 'Amit',
    lastName: 'Verma',
    aadharNumber: '666666666666',
    email: 'amit@gmail.com',
    phone: '+919876543212',
    password: 'user123',
    role: 'user',
    isVerified: false,
  },
];

const sampleCompanies = [
  {
    name: 'HDFC ERGO',
    email: 'support@hdfcergo.com',
    phone: '+911800266266',
    address: 'Mumbai, Maharashtra',
    description: 'General insurance with health, auto, home and travel plans.',
  },
  {
    name: 'ICICI Lombard',
    email: 'support@icicilombard.com',
    phone: '+911800266266',
    address: 'Mumbai, Maharashtra',
    description: 'Motor, health, travel and home insurance.',
  },
  {
    name: 'TATA AIG',
    email: 'support@tataaig.com',
    phone: '+911800266778',
    address: 'Mumbai, Maharashtra',
    description: 'Health, auto, home and travel insurance.',
  },
];

const sampleCustomers = [
  {
    aadharNumber: '444444444444',
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    phone: '+919876543210',
    company: null,
    policies: [
      {
        policyType: 'health',
        planName: 'Health Pro Silver',
        premium: 4500,
        coverage: 500000,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2026-01-14'),
        status: 'active',
      },
      {
        policyType: 'auto',
        planName: 'Motor Shield',
        premium: 2500,
        coverage: 300000,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-02-28'),
        status: 'active',
      },
    ],
  },
  {
    aadharNumber: '555555555555',
    name: 'Priya Patel',
    email: 'priya@gmail.com',
    phone: '+919876543211',
    company: null,
    policies: [
      {
        policyType: 'life',
        planName: 'Secure Life Gold',
        premium: 12000,
        coverage: 1000000,
        startDate: new Date('2024-06-10'),
        endDate: new Date('2044-06-09'),
        status: 'active',
      },
    ],
  },
  {
    aadharNumber: '666666666666',
    name: 'Amit Verma',
    email: 'amit@gmail.com',
    phone: '+919876543212',
    company: null,
    policies: [
      {
        policyType: 'travel',
        planName: 'TravelSafe International',
        premium: 1800,
        coverage: 200000,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-15'),
        status: 'active',
      },
    ],
  },
];

const upsert = async (data) => {
  const existing = await User.findOne({ $or: [{ email: data.email }, { aadharNumber: data.aadharNumber }] });
  if (existing) {
    existing.role = data.role;
    existing.aadharNumber = data.aadharNumber;
    existing.isVerified = data.isVerified;
    await existing.save();
    console.log(`  - Updated: ${data.email}`);
    return;
  }
  await User.create(data);
  console.log(`  - Created: ${data.email}`);
};

const upsertCompany = async (data) => {
  const existing = await Company.findOne({ name: data.name });
  if (existing) return existing;
  return Company.create(data);
};

const upsertCustomer = async (data, companies) => {
  const byType = {
    health: companies.find((c) => c.name === 'HDFC ERGO'),
    auto: companies.find((c) => c.name === 'ICICI Lombard'),
    life: companies.find((c) => c.name === 'TATA AIG'),
    travel: companies.find((c) => c.name === 'ICICI Lombard'),
    home: companies.find((c) => c.name === 'HDFC ERGO'),
    retirement: companies.find((c) => c.name === 'TATA AIG'),
  };
  const policies = data.policies.map((p) => ({
    ...p,
    company: byType[p.policyType] ? byType[p.policyType]._id : null,
  }));
  const existing = await Customer.findOne({ aadharNumber: data.aadharNumber });
  if (existing) {
    existing.name = data.name;
    existing.email = data.email;
    existing.phone = data.phone;
    existing.company = null;
    existing.policies = policies;
    await existing.save();
    console.log(`  - Updated customer: ${data.aadharNumber}`);
    return;
  }
  await Customer.create({ ...data, company: null, policies });
  console.log(`  - Created customer: ${data.aadharNumber}`);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Seeding admin accounts...');
    for (const admin of admins) await upsert(admin);
    console.log('Seeding sample users...');
    for (const user of sampleUsers) await upsert(user);
    console.log('Seeding companies...');
    const companies = [];
    for (const company of sampleCompanies) {
      companies.push(await upsertCompany(company));
      console.log(`  - Synced: ${company.name}`);
    }
    console.log('Seeding customers...');
    for (const customer of sampleCustomers) await upsertCustomer(customer, companies);
    console.log('\n===== Default Admin Logins =====');
    admins.forEach(a => console.log(`  ${a.email} / ${a.password}`));
    console.log('===== Sample User Logins (use Aadhar as login ID) =====');
    sampleUsers.forEach(u => console.log(`  Aadhar: ${u.aadharNumber} / ${u.password}`));
    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding: ${error.message}`);
    process.exit(1);
  }
};

seed();
