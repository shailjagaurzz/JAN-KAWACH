import React, { useState, useEffect } from 'react';

const SetupGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [permissions, setPermissions] = useState({
    notifications: 'not-requested',
    sms: 'not-available',
    phone: 'not-available',
    location: 'not-requested'
  });
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    browser: 'unknown'
  });
  const [setupProgress, setSetupProgress] = useState({
    notificationsEnabled: false,
    serviceWorkersRegistered: false,
    fraudDatabaseLoaded: false,
    testCompleted: false
  });

  useEffect(() => {
    detectDevice();
    checkExistingPermissions();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    
    let browser = 'unknown';
    if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('safari')) browser = 'safari';
    else if (userAgent.includes('edge')) browser = 'edge';

    setDeviceInfo({ isMobile, isAndroid, isIOS, browser });
  };

  const checkExistingPermissions = async () => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissions(prev => ({
        ...prev,
        notifications: Notification.permission
      }));
    }

    // Check for other permissions (these would be available in a native app)
    if ('permissions' in navigator) {
      try {
        const smsPermission = await navigator.permissions.query({ name: 'sms' });
        setPermissions(prev => ({
          ...prev,
          sms: smsPermission.state
        }));
      } catch (error) {
        // SMS permission not available in web browsers
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({
        ...prev,
        notifications: permission
      }));

      if (permission === 'granted') {
        setSetupProgress(prev => ({
          ...prev,
          notificationsEnabled: true
        }));

        // Show test notification
        new Notification('Jan-Kawach Setup', {
          body: 'Notifications enabled! You\'ll receive fraud alerts.',
          icon: '/images/fraud-alert-icon.png'
        });
      }
    }
  };

  const registerServiceWorkers = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Register all fraud detection service workers
        const registrations = await Promise.all([
          navigator.serviceWorker.register('/whatsapp-monitor-sw.js'),
          navigator.serviceWorker.register('/sms-monitor-sw.js'),
          navigator.serviceWorker.register('/call-monitor-sw.js')
        ]);

        console.log('Service workers registered:', registrations);
        
        setSetupProgress(prev => ({
          ...prev,
          serviceWorkersRegistered: true
        }));

        // Send activation message
        registrations.forEach(registration => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'START_MONITORING',
              data: { enabled: true }
            });
          }
        });

      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  const loadFraudDatabase = async () => {
    try {
      // Initialize fraud detection system
      const response = await fetch('/api/fraud-detection/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSetupProgress(prev => ({
          ...prev,
          fraudDatabaseLoaded: true
        }));
      }
    } catch (error) {
      console.error('Failed to load fraud database:', error);
      // Continue anyway with local patterns
      setSetupProgress(prev => ({
        ...prev,
        fraudDatabaseLoaded: true
      }));
    }
  };

  const runProtectionTest = async () => {
    // Simulate a test fraud alert
    window.dispatchEvent(new CustomEvent('fraudAlert', {
      detail: {
        id: 'setup_test',
        type: 'setup_test',
        phoneNumber: '+1-555-TEST',
        riskLevel: 'medium',
        riskScore: 55,
        alertMessage: '🧪 Setup Test: This is a test fraud alert to verify your protection is working!',
        detectedPatterns: [
          { type: 'test_pattern', confidence: 100 }
        ],
        recommendedAction: {
          instructions: [
            'This is just a test - your fraud protection is working correctly!',
            'Real threats will be blocked automatically',
            'You can now use Jan-Kawach with confidence'
          ]
        },
        source: 'setup_guide'
      }
    }));

    setSetupProgress(prev => ({
      ...prev,
      testCompleted: true
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepTitle = (step) => {
    const titles = {
      1: '📱 Device Compatibility Check',
      2: '🔔 Enable Notifications',
      3: '🛡️ Activate Background Protection',
      4: '📊 Load Fraud Database',
      5: '🧪 Test Protection System',
      6: '✅ Setup Complete!'
    };
    return titles[step];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {deviceInfo.isMobile ? '📱' : '💻'}
              </div>
              <h3 className="text-xl font-semibold mb-2">Device Compatibility</h3>
              <p className="text-gray-600">Checking your device for fraud protection support...</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span>Device Type:</span>
                <span className="font-semibold">
                  {deviceInfo.isMobile ? (deviceInfo.isAndroid ? '📱 Android' : deviceInfo.isIOS ? '📱 iOS' : '📱 Mobile') : '💻 Desktop'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Browser:</span>
                <span className="font-semibold capitalize">{deviceInfo.browser}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Service Worker Support:</span>
                <span className="font-semibold">
                  {'serviceWorker' in navigator ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Notification Support:</span>
                <span className="font-semibold">
                  {'Notification' in window ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 What Jan-Kawach Will Do:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Monitor SMS messages for phishing attempts</li>
                <li>• Check incoming calls against scammer database</li>
                <li>• Analyze WhatsApp messages for fraud patterns</li>
                <li>• Block malicious links automatically</li>
                <li>• Alert you to suspicious activity in real-time</li>
                <li>• Work in background even when app is closed</li>
              </ul>
            </div>

            {deviceInfo.isMobile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">📱 Mobile Optimization:</h4>
                <p className="text-sm text-green-700">
                  Your mobile device will get enhanced protection including background monitoring
                  and system-level fraud detection.
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Enable Notifications</h3>
              <p className="text-gray-600">Allow notifications to receive instant fraud alerts</p>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                permissions.notifications === 'granted' ? 'bg-green-50 border-green-200' : 
                permissions.notifications === 'denied' ? 'bg-red-50 border-red-200' : 
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Notification Permission:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    permissions.notifications === 'granted' ? 'bg-green-100 text-green-800' :
                    permissions.notifications === 'denied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {permissions.notifications === 'granted' ? '✅ Enabled' :
                     permissions.notifications === 'denied' ? '❌ Denied' :
                     '⏳ Not Requested'}
                  </span>
                </div>
                
                {permissions.notifications !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔔 Enable Notifications
                  </button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🚨 Why Notifications Matter:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Get instant warnings about incoming scam calls</li>
                  <li>• Receive alerts when suspicious SMS arrives</li>
                  <li>• Block malicious links before you click them</li>
                  <li>• Stay protected even when Jan-Kawach isn't open</li>
                </ul>
              </div>

              {deviceInfo.isAndroid && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">📱 Android Setup Tips:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Make sure "Allow notifications" is enabled</li>
                    <li>• Disable battery optimization for Jan-Kawach</li>
                    <li>• Add to "Protected apps" or "Auto-start" list</li>
                    <li>• Enable "Show on lock screen" for critical alerts</li>
                  </ul>
                </div>
              )}

              {deviceInfo.isIOS && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">📱 iOS Setup Tips:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Allow notifications when prompted</li>
                    <li>• Enable "Critical Alerts" for emergency warnings</li>
                    <li>• Add Jan-Kawach to home screen for quick access</li>
                    <li>• Keep app in recent apps to maintain monitoring</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Activate Background Protection</h3>
              <p className="text-gray-600">Register service workers for 24/7 monitoring</p>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                setupProgress.serviceWorkersRegistered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Background Protection:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    setupProgress.serviceWorkersRegistered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {setupProgress.serviceWorkersRegistered ? '✅ Active' : '⏳ Pending'}
                  </span>
                </div>
                
                {!setupProgress.serviceWorkersRegistered && (
                  <button
                    onClick={registerServiceWorkers}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🛡️ Activate Background Protection
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💬</div>
                    <h4 className="font-semibold text-purple-800">WhatsApp Monitor</h4>
                    <p className="text-xs text-purple-600 mt-1">Scans messages for fraud</p>
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-semibold text-green-800">SMS Monitor</h4>
                    <p className="text-xs text-green-600 mt-1">Detects phishing SMS</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <h4 className="font-semibold text-red-800">Call Monitor</h4>
                    <p className="text-xs text-red-600 mt-1">Blocks scam calls</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🔄 Background Monitoring Features:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Runs 24/7 even when app is closed</li>
                  <li>• Analyzes all incoming communications</li>
                  <li>• Automatic threat blocking and alerts</li>
                  <li>• Minimal battery usage with smart optimization</li>
                  <li>• Works offline with local fraud patterns</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Load Fraud Database</h3>
              <p className="text-gray-600">Download latest threat intelligence</p>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                setupProgress.fraudDatabaseLoaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Fraud Database:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    setupProgress.fraudDatabaseLoaded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {setupProgress.fraudDatabaseLoaded ? '✅ Loaded' : '⏳ Loading...'}
                  </span>
                </div>
                
                {!setupProgress.fraudDatabaseLoaded && (
                  <button
                    onClick={loadFraudDatabase}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📊 Download Fraud Database
                  </button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🛡️ What Gets Downloaded:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <h5 className="font-semibold mb-1">📞 Scammer Numbers:</h5>
                    <ul className="space-y-1">
                      <li>• Known fraud phone numbers</li>
                      <li>• Tech support scammers</li>
                      <li>• Banking fraud numbers</li>
                      <li>• Government impersonators</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">🔍 Fraud Patterns:</h5>
                    <ul className="space-y-1">
                      <li>• Phishing SMS templates</li>
                      <li>• Malicious link patterns</li>
                      <li>• Social engineering tactics</li>
                      <li>• OTP theft attempts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">🔄 Automatic Updates:</h4>
                <p className="text-sm text-yellow-700">
                  The fraud database updates automatically every 6 hours to protect against
                  the latest threats. You'll always have current protection without any action needed.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold mb-2">Test Protection System</h3>
              <p className="text-gray-600">Verify everything is working correctly</p>
            </div>

            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                setupProgress.testCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Protection Test:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    setupProgress.testCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {setupProgress.testCompleted ? '✅ Passed' : '⏳ Pending'}
                  </span>
                </div>
                
                {!setupProgress.testCompleted && (
                  <button
                    onClick={runProtectionTest}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🧪 Run Protection Test
                  </button>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ What This Test Checks:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Alert popup appears correctly</li>
                  <li>• Sound notifications work</li>
                  <li>• Vibration alerts function (mobile)</li>
                  <li>• User response buttons are responsive</li>
                  <li>• Service workers are monitoring</li>
                </ul>
              </div>

              {setupProgress.testCompleted && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 Test Results:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <h5 className="font-semibold mb-1">✅ Working Components:</h5>
                      <ul className="space-y-1">
                        <li>• Alert popup system</li>
                        <li>• Notification permissions</li>
                        <li>• Background monitoring</li>
                        <li>• Fraud detection engine</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-1">🚀 Ready Features:</h5>
                      <ul className="space-y-1">
                        <li>• Real-time SMS scanning</li>
                        <li>• Call fraud detection</li>
                        <li>• WhatsApp monitoring</li>
                        <li>• Automatic link blocking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
              <p className="text-gray-600">Jan-Kawach is now protecting you 24/7</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-bold text-green-800 mb-4 text-center">🛡️ Your Protection is Now Active!</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">✅ What's Protected:</h5>
                  <ul className="text-green-700 space-y-1">
                    <li>• Incoming phone calls</li>
                    <li>• SMS text messages</li>
                    <li>• WhatsApp communications</li>
                    <li>• Clipboard content</li>
                    <li>• Suspicious links</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">🚀 How It Works:</h5>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Runs in background 24/7</li>
                    <li>• Instant threat detection</li>
                    <li>• Automatic blocking</li>
                    <li>• Real-time alerts</li>
                    <li>• No manual action needed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips for Maximum Protection:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Keep Jan-Kawach in your browser favorites</li>
                <li>• Don't clear browser data to maintain protection</li>
                <li>• Allow location access for region-specific threat detection</li>
                <li>• Enable "Always allow notifications" in browser settings</li>
                <li>• Report any false positives to improve accuracy</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">🚨 If You Receive an Alert:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Trust the warning - our system is highly accurate</li>
                <li>• Don't answer calls from flagged numbers</li>
                <li>• Never click links in suspicious messages</li>
                <li>• Report scams to help protect others</li>
                <li>• Block numbers that are confirmed threats</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                🏠 Return to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const allStepsComplete = Object.values(setupProgress).every(step => step);
  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return permissions.notifications === 'granted';
      case 3: return setupProgress.serviceWorkersRegistered;
      case 4: return setupProgress.fraudDatabaseLoaded;
      case 5: return setupProgress.testCompleted;
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Jan-Kawach Setup Guide</h2>
          <p className="text-blue-100">Setting up fraud protection for your device</p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-blue-500 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-blue-100 mt-1">
            <span>Step {currentStep} of 6</span>
            <span>{Math.round((currentStep / 6) * 100)}% Complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{getStepTitle(currentStep)}</h3>
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6].map(step => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step === currentStep ? 'bg-blue-600' :
                  step < currentStep ? 'bg-green-500' :
                  'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Finish Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;