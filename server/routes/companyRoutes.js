const express = require('express');
const router = express.Router();
const {
  getCompanies,
  createCompany,
  updateCompany,
  bulkCreateCompanies,
  deleteCompany,
} = require('../controllers/companyController');
const { protect, admin } = require('../middleware/authMiddleware');

// Any authenticated user can list companies (needed for the apply-policy form)
router.get('/', protect, getCompanies);

// Admin only
router.post('/', protect, admin, createCompany);
router.post('/bulk', protect, admin, bulkCreateCompanies);
router.put('/:id', protect, admin, updateCompany);
router.delete('/:id', protect, admin, deleteCompany);

module.exports = router;
