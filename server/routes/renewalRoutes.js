const express = require('express');
const router = express.Router();
const {
  getExpiringPolicies,
  getSuggestions,
  createSuggestion,
  updateSuggestionStatus,
} = require('../controllers/renewalController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin: expiring policies list
router.get('/expiring', protect, admin, getExpiringPolicies);

// Suggestions: admin sees all, user sees own
router.get('/', protect, getSuggestions);
router.post('/', protect, admin, createSuggestion);
router.put('/:id', protect, updateSuggestionStatus);

module.exports = router;
