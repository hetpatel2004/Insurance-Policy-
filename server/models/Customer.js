const mongoose = require('mongoose');

const customerPolicyRefSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending',
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
    policies: [customerPolicyRefSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, indexes: [
    { aadharNumber: 1 },
    { company: 1 },
  ] }
);

module.exports = mongoose.model('Customer', customerSchema);
