const User = require('../models/User');
const Policy = require('../models/Policy');
const Company = require('../models/Company');
const Customer = require('../models/Customer');

// @desc    Get platform statistics (public)
// @route   GET /api/stats
const getStats = async (req, res) => {
  try {
    const [users, policies, companies, customers] = await Promise.all([
      User.countDocuments(),
      Policy.countDocuments(),
      Company.countDocuments(),
      Customer.countDocuments(),
    ]);
    res.json({
      users,
      policies,
      companies,
      customers,
      activePolicies: await Policy.countDocuments({ status: 'active' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
