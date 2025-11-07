# 🚫 Blacklist & SMS Alert System

## Overview
The blacklist system allows users to add threatening phone numbers, emails, and URLs to a community database. When other users receive messages from these blacklisted sources, they automatically get SMS notifications warning them about the potential threat.

## ✨ Features

### 🔍 **Threat Management**
- Add emails, phone numbers, or URLs to the blacklist
- Set threat levels: Low, Medium, High
- Provide detailed reasons for blacklisting
- Community-driven reporting system

### 📱 **SMS Notifications**
- Automatic SMS alerts when blacklisted sources contact you
- Real-time threat detection
- Customizable alert preferences
- Support for multiple SMS providers (Twilio, Textlocal, etc.)

### 👥 **Community Protection**
- Collaborative threat database
- Watch/unwatch specific threats
- View threat statistics and reports
- Remove false positives

## 🚀 How to Use

### 1. **Access the Blacklist**
Navigate to `/blacklist` in your browser after logging in.

### 2. **Set Up SMS Alerts**
1. Click "📱 Set SMS Phone" 
2. Enter your phone number with country code (e.g., +1234567890)
3. Save your number

### 3. **Add Threats to Blacklist**
1. Click "➕ Add Threat"
2. Select type: Email, Phone, or URL
3. Enter the threatening source
4. Set threat level and provide reason
5. Submit to blacklist

### 4. **Monitor Threats**
- Click "🔔 Watch" on blacklisted items you want SMS alerts for
- Use the Threat Checker at `/threat-checker` to verify sources before interacting

### 5. **Receive Alerts**
When a blacklisted source contacts you, you'll receive SMS like:
```
🚨 SECURITY ALERT: You received a message from a blacklisted email: scammer@evil.com. This source has been reported as potentially dangerous. Stay safe!
```

## 🛡️ API Endpoints

### Blacklist Management
- `GET /api/blacklist` - Get all blacklisted items
- `POST /api/blacklist` - Add item to blacklist
- `POST /api/blacklist/:id/watch` - Subscribe to SMS alerts
- `DELETE /api/blacklist/:id/watch` - Unsubscribe from alerts
- `DELETE /api/blacklist/:id` - Remove from blacklist

### Message Monitoring
- `POST /api/monitor/message` - Check message and send SMS if threat
- `POST /api/monitor/check-threat` - Check if source is blacklisted
- `PUT /api/user/phone` - Update user's phone number

## ⚙️ Configuration

### Environment Variables
```env
# SMS Service (choose one)
# Textlocal
SMS_API_KEY=your-textlocal-api-key
SMS_API_URL=https://api.textlocal.in/send/
SMS_SENDER=SECURITY

# Twilio (alternative)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

The blacklist system is now fully operational and ready to protect your community! 🛡️