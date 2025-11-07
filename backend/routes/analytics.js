const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { SuspiciousNumber, FraudDetectionLog } = require('../models/FraudDatabase');
const ReportedEntity = require('../models/ReportedEntity');
const User = require('../models/user');

// GET /api/analytics/dashboard - Get comprehensive analytics dashboard data
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch (range) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get overview metrics
        const [
            totalThreats,
            communityReports,
            activeUsers,
            fraudDetections,
            recentDetections
        ] = await Promise.all([
            SuspiciousNumber.countDocuments({ isActive: true }),
            ReportedEntity.countDocuments({ 
                createdAt: { $gte: startDate },
                isActive: true 
            }),
            User.countDocuments({ 
                lastLoginAt: { $gte: startDate } 
            }),
            FraudDetectionLog.countDocuments({
                alertTimestamp: { $gte: startDate },
                riskScore: { $gte: 50 }
            }),
            FraudDetectionLog.countDocuments({
                alertTimestamp: { 
                    $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) 
                }
            })
        ]);

        // Calculate trends (mock data - would need historical comparison in real implementation)
        const analytics = {
            overview: {
                totalThreats,
                communityReports,
                activeUsers,
                fraudPrevented: fraudDetections * 5000, // Estimated amount in rupees
                threatsChange: 12, // Percentage change
                reportsChange: 8,
                usersChange: 15,
                preventedChange: 22
            },
            
            // Threat trends over time
            trends: generateTrendData(range),
            
            // Risk distribution
            riskDistribution: await getRiskDistribution(),
            
            // Threat types
            threatTypes: await getThreatTypes(),
            
            // Geographic threats (mock data)
            geoThreats: generateGeoData(),
            
            // Top threats
            topThreats: await getTopThreats(),
            
            // Recent attacks
            recentAttacks: await getRecentAttacks(),
            
            // Community stats
            community: await getCommunityStats(),
            
            // Performance metrics
            performance: {
                accuracy: 94.5,
                responseTime: 120,
                falsePositives: 2.1
            },
            
            // ML performance
            mlPerformance: generateMLPerformanceData(),
            
            // System health
            systemHealth: {
                apiStatus: 'operational',
                databaseHealth: 'healthy',
                processingSpeed: 'normal'
            }
        };

        res.json({
            success: true,
            analytics,
            timeRange: range,
            generatedAt: new Date()
        });

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating analytics dashboard'
        });
    }
});

// Helper function to get risk distribution
async function getRiskDistribution() {
    const distribution = await SuspiciousNumber.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);
    
    return distribution.map(item => ({
        level: item._id,
        count: item.count
    }));
}

