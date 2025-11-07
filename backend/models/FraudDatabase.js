const mongoose = require('mongoose');

// Suspicious Numbers Database
const suspiciousNumberSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  countryCode: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  fraudType: [{
    type: String,
    enum: ['phishing', 'financial_fraud', 'identity_theft', 'spam', 'scam_call', 'fake_lottery', 'romance_scam', 'tech_support_scam', 'other']
  }],
  reportCount: {
    type: Number,
    default: 1
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'false_positive'],
    default: 'pending'
  },
  lastReportedAt: {
    type: Date,
    default: Date.now
  },
  firstReportedAt: {
    type: Date,
    default: Date.now
  },
  reportedBy: [{
    userId: String,
    timestamp: Date,
    reason: String,
    evidence: String
  }],
  geolocation: {
    country: String,
    state: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ML-based reputation score (0-100, higher = more dangerous)
  reputationScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Fraud Patterns Database
const fraudPatternSchema = new mongoose.Schema({
  patternId: {
    type: String,
    unique: true,
    required: true
  },
  patternType: {
    type: String,
    enum: ['url', 'text', 'keyword', 'phone_pattern'],
    required: true
  },
  pattern: {
    type: String,
    required: true
  },
  regex: {
    type: String
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['phishing_url', 'banking_fraud', 'otp_request', 'lottery_scam', 'romance_scam', 'tech_support', 'financial_offer']
  },
  accuracy: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Fraud Detection Logs
const fraudDetectionLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  detectionType: {
    type: String,
    enum: ['sms', 'whatsapp_message', 'whatsapp_call', 'phone_call'],
    required: true
  },
  suspiciousNumber: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  detectedPatterns: [{
    patternId: String,
    patternType: String,
    confidence: Number
  }],
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  action: {
    type: String,
    enum: ['alert_shown', 'blocked', 'allowed', 'user_ignored'],
    default: 'alert_shown'
  },
  userResponse: {
    type: String,
    enum: ['marked_safe', 'confirmed_fraud', 'ignored', 'blocked_number'],
    default: 'ignored'
  },
  alertTimestamp: {
    type: Date,
    default: Date.now
  },
  responseTimestamp: {
    type: Date
  },
  deviceInfo: {
    platform: String,
    appVersion: String,
    location: {
      country: String,
      state: String,
      city: String
    }
  }
}, {
  timestamps: true
});

// Whitelist for trusted numbers
const trustedNumberSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['family', 'friend', 'business', 'government', 'bank', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Create indexes for better performance
suspiciousNumberSchema.index({ phoneNumber: 1, riskLevel: 1 });
suspiciousNumberSchema.index({ reputationScore: -1 });
fraudPatternSchema.index({ patternType: 1, isActive: 1 });
fraudDetectionLogSchema.index({ userId: 1, alertTimestamp: -1 });
trustedNumberSchema.index({ userId: 1, phoneNumber: 1 });

module.exports = {
  SuspiciousNumber: mongoose.model('SuspiciousNumber', suspiciousNumberSchema),
  FraudPattern: mongoose.model('FraudPattern', fraudPatternSchema),
  FraudDetectionLog: mongoose.model('FraudDetectionLog', fraudDetectionLogSchema),
  TrustedNumber: mongoose.model('TrustedNumber', trustedNumberSchema)
};