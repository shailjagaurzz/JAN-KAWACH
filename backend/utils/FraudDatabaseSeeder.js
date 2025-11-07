const { SuspiciousNumber, FraudPattern } = require('./models/FraudDatabase');

class FraudDatabaseSeeder {
  static async seedFraudPatterns() {
    console.log('🌱 Seeding fraud patterns...');
    
    const fraudPatterns = [
      // Phishing URL patterns
      {
        patternId: 'phishing_url_1',
        patternType: 'url',
        pattern: 'bit.ly',
        regex: 'bit\\.ly\\/\\w+',
        riskLevel: 'high',
        description: 'Shortened URL from bit.ly - commonly used in phishing',
        category: 'phishing_url',
        accuracy: 0.7
      },
      {
        patternId: 'phishing_url_2',
        patternType: 'url',
        pattern: 'tinyurl.com',
        regex: 'tinyurl\\.com\\/\\w+',
        riskLevel: 'high',
        description: 'TinyURL shortened links',
        category: 'phishing_url',
        accuracy: 0.7
      },
      
      // Banking fraud patterns
      {
        patternId: 'banking_fraud_1',
        patternType: 'text',
        pattern: 'your account has been suspended',
        regex: 'your\\s+account\\s+has\\s+been\\s+suspended',
        riskLevel: 'critical',
        description: 'Account suspension scam',
        category: 'banking_fraud',
        accuracy: 0.95
      },
      {
        patternId: 'banking_fraud_2',
        patternType: 'text',
        pattern: 'verify your account immediately',
        regex: 'verify\\s+your\\s+account\\s+immediately',
        riskLevel: 'critical',
        description: 'Urgent account verification scam',
        category: 'banking_fraud',
        accuracy: 0.9
      },
      {
        patternId: 'banking_fraud_3',
        patternType: 'text',
        pattern: 'update your kyc',
        regex: 'update\\s+your\\s+kyc',
        riskLevel: 'high',
        description: 'KYC update scam',
        category: 'banking_fraud',
        accuracy: 0.85
      },
      
      // OTP/PIN request patterns
      {
        patternId: 'otp_fraud_1',
        patternType: 'text',
        pattern: 'send your otp',
        regex: 'send\\s+your\\s+otp',
        riskLevel: 'critical',
        description: 'OTP sharing request',
        category: 'otp_request',
        accuracy: 0.98
      },
      {
        patternId: 'otp_fraud_2',
        patternType: 'text',
        pattern: 'share your pin',
        regex: 'share\\s+your\\s+pin',
        riskLevel: 'critical',
        description: 'PIN sharing request',
        category: 'otp_request',
        accuracy: 0.98
      },
      
      // Lottery/Prize scams
      {
        patternId: 'lottery_scam_1',
        patternType: 'text',
        pattern: 'congratulations you have won',
        regex: 'congratulations\\s+you\\s+have\\s+won',
        riskLevel: 'high',
        description: 'Fake lottery win announcement',
        category: 'lottery_scam',
        accuracy: 0.92
      },
      {
        patternId: 'lottery_scam_2',
        patternType: 'text',
        pattern: 'claim your prize now',
        regex: 'claim\\s+your\\s+prize\\s+now',
        riskLevel: 'high',
        description: 'Prize claiming scam',
        category: 'lottery_scam',
        accuracy: 0.88
      },
      
      // Tech support scams
      {
        patternId: 'tech_support_1',
        patternType: 'text',
        pattern: 'your computer has been infected',
        regex: 'your\\s+computer\\s+has\\s+been\\s+infected',
        riskLevel: 'high',
        description: 'Fake computer infection warning',
        category: 'tech_support',
        accuracy: 0.9
      },
      {
        patternId: 'tech_support_2',
        patternType: 'text',
        pattern: 'microsoft technical support',
        regex: 'microsoft\\s+technical\\s+support',
        riskLevel: 'high',
        description: 'Fake Microsoft support',
        category: 'tech_support',
        accuracy: 0.85
      },
      
      // Financial offer scams
      {
        patternId: 'loan_scam_1',
        patternType: 'text',
        pattern: 'instant loan approved',
        regex: 'instant\\s+loan\\s+approved',
        riskLevel: 'medium',
        description: 'Fake loan approval',
        category: 'financial_offer',
        accuracy: 0.75
      },
      {
        patternId: 'investment_scam_1',
        patternType: 'text',
        pattern: 'guaranteed returns',
        regex: 'guaranteed\\s+returns',
        riskLevel: 'medium',
        description: 'Investment scam with guaranteed returns',
        category: 'financial_offer',
        accuracy: 0.8
      },
      
      // Romance scams
      {
        patternId: 'romance_scam_1',
        patternType: 'text',
        pattern: 'i am stuck in airport',
        regex: 'i\\s+am\\s+stuck\\s+in\\s+airport',
        riskLevel: 'high',
        description: 'Airport emergency romance scam',
        category: 'romance_scam',
        accuracy: 0.9
      },
      
      // COVID-19 related scams
      {
        patternId: 'covid_scam_1',
        patternType: 'text',
        pattern: 'corona relief fund',
        regex: 'corona\\s+relief\\s+fund',
        riskLevel: 'high',
        description: 'Fake COVID relief fund',
        category: 'financial_offer',
        accuracy: 0.85
      },
      
      // Government impersonation
      {
        patternId: 'govt_scam_1',
        patternType: 'text',
        pattern: 'income tax department',
        regex: 'income\\s+tax\\s+department',
        riskLevel: 'high',
        description: 'Fake income tax communication',
        category: 'banking_fraud',
        accuracy: 0.8
      },
      
      // Urgency indicators
      {
        patternId: 'urgency_1',
        patternType: 'text',
        pattern: 'urgent action required',
        regex: 'urgent\\s+action\\s+required',
        riskLevel: 'medium',
        description: 'Urgent action pressure tactic',
        category: 'phishing_url',
        accuracy: 0.7
      },
      
      // Suspicious phone patterns
      {
        patternId: 'phone_pattern_1',
        patternType: 'phone_pattern',
        pattern: '+1',
        regex: '^\\+1\\d{10}$',
        riskLevel: 'medium',
        description: 'US number used for scams in India',
        category: 'phishing_url',
        accuracy: 0.6
      },
      {
        patternId: 'phone_pattern_2',
        patternType: 'phone_pattern',
        pattern: '140',
        regex: '^140\\d{4}$',
        riskLevel: 'high',
        description: 'Known spam number pattern',
        category: 'phishing_url',
        accuracy: 0.8
      }
    ];

    try {
      // Clear existing patterns
      await FraudPattern.deleteMany({});
      
      // Insert new patterns
      await FraudPattern.insertMany(fraudPatterns);
      
      console.log(`✅ Successfully seeded ${fraudPatterns.length} fraud patterns`);
    } catch (error) {
      console.error('❌ Error seeding fraud patterns:', error);
    }
  }

  static async seedSuspiciousNumbers() {
    console.log('🌱 Seeding suspicious numbers...');
    
    const suspiciousNumbers = [
      {
        phoneNumber: '+1234567890',
        countryCode: '+1',
        riskLevel: 'critical',
        fraudType: ['phishing', 'financial_fraud'],
        reportCount: 25,
        reputationScore: 95,
        verificationStatus: 'verified'
      },
      {
        phoneNumber: '+447123456789',
        countryCode: '+44',
        riskLevel: 'high',
        fraudType: ['lottery_scam', 'romance_scam'],
        reportCount: 18,
        reputationScore: 85,
        verificationStatus: 'verified'
      },
      {
        phoneNumber: '1401234',
        countryCode: 'unknown',
        riskLevel: 'high',
        fraudType: ['spam', 'phishing'],
        reportCount: 32,
        reputationScore: 88,
        verificationStatus: 'verified'
      },
      {
        phoneNumber: '+923456789012',
        countryCode: '+92',
        riskLevel: 'medium',
        fraudType: ['financial_fraud'],
        reportCount: 8,
        reputationScore: 65,
        verificationStatus: 'pending'
      },
      {
        phoneNumber: '+2341234567890',
        countryCode: '+234',
        riskLevel: 'critical',
        fraudType: ['romance_scam', 'financial_fraud'],
        reportCount: 45,
        reputationScore: 98,
        verificationStatus: 'verified'
      }
    ];

    try {
      // Clear existing suspicious numbers
      await SuspiciousNumber.deleteMany({});
      
      // Insert new suspicious numbers
      for (const number of suspiciousNumbers) {
        await SuspiciousNumber.create({
          ...number,
          reportedBy: [{
            userId: 'system',
            timestamp: new Date(),
            reason: 'Database seeding',
            evidence: 'Initial system data'
          }]
        });
      }
      
      console.log(`✅ Successfully seeded ${suspiciousNumbers.length} suspicious numbers`);
    } catch (error) {
      console.error('❌ Error seeding suspicious numbers:', error);
    }
  }

  static async seedAll() {
    console.log('🚀 Starting fraud database seeding...');
    
    await this.seedFraudPatterns();
    await this.seedSuspiciousNumbers();
    
    console.log('✅ Fraud database seeding completed!');
  }
}

module.exports = FraudDatabaseSeeder;