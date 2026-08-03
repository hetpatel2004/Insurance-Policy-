const User = require('../models/User');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  aadharNumber: user.aadharNumber,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
});

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, aadharNumber, email, phone, password, role } = req.body;

    if (role === 'admin') {
      return res.status(400).json({
        message: 'Admin accounts cannot be self-registered. Please register as a user.',
      });
    }

    const aadharExists = await User.findOne({ aadharNumber });
    if (aadharExists) {
      return res.status(400).json({ message: 'Aadhar number already registered' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      firstName,
      lastName,
      aadharNumber,
      email,
      phone,
      password,
      role: 'user',
    });

    if (user) {
      res.status(201).json({ ...sanitizeUser(user), token: generateToken(user._id) });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (login by Aadhar number or email)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Aadhar/Email and password are required' });
    }

    const user = await User.findOne({
      $or: [
        { aadharNumber: loginId },
        { email: loginId.toLowerCase() },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid Aadhar/Email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Aadhar/Email or password' });
    }

    // Check if this user's Aadhar is recorded in the agent's customer list
    let customer = null;
    if (user.role === 'user') {
      customer = await Customer.findOne({ aadharNumber: user.aadharNumber })
        .populate('company', 'name')
        .populate('policies.company', 'name');
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user._id),
      isExistingCustomer: !!customer,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, phone } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = req.body.password;
    }

    const updated = await user.save();
    res.json(sanitizeUser(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateProfile };
