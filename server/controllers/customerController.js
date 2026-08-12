const Customer = require('../models/Customer');
const Company = require('../models/Company');
const { POLICY_TYPES } = require('../utils/policyTypes');

// @desc    Get all customers (admin)
// @route   GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .populate('company', 'name')
      .populate('policies.company', 'name')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer record for the logged-in user (by Aadhar)
// @route   GET /api/customers/me
const getMyCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ aadharNumber: req.user.aadharNumber })
      .populate('company', 'name')
      .populate('policies.company', 'name');
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer (admin)
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { aadharNumber, name, email, phone, company, policies } = req.body;
    if (!aadharNumber || !name) {
      return res.status(400).json({ message: 'Aadhar number and customer name are required' });
    }

    const exists = await Customer.findOne({ aadharNumber });
    if (exists) {
      return res.status(400).json({ message: 'A customer with this Aadhar is already recorded' });
    }

    const customer = await Customer.create({
      aadharNumber,
      name,
      email,
      phone,
      company,
      policies: Array.isArray(policies) ? policies : [],
      createdBy: req.user._id,
    });

    res.status(201).json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A customer with this Aadhar is already recorded' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a customer (admin)
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const { aadharNumber, name, email, phone, company, policies } = req.body;
    if (aadharNumber) customer.aadharNumber = aadharNumber;
    if (name) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (company !== undefined) customer.company = company;
    if (Array.isArray(policies)) customer.policies = policies;

    const updated = await customer.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A customer with this Aadhar is already recorded' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a customer (admin)
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await customer.deleteOne();
    res.json({ message: 'Customer removed from list' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create customers (admin) — one optional policy per row
// @route   POST /api/customers/bulk
const bulkCreateCustomers = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No customer rows provided' });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        if (!r.aadharNumber || !r.name) {
          skipped++;
          errors.push({ row: i + 2, error: 'aadharNumber and name are required' });
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
        }

        let policy = null;
        if (r.policyType && r.planName) {
          const type = r.policyType.toLowerCase();
          if (!POLICY_TYPES.includes(type)) {
            skipped++;
            errors.push({ row: i + 2, error: `"${r.policyType}" is not a valid insurance type` });
            continue;
          }
          policy = {
            policyType: type,
            planName: r.planName,
            company: company ? company._id : null,
            premium: Number(r.premium) || 0,
            coverage: Number(r.coverage) || 0,
            status: r.status || 'active',
          };
        }

        const existing = await Customer.findOne({ aadharNumber: r.aadharNumber });
        if (existing) {
          existing.name = r.name || existing.name;
          existing.email = r.email || existing.email;
          existing.phone = r.phone || existing.phone;
          if (company) existing.company = company._id;
          if (policy) existing.policies.push(policy);
          await existing.save();
          updated++;
        } else {
          await Customer.create({
            aadharNumber: r.aadharNumber,
            name: r.name,
            email: r.email,
            phone: r.phone,
            company: company ? company._id : null,
            policies: policy ? [policy] : [],
            createdBy: req.user._id,
          });
          created++;
        }
      } catch (e) {
        skipped++;
        errors.push({ row: i + 2, error: e.message });
      }
    }

    res.json({ created, updated, skipped, errors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCustomers, getMyCustomer, createCustomer, updateCustomer, bulkCreateCustomers, deleteCustomer };
