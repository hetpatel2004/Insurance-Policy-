const Policy = require('../models/Policy');
const User = require('../models/User');
const Company = require('../models/Company');
const RenewalSuggestion = require('../models/RenewalSuggestion');
const { POLICY_TYPES } = require('../utils/policyTypes');

// @desc    Get policies that are expiring soon or already expired (admin)
// @route   GET /api/renewals/expiring?days=90
const getExpiringPolicies = async (req, res) => {
  try {
    const days = Math.max(1, Number(req.query.days) || 90);
    const now = new Date();
    const horizon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const policies = await Policy.find({
      status: { $in: ['active', 'expired'] },
    })
      .populate('user', 'firstName lastName email aadharNumber phone')
      .populate('company', 'name')
      .sort({ endDate: 1 });

    const list = policies
      .filter((p) => p.endDate)
      .map((p) => {
        const daysLeft = Math.ceil((new Date(p.endDate) - now) / (24 * 60 * 60 * 1000));
        return {
          _id: p._id,
          policyType: p.policyType,
          planName: p.planName,
          premium: p.premium,
          coverage: p.coverage,
          status: daysLeft < 0 ? 'expired' : p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          daysLeft,
          user: p.user,
          company: p.company,
        };
      })
      .filter((p) => p.daysLeft <= days)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get renewal suggestions (admin: all, user: own pending)
// @route   GET /api/renewals
const getSuggestions = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? {} : { user: req.user._id };
    const suggestions = await RenewalSuggestion.find(filter)
      .populate('user', 'firstName lastName email aadharNumber')
      .populate('policy', 'planName policyType')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a renewal / new-plan suggestion (admin)
// @route   POST /api/renewals
const createSuggestion = async (req, res) => {
  try {
    const {
      policyId,
      kind = 'renewal',
      policyType,
      planName,
      premium,
      coverage,
      company,
      message,
    } = req.body;

    if (!policyId || !planName || premium === undefined || coverage === undefined) {
      return res.status(400).json({ message: 'policyId, planName, premium and coverage are required' });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    if (policyType && !POLICY_TYPES.includes(policyType)) {
      return res.status(400).json({ message: 'Invalid insurance type' });
    }
    if (company) {
      const comp = await Company.findById(company);
      if (!comp) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    const suggestion = await RenewalSuggestion.create({
      user: policy.user,
      policy: policy._id,
      kind,
      policyType: policyType || policy.policyType,
      planName,
      premium: Number(premium) || 0,
      coverage: Number(coverage) || 0,
      company: company || policy.company || undefined,
      message,
    });

    const populated = await RenewalSuggestion.findById(suggestion._id)
      .populate('user', 'firstName lastName email aadharNumber')
      .populate('policy', 'planName policyType')
      .populate('company', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update suggestion status (user dismisses, admin manages)
// @route   PUT /api/renewals/:id
const updateSuggestionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const suggestion = await RenewalSuggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Users can only update their own suggestions
    if (req.user.role !== 'admin' && suggestion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = suggestion.status;
    suggestion.status = status;
    const updated = await suggestion.save();

    // If suggestion is accepted, update the associated policy
    if (status === 'accepted' && oldStatus !== 'accepted') {
      await Policy.findByIdAndUpdate(suggestion.policy, {
        status: 'active',
      });
      // Renew the policy end date (extend by 1 year)
      const policy = await Policy.findById(suggestion.policy);
      if (policy.status === 'active' && policy.endDate) {
        const now = new Date();
        const end = new Date(now);
        end.setFullYear(end.getFullYear() + 1);
        policy.endDate = end;
        await policy.save();
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpiringPolicies, getSuggestions, createSuggestion, updateSuggestionStatus };
