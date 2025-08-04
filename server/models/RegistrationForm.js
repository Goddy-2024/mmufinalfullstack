import mongoose from 'mongoose';
import crypto from 'crypto';

const registrationFormSchema = new mongoose.Schema({
  formId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  title: {
    type: String,
    required: true,
    default: 'Fellowship Registration Form'
  },
  description: {
    type: String,
    default: 'Welcome to MMU RHSF Fellowship! Please fill out this form to join our community.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from creation
  },
  maxSubmissions: {
    type: Number,
    default: 100
  },
  currentSubmissions: {
    type: Number,
    default: 0
  },
  submissions: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Generate form URL
registrationFormSchema.virtual('formUrl').get(function() {
  return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/${this.formId}`;
});

// Check if form is expired
registrationFormSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Check if form is full
registrationFormSchema.virtual('isFull').get(function() {
  return this.currentSubmissions >= this.maxSubmissions;
});

// Check if form can accept submissions
registrationFormSchema.virtual('canAcceptSubmissions').get(function() {
  return this.isActive && !this.isExpired && !this.isFull;
});

export default mongoose.model('RegistrationForm', registrationFormSchema); 