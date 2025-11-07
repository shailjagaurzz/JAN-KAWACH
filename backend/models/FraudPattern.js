const mongoose = require('mongoose');

const fraudPatternSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['sms', 'whatsapp', 'call', 'email', 'web'],
    index: true
  },
  pattern: {
    type: String,
    required: true,
    index: true
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['investment_scam', 'otp_fraud', 'whatsapp_fraud', 'phishing', 
           'lottery_scam', 'banking_fraud', 'customs_scam', 'emergency_scam', 
           'money_scam', 'other']
  },
  description: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.5
  },
  reportCount: {
    type: Number,
    default: 1,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'or', 'pa']
  },
  source: {
    type: String,
    enum: ['ml_training', 'user_report', 'intelligence_feed', 'admin'],
    default: 'ml_training'
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  falsePositiveRate: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fraudPatternSchema.index({ type: 1, category: 1 });
fraudPatternSchema.index({ riskLevel: 1, confidence: -1 });
fraudPatternSchema.index({ pattern: 'text' }); // Text search index

// Static method to find matching patterns
fraudPatternSchema.statics.findMatchingPatterns = function(text, type) {
  return this.find({
    type: type,
    isActive: true,
    $or: [
      { pattern: { $regex: text, $options: 'i' } },
      { $text: { $search: text } }
    ]
  }).sort({ confidence: -1, riskLevel: -1 });
};

module.exports = mongoose.model('FraudPattern', fraudPatternSchema);