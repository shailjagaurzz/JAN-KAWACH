const mongoose = require('mongoose');
const SuspiciousNumber = require('../models/SuspiciousNumber');
const FraudPattern = require('../models/FraudPattern');

// Sample suspicious numbers database
const suspiciousNumbers = [
  {
    number: '+1-800-FRAUD1',
    category: 'investment_scam',
    riskLevel: 'high',
    reportCount: 156,
    description: 'Fake investment opportunity calls',
    lastReported: new Date('2024-10-20'),
    isActive: true
  },
  {
    number: '+91-9876543210',
    category: 'otp_fraud',
    riskLevel: 'critical',
    reportCount: 89,
    description: 'OTP verification scam calls',
    lastReported: new Date('2024-10-24'),
    isActive: true
  },
  {
    number: '+44-20-SCAM123',
    category: 'whatsapp_fraud',
    riskLevel: 'high',
    reportCount: 234,
    description: 'Fake WhatsApp business verification',
    lastReported: new Date('2024-10-23'),
    isActive: true
  },
  {
    number: '+1-555-PHISH1',
    category: 'phishing_calls',
    riskLevel: 'medium',
    reportCount: 67,
    description: 'Bank verification phishing calls',
    lastReported: new Date('2024-10-22'),
    isActive: true
  },
  {
    number: '+91-8888888888',
    category: 'lottery_scam',
    riskLevel: 'high',
    reportCount: 123,
    description: 'Fake lottery winner notifications',
    lastReported: new Date('2024-10-21'),
    isActive: true
  }
];

// Sample fraud patterns
const fraudPatterns = [
  {
    type: 'sms',
    pattern: 'congratulations.*won.*lottery.*claim.*prize',
    riskLevel: 'high',
    category: 'lottery_scam',
    description: 'Lottery scam SMS pattern',
    confidence: 0.85,
    reportCount: 1245,
    isActive: true
  },
  {
    type: 'whatsapp',
    pattern: 'urgent.*verify.*account.*suspended.*click.*link',
    riskLevel: 'critical',
    category: 'phishing',
    description: 'Account verification phishing on WhatsApp',
    confidence: 0.92,
    reportCount: 867,
    isActive: true
  },
  {
    type: 'call',
    pattern: 'bank.*suspicious.*activity.*verify.*details',
    riskLevel: 'high',
    category: 'banking_fraud',
    description: 'Bank verification call scam',
    confidence: 0.78,
    reportCount: 543,
    isActive: true
  },
  {
    type: 'sms',
    pattern: 'otp.*[0-9]{4,6}.*do.*not.*share',
    riskLevel: 'medium',
    category: 'otp_fraud',
    description: 'Suspicious OTP sharing attempts',
    confidence: 0.65,
    reportCount: 432,
    isActive: true
  },
  {
    type: 'whatsapp',
    pattern: 'investment.*opportunity.*guaranteed.*returns.*[0-9]+%',
    riskLevel: 'high',
    category: 'investment_scam',
    description: 'Investment scam with guaranteed returns',
    confidence: 0.89,
    reportCount: 756,
    isActive: true
  },
  {
    type: 'sms',
    pattern: 'click.*here.*to.*claim.*[0-9]+.*rupees',
    riskLevel: 'medium',
    category: 'money_scam',
    description: 'Click to claim money scam',
    confidence: 0.71,
    reportCount: 298,
    isActive: true
  },
  {
    type: 'call',
    pattern: 'courier.*parcel.*detained.*customs.*pay.*fine',
    riskLevel: 'high',
    category: 'customs_scam',
    description: 'Fake customs detention calls',
    confidence: 0.83,
    reportCount: 376,
    isActive: true
  },
  {
    type: 'whatsapp',
    pattern: 'family.*emergency.*need.*money.*hospital',
    riskLevel: 'critical',
    category: 'emergency_scam',
    description: 'Fake family emergency scam',
    confidence: 0.94,
    reportCount: 645,
    isActive: true
  }
];

const seedFraudDatabase = async () => {
  try {
    console.log('🌱 Starting fraud database seeding...');

    // Clear existing data
    await SuspiciousNumber.deleteMany({});
    await FraudPattern.deleteMany({});
    console.log('✅ Cleared existing fraud data');

    // Insert suspicious numbers
    await SuspiciousNumber.insertMany(suspiciousNumbers);
    console.log(`✅ Inserted ${suspiciousNumbers.length} suspicious numbers`);

    // Insert fraud patterns
    await FraudPattern.insertMany(fraudPatterns);
    console.log(`✅ Inserted ${fraudPatterns.length} fraud patterns`);

    console.log('🎉 Fraud database seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`- Suspicious Numbers: ${suspiciousNumbers.length}`);
    console.log(`- Fraud Patterns: ${fraudPatterns.length}`);
    console.log('- Categories covered: Investment, OTP, WhatsApp, Phishing, Lottery, Banking, Emergency scams');
    console.log('- Risk levels: Low, Medium, High, Critical');
    
  } catch (error) {
    console.error('❌ Error seeding fraud database:', error);
  }
};

module.exports = { seedFraudDatabase, suspiciousNumbers, fraudPatterns };