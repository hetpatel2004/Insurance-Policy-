const Company = require('../models/Company');
const { POLICY_TYPES } = require('../utils/policyTypes');

const normalizePolicyTypes = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((t) => String(t).toLowerCase().trim())
    .filter((t) => POLICY_TYPES.includes(t));
};

// @desc    Get all companies
// @route   GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a company (admin)
// @route   POST /api/companies
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, description, policyTypes } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name,
      email,
      phone,
      address,
      description,
      policyTypes: normalizePolicyTypes(policyTypes),
      createdBy: req.user._id,
    });

    res.status(201).json(company);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A company with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a company (admin)
// @route   PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const { name, email, phone, address, description, policyTypes } = req.body;
    company.name = name || company.name;
    company.email = email !== undefined ? email : company.email;
    company.phone = phone !== undefined ? phone : company.phone;
    company.address = address !== undefined ? address : company.address;
    company.description = description !== undefined ? description : company.description;
    if (policyTypes !== undefined) {
      company.policyTypes = normalizePolicyTypes(policyTypes);
    }

    const updated = await company.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A company with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create companies (admin)
// @route   POST /api/companies/bulk
const bulkCreateCompanies = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No company rows provided' });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      try {
        if (!r.name) {
          skipped++;
          errors.push({ row: i + 2, error: 'Company name is required' });
          continue;
        }
        const exists = await Company.findOne({ name: r.name });
        if (exists) {
          skipped++;
          errors.push({ row: i + 2, error: `Company "${r.name}" already exists` });
          continue;
        }
        await Company.create({
          name: r.name,
          email: r.email,
          phone: r.phone,
          address: r.address,
          description: r.description,
          policyTypes: normalizePolicyTypes((r.policyTypes || '').split('|')),
          createdBy: req.user._id,
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

// @desc    Delete a company (admin)
// @route   DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    await company.deleteOne();
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompanies, createCompany, updateCompany, bulkCreateCompanies, deleteCompany };
