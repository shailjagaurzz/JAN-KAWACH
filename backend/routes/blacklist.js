const express = require('express');
const router = express.Router();
const ReportedEntity = require('../models/ReportedEntity');
const User = require('../models/user');
const { verifyToken } = require('../middleware/auth');

// GET /api/blacklist/stats - Get community statistics
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const [
            totalThreats,
            highRiskThreats,
            reportsToday,
            activeWatchers
        ] = await Promise.all([
            ReportedEntity.countDocuments({ isActive: true }),
            ReportedEntity.countDocuments({ isActive: true, threatLevel: 'high' }),
            ReportedEntity.countDocuments({ lastReportedAt: { $gte: today } }),
            ReportedEntity.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$usersWatching' },
                { $group: { _id: '$usersWatching' } },
                { $count: 'total' }
            ])
        ]);

        const stats = {
            totalThreats,
            highRiskThreats,
            reportsToday,
            activeWatchers: activeWatchers[0]?.total || 0
        };
        
        res.json({ success: true, stats });
    } catch (err) {
        console.error('Error fetching community stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

// GET /api/blacklist - Get all blacklisted items
router.get('/', verifyToken, async (req, res) => {
    try {
        const blacklist = await ReportedEntity.find({ isActive: true })
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, blacklist });
    } catch (err) {
        console.error('Error fetching blacklist:', err);
        res.status(500).json({ success: false, message: 'Error fetching blacklist' });
    }
});

// POST /api/blacklist - Add item to blacklist
router.post('/', verifyToken, async (req, res) => {
    try {
        const { type, value, reason, threatLevel } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!type || !value || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Type, value, and reason are required' 
            });
        }

        // Validate type
        if (!['email', 'phone', 'url'].includes(type)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Type must be email, phone, or url' 
            });
        }

        // Check if already exists
        const existing = await ReportedEntity.findOne({ value, type });
        if (existing) {
            // If exists, increment report count and add user to watchers if not already there
            if (!existing.usersWatching.includes(userId)) {
                existing.usersWatching.push(userId);
            }
            existing.reportCount += 1;
            existing.lastReportedAt = new Date();
            await existing.save();
            
            return res.json({ 
                success: true, 
                message: 'Added to your watchlist. Item was already blacklisted.',
                entity: existing
            });
        }

        // Create new blacklist entry
        const blacklistItem = new ReportedEntity({
            value: value.toLowerCase().trim(),
            type,
            reason,
            threatLevel: threatLevel || 'medium',
            reportedBy: userId,
            usersWatching: [userId]
        });

        await blacklistItem.save();
        await blacklistItem.populate('reportedBy', 'name email');

        res.json({ 
            success: true, 
            message: 'Successfully added to blacklist',
            entity: blacklistItem
        });
    } catch (err) {
        console.error('Error adding to blacklist:', err);
        res.status(500).json({ success: false, message: 'Error adding to blacklist' });
    }
});

// POST /api/blacklist/:id/watch - Subscribe to SMS alerts for this blacklisted item
router.post('/:id/watch', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const entity = await ReportedEntity.findById(id);
        if (!entity) {
            return res.status(404).json({ success: false, message: 'Blacklist item not found' });
        }

        if (!entity.usersWatching.includes(userId)) {
            entity.usersWatching.push(userId);
            await entity.save();
        }

        res.json({ success: true, message: 'You will now receive SMS alerts for this threat' });
    } catch (err) {
        console.error('Error subscribing to alerts:', err);
        res.status(500).json({ success: false, message: 'Error subscribing to alerts' });
    }
});

// DELETE /api/blacklist/:id/watch - Unsubscribe from SMS alerts
router.delete('/:id/watch', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const entity = await ReportedEntity.findById(id);
        if (!entity) {
            return res.status(404).json({ success: false, message: 'Blacklist item not found' });
        }

        entity.usersWatching = entity.usersWatching.filter(
            watcherId => watcherId.toString() !== userId.toString()
        );
        await entity.save();

        res.json({ success: true, message: 'Unsubscribed from SMS alerts' });
    } catch (err) {
        console.error('Error unsubscribing from alerts:', err);
        res.status(500).json({ success: false, message: 'Error unsubscribing from alerts' });
    }
});

// DELETE /api/blacklist/:id - Remove item from blacklist (only creator or admin)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const entity = await ReportedEntity.findById(id);
        if (!entity) {
            return res.status(404).json({ success: false, message: 'Blacklist item not found' });
        }

        // Only the creator can delete (or admin in future)
        if (entity.reportedBy.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only the creator can remove this item' 
            });
        }

        await ReportedEntity.findByIdAndDelete(id);
        res.json({ success: true, message: 'Removed from blacklist' });
    } catch (err) {
        console.error('Error removing from blacklist:', err);
        res.status(500).json({ success: false, message: 'Error removing from blacklist' });
    }
});

module.exports = router;