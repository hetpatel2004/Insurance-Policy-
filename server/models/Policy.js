const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    policyType: {
      type: String,
      required: true,
      enum: [
        'health',
        'life',
        'home',
        'auto',
        'travel',
        'retirement',
        'personal-accident',
        'two-wheeler',
        'fire',
        'workman-compensation',
        'household',
        'shopkeeper',
        'burglary',
      ],
    },
    planName: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
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
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
