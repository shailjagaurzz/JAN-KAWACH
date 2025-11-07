const express = require('express');
const { verifyToken: auth } = require('../middleware/auth');
const FraudDetectionEngine = require('../services/FraudDetectionEngine');
const { SuspiciousNumber, FraudPattern, FraudDetectionLog, TrustedNumber } = require('../models/FraudDatabase');

const router = express.Router();
const fraudDetector = new FraudDetectionEngine();

// Real-time fraud detection endpoint
router.post('/detect', auth, async (req, res) => {
  try {
    const { phoneNumber, content, type, metadata } = req.body;
    
    if (!phoneNumber || !type) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and detection type are required'
      });
    }

    // Validate detection type
    const validTypes = ['sms', 'whatsapp_message', 'whatsapp_call', 'phone_call'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid detection type'
      });
    }

    // Perform fraud detection
    const detectionResult = await fraudDetector.detectFraud({
      phoneNumber,
      content,
      type,
      userId: req.user.id,
      metadata
    });

    // Return detection results
    res.json({
      success: true,
      detection: detectionResult,
      timestamp: new Date().toISOString(),
      message: detectionResult.isFraud ? 'Fraud detected!' : 'No fraud detected'
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Fraud detection service error',
      error: error.message
    });
  }
});

// Bulk fraud detection for multiple messages
router.post('/detect-bulk', auth, async (req, res) => {
  try {
    const { items } = req.body; // Array of detection requests
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const results = [];
    
    for (const item of items) {
      try {
        const detectionResult = await fraudDetector.detectFraud({
          ...item,
          userId: req.user.id
        });
        
        results.push({
          id: item.id || results.length,
          ...detectionResult
        });
      } catch (error) {
        results.push({
          id: item.id || results.length,
          error: error.message,
          isFraud: false
        });
      }
    }

    res.json({
      success: true,
      results,
      processedCount: results.length
    });

  } catch (error) {
    console.error('Bulk fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk fraud detection error',
      error: error.message
    });
  }
});

// Report a fraudulent number
router.post('/report-number', auth, async (req, res) => {
  try {
    const { phoneNumber, fraudType, reason, evidence } = req.body;
    
    if (!phoneNumber || !fraudType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, fraud type, and reason are required'
      });
    }

    const result = await fraudDetector.reportFraudNumber({
      phoneNumber,
      fraudType,
      reportedBy: req.user.id,
      reason,
      evidence
    });

    res.json(result);

  } catch (error) {
    console.error('Error reporting fraud number:', error);
    res.status(500).json({
      success: false,
      message: 'Error reporting fraud number',
      error: error.message
    });
  }
});

// Add number to trusted list
router.post('/trusted-numbers', auth, async (req, res) => {
  try {
    const { phoneNumber, name, category } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const result = await fraudDetector.addTrustedNumber(
      req.user.id,
      phoneNumber,
      name,
      category
    );

    res.json(result);

  } catch (error) {
    console.error('Error adding trusted number:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding trusted number',
      error: error.message
    });
  }
});

// Get user's trusted numbers
router.get('/trusted-numbers', auth, async (req, res) => {
  try {
    const trustedNumbers = await TrustedNumber.find({ userId: req.user.id });
    
    res.json({
      success: true,
      trustedNumbers
    });

  } catch (error) {
    console.error('Error fetching trusted numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trusted numbers',
      error: error.message
    });
  }
});

// Remove number from trusted list
router.delete('/trusted-numbers/:id', auth, async (req, res) => {
  try {
    await TrustedNumber.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Number removed from trusted list'
    });

  } catch (error) {
    console.error('Error removing trusted number:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing trusted number',
      error: error.message
    });
  }
});

// Get fraud detection history
router.get('/detection-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const query = { userId: req.user.id };
    if (type) query.detectionType = type;

    const detectionLogs = await FraudDetectionLog.find(query)
      .sort({ alertTimestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FraudDetectionLog.countDocuments(query);

    res.json({
      success: true,
      detectionLogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching detection history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching detection history',
      error: error.message
    });
  }
});

// Update user response to fraud detection
router.put('/detection-response/:id', auth, async (req, res) => {
  try {
    const { userResponse } = req.body;
    
    const validResponses = ['marked_safe', 'confirmed_fraud', 'ignored', 'blocked_number'];
    if (!validResponses.includes(userResponse)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user response'
      });
    }

    await FraudDetectionLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        userResponse,
        responseTimestamp: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Response updated successfully'
    });

  } catch (error) {
    console.error('Error updating detection response:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating response',
      error: error.message
    });
  }
});

// Get fraud statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get detection stats
    const totalDetections = await FraudDetectionLog.countDocuments({ userId });
    const fraudDetections = await FraudDetectionLog.countDocuments({ 
      userId,
      riskScore: { $gte: 50 }
    });
    
    // Get detection by type
    const detectionByType = await FraudDetectionLog.aggregate([
      { $match: { userId } },
      { $group: { _id: '$detectionType', count: { $sum: 1 } } }
    ]);

    // Get recent high-risk detections
    const recentHighRisk = await FraudDetectionLog.find({
      userId,
      riskScore: { $gte: 60 }
    })
    .sort({ alertTimestamp: -1 })
    .limit(5);

    // Get trusted numbers count
    const trustedCount = await TrustedNumber.countDocuments({ userId });

    res.json({
      success: true,
      statistics: {
        totalDetections,
        fraudDetections,
        detectionByType,
        recentHighRisk,
        trustedNumbersCount: trustedCount,
        fraudDetectionRate: totalDetections > 0 ? (fraudDetections / totalDetections * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Check if a specific number is suspicious
router.get('/check-number/:phoneNumber', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    const suspiciousNumber = await SuspiciousNumber.findOne({ 
      phoneNumber,
      isActive: true 
    });

    const trustedNumber = await TrustedNumber.findOne({
      userId: req.user.id,
      phoneNumber
    });

    res.json({
      success: true,
      phoneNumber,
      isSuspicious: !!suspiciousNumber,
      isTrusted: !!trustedNumber,
      suspiciousDetails: suspiciousNumber ? {
        riskLevel: suspiciousNumber.riskLevel,
        fraudType: suspiciousNumber.fraudType,
        reportCount: suspiciousNumber.reportCount,
        reputationScore: suspiciousNumber.reputationScore
      } : null
    });

  } catch (error) {
    console.error('Error checking number:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking number',
      error: error.message
    });
  }
});

// Get top fraud patterns
router.get('/fraud-patterns', auth, async (req, res) => {
  try {
    const patterns = await FraudPattern.find({ isActive: true })
      .sort({ accuracy: -1 })
      .limit(50);

    res.json({
      success: true,
      patterns: patterns.map(p => ({
        id: p._id,
        type: p.patternType,
        category: p.category,
        description: p.description,
        riskLevel: p.riskLevel
      }))
    });

  } catch (error) {
    console.error('Error fetching fraud patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud patterns',
      error: error.message
    });
  }
});

// Real-time fraud alerts endpoint (for WebSocket or Server-Sent Events)
router.get('/alerts/stream', auth, (req, res) => {
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Fraud alert stream connected' })}\n\n`);

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });
});

module.exports = router;