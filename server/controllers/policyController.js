const Policy = require('../models/Policy');
const User = require('../models/User');
const Company = require('../models/Company');
const { POLICY_TYPES } = require('../utils/policyTypes');

// @desc    Apply for a policy (user)
// @route   POST /api/policies
const createPolicy = async (req, res) => {
  try {
    const { policyType, planName, premium, coverage, company } = req.body;
    if (!policyType || !planName || !premium || !coverage) {
      return res.status(400).json({ message: 'All policy fields are required' });
    }

    // Validate premium and coverage are positive numbers
    const premiumNum = Number(premium);
    const coverageNum = Number(coverage);
    if (isNaN(premiumNum) || premiumNum < 0) {
      return res.status(400).json({ message: 'Premium must be a positive number' });
    }
    if (isNaN(coverageNum) || coverageNum < 0) {
      return res.status(400).json({ message: 'Coverage must be a positive number' });
    }

    // If company is provided, validate policy type compatibility
    let companyId = company;
    if (company) {
      const comp = await Company.findById(company);
      if (!comp) {
        return res.status(404).json({ message: 'Company not found' });
      }
      if (comp.policyTypes.length > 0 && !comp.policyTypes.includes(policyType)) {
        return res.status(400).json({ message: `${policyType} is not offered by ${comp.name}` });
      }
      companyId = comp._id;
    }

    const policy = await Policy.create({
      user: req.user._id,
      policyType,
      planName,
      premium: premiumNum,
      coverage: coverageNum,
      company: companyId,
      status: 'pending',
    });

    res.status(201).json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged-in user's policies
// @route   GET /api/policies/mine
const getMyPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ user: req.user._id })
      .populate('user', 'firstName lastName email aadharNumber')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all policies (admin)
// @route   GET /api/policies
const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({})
      .populate('user', 'firstName lastName email aadharNumber')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update policy status (admin)
// @route   PUT /api/policies/:id
const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const { status, premium, coverage, planName, company } = req.body;

    // Preserve existing dates unless administrator intentionally changes them
    // Only set startDate/endDate when transitioning from pending to active
    if (status && status === 'active' && policy.status !== 'active') {
      const now = new Date();
      const end = new Date(now);
      end.setFullYear(end.getFullYear() + 1);
      policy.startDate = now;
      policy.endDate = end;
      policy.status = 'active';
    } else if (status) {
      // For non-active statuses, preserve existing dates (historical record)
      policy.status = status;
    }

    // Validate endDate > startDate if both are set
    if (policy.startDate && policy.endDate && policy.endDate <= policy.startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    policy.premium = premium !== undefined ? premium : policy.premium;
    policy.coverage = coverage !== undefined ? coverage : policy.coverage;
    policy.planName = planName || policy.planName;
    if (company !== undefined) policy.company = company;

    const updated = await policy.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete policy (admin)
// @route   DELETE /api/policies/:id
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    await policy.deleteOne();
    res.json({ message: 'Policy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create policy applications (admin)
// @route   POST /api/policies/bulk
const bulkCreatePolicies = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No policy rows provided' });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        if (!r.aadharNumber) {
          skipped++;
          errors.push({ row: i + 2, error: 'aadharNumber is required' });
          continue;
        }
        const user = await User.findOne({ aadharNumber: r.aadharNumber });
        if (!user) {
          skipped++;
          errors.push({ row: i + 2, error: `No user found with Aadhar ${r.aadharNumber}` });
          continue;
        }
        const type = (r.policyType || '').toLowerCase();
        if (!type || !r.planName || !r.premium || !r.coverage) {
          skipped++;
          errors.push({ row: i + 2, error: 'policyType, planName, premium and coverage are required' });
          continue;
        }
        // Validate premium and coverage are positive numbers
        const premiumNum = Number(r.premium);
        const coverageNum = Number(r.coverage);
        if (isNaN(premiumNum) || premiumNum < 0) {
          skipped++;
          errors.push({ row: i + 2, error: 'Premium must be a positive number' });
          continue;
        }
        if (isNaN(coverageNum) || coverageNum < 0) {
          skipped++;
          errors.push({ row: i + 2, error: 'Coverage must be a positive number' });
          continue;
        }
        if (!POLICY_TYPES.includes(type)) {
          skipped++;
          errors.push({ row: i + 2, error: `"${r.policyType}" is not a valid insurance type` });
          continue;
        }
        let company = null;
        if (r.companyName) {
          company = await Company.findOne({ name: r.companyName });
          if (!company) {
            skipped++;
            errors.push({ row: i + 2, error: `Company "${r.companyName}" not found` });
            continue;
          }
          // Validate that the company offers this policy type
          if (company.policyTypes.length > 0 && !company.policyTypes.includes(type)) {
            skipped++;
            errors.push({ row: i + 2, error: `Company "${company.name}" does not offer ${type} insurance` });
            continue;
          }
        }
        await Policy.create({
          user: user._id,
          policyType: type,
          planName: r.planName,
          premium: Number(r.premium) || 0,
          coverage: Number(r.coverage) || 0,
          company: company ? company._id : null,
          status: r.status || 'pending',
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

module.exports = { createPolicy, getMyPolicies, getPolicies, updatePolicy, bulkCreatePolicies, deletePolicy };
