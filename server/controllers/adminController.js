const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');

const sanitizeUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  aadharNumber: user.aadharNumber,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// @desc    Create a new user (admin)
// @route   POST /api/auth/users
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, aadharNumber, email, phone, password, role, isVerified, companyId, policyType, planName } = req.body;

    if (!firstName || !lastName || !aadharNumber || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, Aadhar number, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const aadharExists = await User.findOne({ aadharNumber });
    if (aadharExists) {
      return res.status(400).json({ message: 'Aadhar number already registered' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let company = null;
    if (companyId) {
      company = await Company.findById(companyId);
      if (!company) {
        return res.status(400).json({ message: 'Selected company not found' });
      }
      if (company.policyTypes.length > 0 && policyType && !company.policyTypes.includes(policyType)) {
        return res.status(400).json({ message: `${policyType} is not offered by ${company.name}` });
      }
    }

    const user = await User.create({
      firstName,
      lastName,
      aadharNumber,
      email,
      phone,
      password,
      role: 'user',
      isVerified: typeof isVerified === 'boolean' ? isVerified : true,
    });

    // If a company (and insurance type) was chosen, record this user as a customer
    // so they see their policy under that company after login.
    if (company) {
      const now = new Date();
      const end = new Date(now);
      end.setFullYear(end.getFullYear() + 1);

      const customerPolicy = {
        policyType,
        planName: planName || `${company.name} ${policyType || ''} plan`,
        company: company._id,
        premium: 0,
        coverage: 0,
        startDate: now,
        endDate: end,
        status: 'active',
      };

      const existingCustomer = await Customer.findOne({ aadharNumber });
      if (existingCustomer) {
        existingCustomer.name = `${firstName} ${lastName}`;
        existingCustomer.email = email || existingCustomer.email;
        existingCustomer.phone = phone || existingCustomer.phone;
        existingCustomer.company = company._id;
        existingCustomer.policies.push(customerPolicy);
        await existingCustomer.save();
      } else {
        await Customer.create({
          aadharNumber,
          name: `${firstName} ${lastName}`,
          email,
          phone,
          company: company._id,
          policies: [customerPolicy],
          createdBy: req.user._id,
        });
      }
    }

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Aadhar number or email already registered' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create users (admin)
// @route   POST /api/auth/users/bulk
const bulkCreateUsers = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No user rows provided' });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        const firstName = r.firstName;
        const lastName = r.lastName;
        const aadharNumber = r.aadharNumber;
        const email = r.email;
        const password = r.password || 'user123';
        if (!firstName || !lastName || !aadharNumber || !email) {
          skipped++;
          errors.push({ row: i + 2, error: 'firstName, lastName, aadharNumber and email are required' });
          continue;
        }
        const exists = await User.findOne({ $or: [{ aadharNumber }, { email }] });
        if (exists) {
          skipped++;
          errors.push({ row: i + 2, error: 'Aadhar number or email already registered' });
          continue;
        }
        await User.create({
          firstName,
          lastName,
          aadharNumber,
          email,
          phone: r.phone,
          password,
          role: 'user',
          isVerified: true,
        });
        created++;
      } catch (e) {
        skipped++;
        errors.push({ row: i + 2, error: e.message });
      }
    }

    res.json({ created, skipped, errors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by id
// @route   GET /api/auth/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (name, email, phone, aadhar, role, isVerified)
// @route   PUT /api/auth/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, phone, aadharNumber, isVerified } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.aadharNumber = aadharNumber || user.aadharNumber;
    if (typeof isVerified === 'boolean') {
      user.isVerified = isVerified;
    }

    const updatedUser = await user.save();
    res.json(sanitizeUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, bulkCreateUsers, updateUser, deleteUser };
