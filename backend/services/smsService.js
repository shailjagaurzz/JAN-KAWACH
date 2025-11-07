const axios = require('axios');

class SMSService {
    constructor() {
        // You can use Twilio, AWS SNS, or any SMS service
        // For demo, I'll use a generic HTTP SMS API structure
        this.apiKey = process.env.SMS_API_KEY;
        this.apiUrl = process.env.SMS_API_URL || 'https://api.textlocal.in/send/';
        this.sender = process.env.SMS_SENDER || 'SECURITY';
    }

    async sendSMS(phoneNumber, message) {
        try {
            if (!this.apiKey) {
                console.log('SMS API key not configured. SMS notification would be sent:', { phoneNumber, message });
                return { success: true, message: 'SMS simulated (no API key)' };
            }

            // Example for Textlocal API (replace with your SMS provider)
            const response = await axios.post(this.apiUrl, {
                apikey: this.apiKey,
                numbers: phoneNumber,
                message: message,
                sender: this.sender
            });

            if (response.data.status === 'success') {
                console.log('SMS sent successfully to:', phoneNumber);
                return { success: true, message: 'SMS sent successfully' };
            } else {
                console.error('SMS API error:', response.data);
                return { success: false, message: 'SMS API error' };
            }
        } catch (error) {
            console.error('SMS sending error:', error.message);
            return { success: false, message: 'Failed to send SMS' };
        }
    }

    async sendThreatAlert(phoneNumber, threatType, threatValue, threatLevel = 'medium') {
        const urgencyMap = {
            low: '⚠️',
            medium: '🚨',
            high: '🆘'
        };

        const icon = urgencyMap[threatLevel] || '⚠️';
        
        const message = `${icon} SECURITY ALERT: You received a message from a blacklisted ${threatType}: ${threatValue}. This source has been reported as potentially dangerous. Stay safe!`;

        return await this.sendSMS(phoneNumber, message);
    }

    // For Twilio (alternative implementation)
    async sendSMSWithTwilio(phoneNumber, message) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            console.log('Twilio not configured. SMS would be sent:', { phoneNumber, message });
            return { success: true, message: 'SMS simulated (Twilio not configured)' };
        }

        try {
            const client = require('twilio')(accountSid, authToken);
            
            const result = await client.messages.create({
                body: message,
                from: fromNumber,
                to: phoneNumber
            });

            console.log('Twilio SMS sent successfully:', result.sid);
            return { success: true, message: 'SMS sent via Twilio', sid: result.sid };
        } catch (error) {
            console.error('Twilio SMS error:', error.message);
            return { success: false, message: 'Twilio SMS failed' };
        }
    }
}

module.exports = new SMSService();