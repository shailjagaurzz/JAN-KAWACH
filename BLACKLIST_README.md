# Security Blacklist & SMS Alert System

## Overview
The blacklist system allows users to add threatening emails, phone numbers, and URLs to a community blacklist. When other users receive messages from blacklisted sources, they get SMS notifications to stay protected.

## Features

### 1. Blacklist Management (`/blacklist`)
- **Add Threats**: Add emails, phone numbers, or URLs to the blacklist
- **Threat Levels**: Categorize threats as Low, Medium, or High risk
- **Community Reports**: See how many users have reported each threat
- **Watch/Unwatch**: Subscribe to SMS alerts for specific blacklisted items
- **Remove Items**: Creators can remove items they added

### 2. Threat Checker (`/threat-checker`)
- **Quick Check**: Verify if a source is blacklisted before interacting
- **Test SMS Alerts**: Simulate receiving a message from a blacklisted source
- **Safety Recommendations**: Get advice on handling detected threats

### 3. SMS Alert System
- **Real-time Notifications**: Get SMS when blacklisted sources contact you
- **Customizable Alerts**: Choose which threats to monitor
- **Threat Details**: SMS includes threat level and reason for blacklisting

## How It Works

### For Adding Threats:
1. Go to `/blacklist`
2. Click "➕ Add Threat"
3. Select type (email/phone/URL), enter value, reason, and threat level
4. Submit to add to community blacklist
5. You'll automatically watch this threat for SMS alerts

### For SMS Notifications:
1. Set your phone number in `/blacklist` (click "📱 Set SMS Phone")
2. Browse existing blacklist items and click "🔔 Watch" on threats you want to monitor
3. When a blacklisted source contacts you, you'll get an SMS like:
   ```
   🚨 SECURITY ALERT: You received a message from a blacklisted email: scammer@evil.com. 
   This source has been reported as potentially dangerous. Stay safe!
   ```

### For Checking Threats:
1. Go to `/threat-checker`
2. Enter email/phone/URL you want to check
3. Click "🔍 Check Threat" to see if it's blacklisted
4. If it's a threat, click "🚨 Test SMS Alert" to see how notifications work

## Backend API Endpoints

### Blacklist Management
- `GET /api/blacklist` - Get all blacklisted items
- `POST /api/blacklist` - Add item to blacklist
- `POST /api/blacklist/:id/watch` - Subscribe to SMS alerts
- `DELETE /api/blacklist/:id/watch` - Unsubscribe from SMS alerts
- `DELETE /api/blacklist/:id` - Remove from blacklist

### Message Monitoring
- `POST /api/monitor/message` - Check message and send SMS if threat detected
- `POST /api/monitor/check-threat` - Check if source is blacklisted (no SMS)
- `PUT /api/user/phone` - Update user's phone number for SMS

## SMS Service Configuration

The system supports multiple SMS providers. Configure in `.env`:

### Option 1: Textlocal
```env
SMS_API_KEY=your-textlocal-api-key
SMS_API_URL=https://api.textlocal.in/send/
SMS_SENDER=SECURITY
```

### Option 2: Twilio
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Option 3: Add Your Own
Modify `/backend/services/smsService.js` to integrate with your preferred SMS API.

## Integration with Existing Features

### Posts & Messages
When users receive messages through the app, the system automatically:
1. Checks sender against blacklist
2. Sends SMS alert if sender is blacklisted and user is watching
3. Logs threat detection for security monitoring

### QR Code Validation
The existing QR validator now also:
1. Checks decoded URLs against the blacklist
2. Warns users if QR contains blacklisted URLs
3. Allows adding malicious URLs to blacklist

## Security Features

- **Community Moderation**: Multiple reports increase threat credibility
- **User Privacy**: Phone numbers encrypted and only used for SMS alerts
- **Threat Levels**: Helps users prioritize which threats to watch
- **Auto-Detection**: System auto-detects email/phone/URL formats
- **Watch Management**: Users control which threats they monitor

## Testing the System

1. **Add a test threat**:
   - Go to `/blacklist`
   - Add email: `test-threat@example.com`
   - Reason: "Test phishing email"
   - Threat level: Medium

2. **Set up SMS**:
   - Click "📱 Set SMS Phone" and enter your number
   - Make sure you're watching the test threat

3. **Test alerts**:
   - Go to `/threat-checker`
   - Enter `test-threat@example.com`
   - Click "🚨 Test SMS Alert"
   - You should receive an SMS notification

## Production Deployment

1. Configure a real SMS service (Twilio recommended)
2. Set up proper MongoDB with authentication
3. Use strong JWT_SECRET and ENCRYPTION_KEY
4. Configure rate limiting for SMS to prevent abuse
5. Add admin interface for blacklist moderation
6. Monitor SMS costs and usage

## Future Enhancements

- **Email Integration**: Auto-scan incoming emails against blacklist
- **Browser Extension**: Real-time protection while browsing
- **Machine Learning**: Auto-detect suspicious patterns
- **Reputation Scoring**: Advanced threat assessment
- **Bulk Import**: Import threat feeds from security providers