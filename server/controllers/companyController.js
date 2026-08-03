const Company = require('../models/Company');

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
    const { name, email, phone, address, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await Company.create({
      name,
      email,
      phone,
      address,
      description,
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

    const { name, email, phone, address, description } = req.body;
    company.name = name || company.name;
    company.email = email !== undefined ? email : company.email;
    company.phone = phone !== undefined ? phone : company.phone;
    company.address = address !== undefined ? address : company.address;
    company.description = description !== undefined ? description : company.description;

    const updated = await company.save();
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A company with this name already exists' });
    }
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

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany };
