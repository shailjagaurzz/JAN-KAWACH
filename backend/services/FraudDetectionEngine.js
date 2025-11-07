const { SuspiciousNumber, FraudPattern, FraudDetectionLog, TrustedNumber } = require('../models/FraudDatabase');

class FraudDetectionEngine {
  constructor() {
    this.initialize();
  }

  async initialize() {
    // Load fraud patterns into memory for faster detection
    this.fraudPatterns = await FraudPattern.find({ isActive: true });
    console.log(`🔍 Loaded ${this.fraudPatterns.length} fraud patterns`);
    
    // Initialize ML models (in a real implementation, load trained models)
    this.initializeMLModels();
  }

  initializeMLModels() {
    // Phishing URL patterns
    this.phishingPatterns = [
      /bit\.ly\/\w+/i,
      /tinyurl\.com\/\w+/i,
      /t\.co\/\w+/i,
      /goo\.gl\/\w+/i,
      /ow\.ly\/\w+/i,
      /click.*here.*urgent/i,
      /verify.*account.*immediately/i,
      /suspended.*account/i,
      /congratulations.*winner/i,
      /claim.*prize.*now/i
    ];

    // Financial fraud keywords
    this.financialFraudKeywords = [
      'bank account suspended', 'urgent verification required', 'click to verify',
      'congratulations you have won', 'claim your prize', 'lottery winner',
      'transfer money immediately', 'send otp', 'share your pin',
      'credit card expired', 'update kyc', 'account will be closed',
      'tax refund', 'government benefit', 'corona relief fund'
    ];

    // Suspicious phone patterns (Indian context)
    this.suspiciousPhonePatterns = [
      /^\+1\d{10}$/, // US numbers often used for scams
      /^\+44\d{10}$/, // UK numbers
      /^\+234\d{10}$/, // Nigeria numbers
      /^\+92\d{10}$/, // Pakistan numbers
      /^[0-9]{5}$/, // Short codes
      /^140\d{4}$/, // Common spam patterns
    ];
  }

