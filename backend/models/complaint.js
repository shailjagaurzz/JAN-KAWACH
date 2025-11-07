const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: { 
    type: String 
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Online Financial Fraud',
      'Identity Theft',
      'Cyberbullying/Harassment',
      'Phishing/Email Scam',
      'Social Media Crime',
      'Online Trading Fraud',
      'Dating/Matrimonial Fraud',
      'Job Fraud',
      'Data Breach',
      'Ransomware Attack',
      'Website Defacement',
      'Fake News/Misinformation',
      'Online Child Exploitation',
      'Cryptocurrency Fraud',
      'Other Cyber Crime'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  incidentDate: { 
    type: Date 
  },
  location: { 
    type: String 
  },
  description: { 
    type: String, 
    required: true,
    minlength: [50, 'Description must be at least 50 characters long']
  },
  evidenceDescription: { 
    type: String 
  },
  filePaths: [{ 
    type: String 
  }],
  
  // Blockchain Evidence Integration
  blockchainEvidence: [{
    evidenceId: { type: String, required: true },
    blockIndex: { type: Number, required: true },
    blockHash: { type: String, required: true },
    fileName: { type: String, required: true },
    verified: { type: Boolean, default: true }
  }],
  
  // Official Contact Information
  officialType: {
    type: String,
    enum: ['cybercrime', 'police', 'cbi', 'banking'],
    default: 'cybercrime'
  },
  officialContact: {
    title: String,
    phone: String,
    email: String,
    website: String,
    description: String
  },
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  
  // Test Mode Flag
  isTestMode: {
    type: Boolean,
    default: false
  },
  
  // Status and Tracking
  pdfPath: { 
    type: String 
  },
  status: {
    type: String,
    enum: ['submitted', 'test_submission', 'under_review', 'in_progress', 'resolved', 'closed'],
    default: 'submitted'
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  assignedTo: {
    type: String
  },
  resolution: {
    type: String
  },
  resolutionDate: {
    type: Date
  },
  
  // Accountability and Anti-Fraud Measures
  accountabilityLog: {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    submissionTimestamp: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'flagged', 'fake_detected'],
      default: 'pending'
    },
    fraudScore: { type: Number, default: 0 }, // 0-100 scale
    crossCheckResults: [{
      checkType: String, // 'identity_verification', 'duplicate_check', 'content_analysis'
      result: String,
      timestamp: Date,
      details: String
    }]
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
complaintSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ email: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
