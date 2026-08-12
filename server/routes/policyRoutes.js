const express = require('express');
const router = express.Router();
const {
  createPolicy,
  getMyPolicies,
  getPolicies,
  updatePolicy,
  bulkCreatePolicies,
  deletePolicy,
} = require('../controllers/policyController');
const { protect, admin } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createPolicy);
router.get('/mine', protect, getMyPolicies);

// Admin routes
router.get('/', protect, admin, getPolicies);
router.post('/bulk', protect, admin, bulkCreatePolicies);
router.put('/:id', protect, admin, updatePolicy);
router.delete('/:id', protect, admin, deletePolicy);

module.exports = router;
