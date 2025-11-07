const ReportedEntity = require('../models/ReportedEntity');
const User = require('../models/user');
const smsService = require('./smsService');

class ThreatMonitor {
    
    // Check if a sender (email/phone/url) is blacklisted
    async checkThreat(senderValue, senderType = null) {
        try {
            // Auto-detect type if not provided
            if (!senderType) {
                senderType = this.detectType(senderValue);
            }

            const threat = await ReportedEntity.findOne({ 
                value: senderValue.toLowerCase().trim(), 
                type: senderType,
                isActive: true 
            }).populate('usersWatching', 'name email phone');

            return threat;
        } catch (error) {
            console.error('Error checking threat:', error);
            return null;
        }
    }

    // Auto-detect if value is email, phone, or URL
    detectType(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const urlRegex = /^https?:\/\/.+/;

        if (emailRegex.test(value)) return 'email';
        if (phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return 'phone';
        if (urlRegex.test(value)) return 'url';
        
        return 'unknown';
    }

    // Monitor incoming message and send alerts if from blacklisted source
    async monitorMessage(senderValue, senderType, messageContent, recipientUserId) {
        try {
            const threat = await this.checkThreat(senderValue, senderType);
            
            if (!threat) {
                return { isThreat: false };
            }

            console.log(`🚨 Threat detected: ${senderValue} (${senderType}) - Level: ${threat.threatLevel}`);
            
            // Get recipient user info
            const recipient = await User.findById(recipientUserId);
            if (!recipient || !recipient.phone) {
                console.log('Recipient not found or no phone number for SMS');
                return { isThreat: true, threat, alertSent: false };
            }

            // Check if recipient is watching this threat
            const isWatching = threat.usersWatching.some(
                watcher => watcher._id.toString() === recipientUserId.toString()
            );

            if (!isWatching) {
                console.log('Recipient not watching this threat, no SMS sent');
                return { isThreat: true, threat, alertSent: false };
            }

            // Send SMS alert
            const smsResult = await smsService.sendThreatAlert(
                recipient.phone, 
                threat.type, 
                threat.value,
                threat.threatLevel
            );

            console.log('SMS alert result:', smsResult);

            return { 
                isThreat: true, 
                threat, 
                alertSent: smsResult.success,
                smsResult 
            };

        } catch (error) {
            console.error('Error monitoring message:', error);
            return { isThreat: false, error: error.message };
        }
    }

    // Batch check multiple sources at once
    async checkMultipleThreats(sources) {
        try {
            const results = await Promise.all(
                sources.map(async (source) => {
                    const threat = await this.checkThreat(source.value, source.type);
                    return { ...source, threat, isThreat: !!threat };
                })
            );
            return results;
        } catch (error) {
            console.error('Error in batch threat check:', error);
            return [];
        }
    }

    // Add user's phone number for SMS notifications
    async updateUserPhone(userId, phoneNumber) {
        try {
            const user = await User.findByIdAndUpdate(
                userId, 
                { phone: phoneNumber }, 
                { new: true }
            );
            return user;
        } catch (error) {
            console.error('Error updating user phone:', error);
            return null;
        }
    }
}

module.exports = new ThreatMonitor();