  // Main fraud detection function
  async detectFraud(data) {
    const { phoneNumber, content, type, userId } = data;
    
    try {
      let riskScore = 0;
      let detectedPatterns = [];
      let riskLevel = 'low';

      // Step 1: Check if number is in suspicious database
      const suspiciousNumberCheck = await this.checkSuspiciousNumber(phoneNumber);
      if (suspiciousNumberCheck.isSuspicious) {
        riskScore += suspiciousNumberCheck.score;
        detectedPatterns.push({
          type: 'suspicious_number',
          confidence: suspiciousNumberCheck.confidence,
          details: suspiciousNumberCheck.details
        });
      }

      // Step 2: Check if number is in user's trusted list
      const trustedCheck = await this.checkTrustedNumber(phoneNumber, userId);
      if (trustedCheck.isTrusted) {
        riskScore *= 0.1; // Reduce risk significantly for trusted numbers
      }

      // Step 3: Content analysis (if content exists)
      if (content) {
        const contentAnalysis = await this.analyzeContent(content);
        riskScore += contentAnalysis.score;
        detectedPatterns = detectedPatterns.concat(contentAnalysis.patterns);
      }

      // Step 4: Phone pattern analysis
      const phonePatternAnalysis = this.analyzePhonePattern(phoneNumber);
      riskScore += phonePatternAnalysis.score;
      if (phonePatternAnalysis.suspicious) {
        detectedPatterns.push(phonePatternAnalysis.pattern);
      }

      // Step 5: Determine risk level
      if (riskScore >= 80) riskLevel = 'critical';
      else if (riskScore >= 60) riskLevel = 'high';
      else if (riskScore >= 40) riskLevel = 'medium';
      else riskLevel = 'low';

      // Step 6: Log detection
      await this.logDetection({
        userId,
        detectionType: type,
        suspiciousNumber: phoneNumber,
        content,
        detectedPatterns,
        riskScore,
        riskLevel
      });

      return {
        isFraud: riskScore >= 50, // Threshold for fraud alert
        riskScore,
        riskLevel,
        detectedPatterns,
        alertMessage: this.generateAlertMessage(riskLevel, detectedPatterns),
        recommendedAction: this.getRecommendedAction(riskLevel)
      };

    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        isFraud: false,
        riskScore: 0,
        riskLevel: 'low',
        error: 'Detection failed'
      };
    }
  }

  // Check if phone number is in suspicious database
  async checkSuspiciousNumber(phoneNumber) {
    try {
      const suspiciousNumber = await SuspiciousNumber.findOne({ 
        phoneNumber: phoneNumber,
        isActive: true 
      });

      if (suspiciousNumber) {
        return {
          isSuspicious: true,
          score: suspiciousNumber.reputationScore,
          confidence: Math.min(suspiciousNumber.reportCount * 10, 100),
          details: {
            riskLevel: suspiciousNumber.riskLevel,
            fraudType: suspiciousNumber.fraudType,
            reportCount: suspiciousNumber.reportCount
          }
        };
      }

      return { isSuspicious: false, score: 0 };
    } catch (error) {
      console.error('Error checking suspicious number:', error);
      return { isSuspicious: false, score: 0 };
    }
  }

  // Check if number is in user's trusted list
  async checkTrustedNumber(phoneNumber, userId) {
    try {
      const trustedNumber = await TrustedNumber.findOne({
        userId,
        phoneNumber
      });

      return { isTrusted: !!trustedNumber };
    } catch (error) {
      console.error('Error checking trusted number:', error);
      return { isTrusted: false };
    }
  }

  // Analyze message/call content for fraud patterns
  async analyzeContent(content) {
    let score = 0;
    let detectedPatterns = [];

    const lowerContent = content.toLowerCase();

    // Check against known fraud patterns from database
    for (const pattern of this.fraudPatterns) {
      let regex;
      try {
        regex = new RegExp(pattern.regex || pattern.pattern, 'i');
        if (regex.test(content)) {
          const patternScore = this.getRiskScore(pattern.riskLevel);
          score += patternScore;
          detectedPatterns.push({
            type: 'database_pattern',
            pattern: pattern.pattern,
            category: pattern.category,
            confidence: pattern.accuracy * 100,
            score: patternScore
          });
        }
      } catch (regexError) {
        // Handle invalid regex patterns
        if (lowerContent.includes(pattern.pattern.toLowerCase())) {
          const patternScore = this.getRiskScore(pattern.riskLevel);
          score += patternScore;
          detectedPatterns.push({
            type: 'keyword_match',
            pattern: pattern.pattern,
            category: pattern.category,
            confidence: 70,
            score: patternScore
          });
        }
      }
    }

    // Check phishing URLs
    for (const urlPattern of this.phishingPatterns) {
      if (urlPattern.test(content)) {
        score += 30;
        detectedPatterns.push({
          type: 'phishing_url',
          confidence: 85,
          score: 30
        });
      }
    }

    // Check financial fraud keywords
    for (const keyword of this.financialFraudKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        score += 25;
        detectedPatterns.push({
          type: 'financial_fraud_keyword',
          keyword: keyword,
          confidence: 80,
          score: 25
        });
      }
    }

    // Advanced ML-like analysis
    score += this.advancedContentAnalysis(content);

    return { score: Math.min(score, 100), patterns: detectedPatterns };
  }

  // Advanced content analysis using heuristics
  advancedContentAnalysis(content) {
    let score = 0;
    const lowerContent = content.toLowerCase();

    // Urgency indicators
    const urgencyWords = ['urgent', 'immediate', 'asap', 'expire', 'suspend', 'block', 'deadline'];
    const urgencyCount = urgencyWords.filter(word => lowerContent.includes(word)).length;
    score += urgencyCount * 5;

    // Money-related terms
    const moneyTerms = ['money', 'cash', 'rupees', 'dollars', 'payment', 'transfer', 'account', 'bank'];
    const moneyCount = moneyTerms.filter(term => lowerContent.includes(term)).length;
    score += moneyCount * 3;

    // Suspicious actions
    const suspiciousActions = ['click here', 'download', 'install', 'verify', 'confirm', 'update'];
    const actionCount = suspiciousActions.filter(action => lowerContent.includes(action)).length;
    score += actionCount * 4;

    // Number patterns (OTP requests, amounts)
    const numberPatterns = content.match(/\d{4,}/g);
    if (numberPatterns && numberPatterns.length > 2) {
      score += 10; // Multiple numbers often indicate scams
    }

    // Suspicious formatting (excessive caps, symbols)
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) score += 15;

    const symbolCount = (content.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/g) || []).length;
    if (symbolCount > content.length * 0.1) score += 10;

    return Math.min(score, 50);
  }

  // Analyze phone number patterns
  analyzePhonePattern(phoneNumber) {
    let score = 0;
    let suspicious = false;
    let pattern = null;

    for (const suspiciousPattern of this.suspiciousPhonePatterns) {
      if (suspiciousPattern.test(phoneNumber)) {
        score += 20;
        suspicious = true;
        pattern = {
          type: 'suspicious_phone_pattern',
          confidence: 75,
          score: 20
        };
        break;
      }
    }

    // Check for unusual patterns
    if (phoneNumber.length < 6 || phoneNumber.length > 15) {
      score += 15;
      suspicious = true;
    }

    // Check for repeated digits (common in spam)
    const digitCounts = {};
    for (const digit of phoneNumber.replace(/\D/g, '')) {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }
    
    const maxRepeats = Math.max(...Object.values(digitCounts));
    if (maxRepeats > phoneNumber.length * 0.4) {
      score += 25;
      suspicious = true;
    }

    return { score, suspicious, pattern };
  }

  // Convert risk level to numeric score
  getRiskScore(riskLevel) {
    const scores = {
      'low': 10,
      'medium': 25,
      'high': 40,
      'critical': 60
    };
    return scores[riskLevel] || 10;
  }

  // Generate alert message based on detection results
  generateAlertMessage(riskLevel, patterns) {
    const messages = {
      'critical': '🚨 CRITICAL FRAUD ALERT! This appears to be a dangerous scam attempt.',
      'high': '⚠️ HIGH RISK FRAUD DETECTED! This message/call is highly suspicious.',
      'medium': '⚠️ SUSPICIOUS ACTIVITY detected. Please be cautious.',
      'low': 'ℹ️ Low risk detected. Stay alert.'
    };

    let message = messages[riskLevel] || messages['low'];

    // Add specific warnings based on detected patterns
    const patternTypes = patterns.map(p => p.type);
    
    if (patternTypes.includes('phishing_url')) {
      message += '\n🔗 Contains suspicious links - DO NOT CLICK!';
    }
    
    if (patternTypes.includes('financial_fraud_keyword')) {
      message += '\n💰 Contains financial fraud indicators - NEVER share OTP/PIN!';
    }
    
    if (patternTypes.includes('suspicious_number')) {
      message += '\n📞 This number has been reported for fraud by other users.';
    }

    return message;
  }

  // Get recommended action based on risk level
  getRecommendedAction(riskLevel) {
    const actions = {
      'critical': {
        action: 'BLOCK_IMMEDIATELY',
        instructions: [
          'Block this number immediately',
          'Do not respond or engage',
          'Report to authorities if money is involved',
          'Share with family/friends as warning'
        ]
      },
      'high': {
        action: 'AVOID_ENGAGEMENT',
        instructions: [
          'Do not respond to this message/call',
          'Do not click any links',
          'Consider blocking this number',
          'Report as spam'
        ]
      },
      'medium': {
        action: 'BE_CAUTIOUS',
        instructions: [
          'Be very careful with this interaction',
          'Verify sender through other means',
          'Do not share personal information',
          'Monitor for more suspicious activity'
        ]
      },
      'low': {
        action: 'STAY_ALERT',
        instructions: [
          'Stay alert for any unusual requests',
          'Verify important information independently'
        ]
      }
    };

    return actions[riskLevel] || actions['low'];
  }

  // Log fraud detection for analytics and improvement
  async logDetection(data) {
    try {
      const log = new FraudDetectionLog(data);
      await log.save();
    } catch (error) {
      console.error('Error logging detection:', error);
    }
  }

  // Add number to suspicious database
  async reportFraudNumber(data) {
    const { phoneNumber, fraudType, reportedBy, reason, evidence } = data;
    
    try {
      let suspiciousNumber = await SuspiciousNumber.findOne({ phoneNumber });
      
      if (suspiciousNumber) {
        // Update existing record
        suspiciousNumber.reportCount += 1;
        suspiciousNumber.lastReportedAt = new Date();
        suspiciousNumber.reportedBy.push({
          userId: reportedBy,
          timestamp: new Date(),
          reason,
          evidence
        });
        
        // Increase reputation score based on reports
        suspiciousNumber.reputationScore = Math.min(
          suspiciousNumber.reputationScore + (10 / suspiciousNumber.reportCount), 
          100
        );
        
        // Update risk level based on reputation score
        if (suspiciousNumber.reputationScore >= 80) suspiciousNumber.riskLevel = 'critical';
        else if (suspiciousNumber.reputationScore >= 60) suspiciousNumber.riskLevel = 'high';
        else if (suspiciousNumber.reputationScore >= 40) suspiciousNumber.riskLevel = 'medium';
        
        await suspiciousNumber.save();
      } else {
        // Create new suspicious number entry
        suspiciousNumber = new SuspiciousNumber({
          phoneNumber,
          countryCode: phoneNumber.startsWith('+91') ? '+91' : 'unknown',
          fraudType: Array.isArray(fraudType) ? fraudType : [fraudType],
          reportedBy: [{
            userId: reportedBy,
            timestamp: new Date(),
            reason,
            evidence
          }],
          reputationScore: 60 // Start with medium-high score for new reports
        });
        
        await suspiciousNumber.save();
      }
      
      return { success: true, message: 'Number reported successfully' };
    } catch (error) {
      console.error('Error reporting fraud number:', error);
      return { success: false, error: error.message };
    }
  }

  // Add number to user's trusted list
  async addTrustedNumber(userId, phoneNumber, name, category = 'other') {
    try {
      const trustedNumber = new TrustedNumber({
        userId,
        phoneNumber,
        name,
        category
      });
      
      await trustedNumber.save();
      return { success: true, message: 'Number added to trusted list' };
    } catch (error) {
      console.error('Error adding trusted number:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = FraudDetectionEngine;