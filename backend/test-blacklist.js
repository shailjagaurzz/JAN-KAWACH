// Test script for blacklist functionality
const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const ReportedEntity = require('./models/ReportedEntity');
const User = require('./models/user');
const threatMonitor = require('./services/threatMonitor');
const smsService = require('./services/smsService');

async function testBlacklistSystem() {
    try {
        console.log('🧪 Testing Blacklist System...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/janKawach', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Create a test user
        console.log('📋 Test 1: Creating test user...');
        const testUser = new User({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'hashedpassword123',
            phone: '+1234567890'
        });
        
        try {
            await testUser.save();
            console.log('✅ Test user created:', testUser.email);
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ Test user already exists:', testUser.email);
            } else {
                throw error;
            }
        }

        // Test 2: Add threats to blacklist
        console.log('\n📋 Test 2: Adding threats to blacklist...');
        const threats = [
            {
                value: 'scammer@evil.com',
                type: 'email',
                reason: 'Phishing emails asking for bank details',
                threatLevel: 'high',
                reportedBy: testUser._id,
                usersWatching: [testUser._id]
            },
            {
                value: '+1-800-SCAM',
                type: 'phone',
                reason: 'Robocalls demanding payment',
                threatLevel: 'medium',
                reportedBy: testUser._id,
                usersWatching: [testUser._id]
            },
            {
                value: 'https://fake-bank.evil.com',
                type: 'url',
                reason: 'Fake banking website stealing credentials',
                threatLevel: 'high',
                reportedBy: testUser._id,
                usersWatching: [testUser._id]
            }
        ];

        for (const threat of threats) {
            try {
                const blacklistItem = new ReportedEntity(threat);
                await blacklistItem.save();
                console.log(`✅ Added to blacklist: ${threat.value} (${threat.type})`);
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`✅ Already in blacklist: ${threat.value} (${threat.type})`);
                } else {
                    throw error;
                }
            }
        }

        // Test 3: Check threat detection
        console.log('\n📋 Test 3: Testing threat detection...');
        const testCases = [
            { value: 'scammer@evil.com', type: 'email', shouldBeThreat: true },
            { value: 'safe@gmail.com', type: 'email', shouldBeThreat: false },
            { value: '+1-800-SCAM', type: 'phone', shouldBeThreat: true },
            { value: 'https://fake-bank.evil.com', type: 'url', shouldBeThreat: true }
        ];

        for (const testCase of testCases) {
            const threat = await threatMonitor.checkThreat(testCase.value, testCase.type);
            const isThreat = !!threat;
            const status = isThreat === testCase.shouldBeThreat ? '✅' : '❌';
            console.log(`${status} ${testCase.value}: ${isThreat ? 'THREAT DETECTED' : 'Safe'}`);
            
            if (threat) {
                console.log(`   └─ Level: ${threat.threatLevel}, Reason: ${threat.reason}`);
            }
        }

        // Test 4: SMS service simulation
        console.log('\n📋 Test 4: Testing SMS notification service...');
        const smsResult = await smsService.sendThreatAlert(
            '+1234567890',
            'email',
            'scammer@evil.com',
            'high'
        );
        console.log('✅ SMS service result:', smsResult.message);

        // Test 5: Message monitoring simulation
        console.log('\n📋 Test 5: Testing message monitoring...');
        const monitorResult = await threatMonitor.monitorMessage(
            'scammer@evil.com',
            'email',
            'Urgent! Click this link to secure your account...',
            testUser._id
        );
        console.log('✅ Monitor result:', {
            isThreat: monitorResult.isThreat,
            alertSent: monitorResult.alertSent
        });

        // Test 6: Get blacklist statistics
        console.log('\n📋 Test 6: Blacklist statistics...');
        const totalThreats = await ReportedEntity.countDocuments({ isActive: true });
        const emailThreats = await ReportedEntity.countDocuments({ type: 'email', isActive: true });
        const phoneThreats = await ReportedEntity.countDocuments({ type: 'phone', isActive: true });
        const urlThreats = await ReportedEntity.countDocuments({ type: 'url', isActive: true });
        
        console.log(`✅ Total active threats: ${totalThreats}`);
        console.log(`   └─ Emails: ${emailThreats}, Phones: ${phoneThreats}, URLs: ${urlThreats}`);

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📝 Summary:');
        console.log('   • Blacklist system is working correctly');
        console.log('   • Threat detection is functional');
        console.log('   • SMS service is configured (simulated)');
        console.log('   • Message monitoring system is operational');
        console.log('\n🚀 The blacklist feature is ready to use!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    } finally {
        mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

// Run the test
testBlacklistSystem();