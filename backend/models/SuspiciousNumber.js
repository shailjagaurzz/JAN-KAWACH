const mongoose = require('mongoose');

const suspiciousNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['investment_scam', 'otp_fraud', 'whatsapp_fraud', 'phishing_calls', 
           'lottery_scam', 'banking_fraud', 'customs_scam', 'emergency_scam', 'other']
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  reportCount: {
    type: Number,
    default: 1,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  lastReported: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['user_report', 'community', 'intelligence_feed', 'admin'],
    default: 'user_report'
  },
  verifiedBy: {
    type: String,
    default: 'community'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
suspiciousNumberSchema.index({ category: 1, riskLevel: 1 });
suspiciousNumberSchema.index({ lastReported: -1 });
suspiciousNumberSchema.index({ reportCount: -1 });

module.exports = mongoose.model('SuspiciousNumber', suspiciousNumberSchema);