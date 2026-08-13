const mongoose = require('mongoose');

const renewalSuggestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy is required'],
    },
    kind: {
      type: String,
      enum: ['renewal', 'new-plan'],
      default: 'renewal',
    },
    policyType: {
      type: String,
    },
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
    },
    premium: {
      type: Number,
      required: true,
      min: 0,
    },
    coverage: {
      type: Number,
      required: true,
      min: 0,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RenewalSuggestion', renewalSuggestionSchema);
