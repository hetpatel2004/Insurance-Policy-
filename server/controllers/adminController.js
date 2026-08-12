const User = require('../models/User');

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
    const { firstName, lastName, aadharNumber, email, phone, password, role, isVerified } = req.body;

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

    const user = await User.create({
      firstName,
      lastName,
      aadharNumber,
      email,
      phone,
      password,
      role: role === 'admin' ? 'admin' : 'user',
      isVerified: typeof isVerified === 'boolean' ? isVerified : true,
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Aadhar number or email already registered' });
    }
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

    const { firstName, lastName, email, phone, aadharNumber, role, isVerified } = req.body;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.aadharNumber = aadharNumber || user.aadharNumber;
    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }
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

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