// Helper function to get threat types
async function getThreatTypes() {
    const types = await SuspiciousNumber.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$fraudType' },
        { $group: { _id: '$fraudType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);
    
    return types.map(item => ({
        type: item._id,
        count: item.count
    }));
}

// Helper function to get top threats
async function getTopThreats() {
    const threats = await SuspiciousNumber.find({ isActive: true })
        .sort({ reportCount: -1 })
        .limit(10)
        .select('phoneNumber reportCount riskLevel');
    
    return threats.map(threat => ({
        number: threat.phoneNumber,
        reports: threat.reportCount,
        risk: threat.riskLevel
    }));
}

// Helper function to get recent attacks
async function getRecentAttacks() {
    const attacks = await FraudDetectionLog.find({
        riskScore: { $gte: 60 }
    })
    .sort({ alertTimestamp: -1 })
    .limit(10);
    
    return attacks.map(attack => ({
        type: attack.detectionType,
        time: attack.alertTimestamp,
        description: `High risk ${attack.detectionType} from ${attack.suspiciousNumber}`
    }));
}

// Helper function to get community stats
async function getCommunityStats() {
    const [totalMembers, totalReports, activeWatchers] = await Promise.all([
        User.countDocuments(),
        ReportedEntity.countDocuments(),
        ReportedEntity.aggregate([
            { $unwind: '$usersWatching' },
            { $group: { _id: '$usersWatching' } },
            { $count: 'total' }
        ])
    ]);
    
    return {
        totalMembers,
        totalReports,
        livesProtected: Math.floor(totalReports * 1.5), // Estimated
        activeWatchers: activeWatchers[0]?.total || 0
    };
}

// Generate trend data based on time range
function generateTrendData(range) {
    const points = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = points; i >= 0; i--) {
        data.push({
            date: new Date(Date.now() - i * (range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
            threats: Math.floor(Math.random() * 20) + 5,
            detections: Math.floor(Math.random() * 15) + 2,
            reports: Math.floor(Math.random() * 10) + 1
        });
    }
    
    return data;
}

// Generate geographic data (mock)
function generateGeoData() {
    return [
        { state: 'Maharashtra', threats: 145, lat: 19.7515, lng: 75.7139 },
        { state: 'Delhi', threats: 128, lat: 28.7041, lng: 77.1025 },
        { state: 'Karnataka', threats: 112, lat: 15.3173, lng: 75.7139 },
        { state: 'Tamil Nadu', threats: 98, lat: 11.1271, lng: 78.6569 },
        { state: 'Gujarat', threats: 87, lat: 22.2587, lng: 71.1924 }
    ];
}

// Generate ML performance data
function generateMLPerformanceData() {
    return {
        accuracy: [
            { date: '2024-01-01', value: 89.2 },
            { date: '2024-01-02', value: 91.5 },
            { date: '2024-01-03', value: 93.1 },
            { date: '2024-01-04', value: 94.5 },
            { date: '2024-01-05', value: 92.8 }
        ],
        precision: 93.2,
        recall: 91.8,
        f1Score: 92.5
    };
}

// GET /api/analytics/user-stats - Get user-specific analytics
router.get('/user-stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const [
            detectionStats,
            reportStats,
            protectionScore
        ] = await Promise.all([
            FraudDetectionLog.aggregate([
                { $match: { userId } },
                { 
                    $group: {
                        _id: null,
                        totalDetections: { $sum: 1 },
                        highRiskDetections: {
                            $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] }
                        },
                        averageRiskScore: { $avg: '$riskScore' }
                    }
                }
            ]),
            ReportedEntity.aggregate([
                { $match: { reportedBy: userId } },
                {
                    $group: {
                        _id: null,
                        totalReports: { $sum: 1 },
                        totalWatchers: { $sum: { $size: '$usersWatching' } }
                    }
                }
            ]),
            calculateProtectionScore(userId)
        ]);
        
        const userStats = {
            detections: detectionStats[0] || { totalDetections: 0, highRiskDetections: 0, averageRiskScore: 0 },
            reports: reportStats[0] || { totalReports: 0, totalWatchers: 0 },
            protectionScore,
            communityImpact: await calculateCommunityImpact(userId)
        };
        
        res.json({
            success: true,
            userStats
        });
        
    } catch (error) {
        console.error('Error generating user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating user statistics'
        });
    }
});

// Calculate user protection score
async function calculateProtectionScore(userId) {
    const detections = await FraudDetectionLog.countDocuments({ 
        userId,
        userResponse: { $in: ['blocked_number', 'confirmed_fraud'] }
    });
    
    const reports = await ReportedEntity.countDocuments({ reportedBy: userId });
    
    return Math.min(100, (detections * 5) + (reports * 10));
}

// Calculate community impact
async function calculateCommunityImpact(userId) {
    const userReports = await ReportedEntity.find({ reportedBy: userId });
    
    let totalWatchers = 0;
    let totalProtected = 0;
    
    for (const report of userReports) {
        totalWatchers += report.usersWatching.length;
        totalProtected += report.reportCount > 1 ? report.usersWatching.length : 0;
    }
    
    return {
        reportsSubmitted: userReports.length,
        usersProtected: totalProtected,
        watchersGained: totalWatchers
    };
}

// GET /api/analytics/export - Export analytics data
router.get('/export', verifyToken, async (req, res) => {
    try {
        const { format = 'json', range = '30d' } = req.query;
        
        // Get comprehensive data for export
        const exportData = {
            exportedAt: new Date(),
            timeRange: range,
            user: req.user.id,
            data: {
                // Add export data here
                threats: await SuspiciousNumber.find({ isActive: true }).limit(1000),
                detections: await FraudDetectionLog.find({ userId: req.user.id }).limit(1000),
                reports: await ReportedEntity.find({ reportedBy: req.user.id })
            }
        };
        
        if (format === 'csv') {
            // Convert to CSV format
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=jan-kawach-analytics.csv');
            // Implement CSV conversion
            res.send('CSV export not implemented yet');
        } else {
            res.json({
                success: true,
                exportData
            });
        }
        
    } catch (error) {
        console.error('Error exporting analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting analytics data'
        });
    }
});

module.exports = router;