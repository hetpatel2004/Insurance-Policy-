const mongoose = require('mongoose');

const customerPolicySchema = new mongoose.Schema(
  {
    policyType: {
      type: String,
      required: [true, 'Policy type is required'],
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
      required: [true, 'Plan name is required'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    premium: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverage: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'active',
    },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    aadharNumber: {
      type: String,
      required: [true, 'Aadhar number is required'],
      unique: true,
      trim: true,
      match: [/^\d{12}$/, 'Aadhar must be exactly 12 digits'],
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    policies: [customerPolicySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
