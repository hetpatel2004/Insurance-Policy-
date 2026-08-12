const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getMyCustomer,
  createCustomer,
  updateCustomer,
  bulkCreateCustomers,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Logged-in user: get own customer record (null if not in the customer list)
router.get('/me', protect, getMyCustomer);

// Admin only
router.get('/', protect, admin, getCustomers);
router.post('/', protect, admin, createCustomer);
router.post('/bulk', protect, admin, bulkCreateCustomers);
router.put('/:id', protect, admin, updateCustomer);
router.delete('/:id', protect, admin, deleteCustomer);

module.exports = router;
