import React, { useState, useEffect } from 'react';

const FraudAlertTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Test scenarios data
  const testScenarios = [
    {
      id: 'low_risk_sms',
      name: 'Low Risk SMS',
      riskLevel: 'low',
      type: 'sms_content',
      phoneNumber: '+1-800-PROMO',
      alertMessage: 'Promotional message detected from marketing number',
      riskScore: 25,
      detectedPatterns: [
        { type: 'promotional_content', confidence: 30 }
      ],
      recommendedAction: {
        instructions: [
          'This appears to be a promotional message',
          'You can safely ignore if not interested',
          'Consider unsubscribing if unwanted'
        ]
      }
    },
    {
      id: 'medium_risk_whatsapp',
      name: 'Medium Risk WhatsApp',
      riskLevel: 'medium',
      type: 'whatsapp_message',
      phoneNumber: '+91-98765-43210',
      alertMessage: 'Suspicious WhatsApp message with urgent language detected',
      riskScore: 55,
      detectedPatterns: [
        { type: 'urgent_language', confidence: 60 },
        { type: 'unknown_sender', confidence: 50 }
      ],
      recommendedAction: {
        instructions: [
          'Verify the sender before responding',
          'Do not click any links in the message',
          'Report if message seems suspicious'
        ]
      }
    },
    {
      id: 'high_risk_phishing',
      name: 'High Risk Phishing',
      riskLevel: 'high',
      type: 'sms_content',
      phoneNumber: '+1-555-FRAUD',
      alertMessage: 'PHISHING ATTEMPT: Fake banking SMS with malicious link detected',
      riskScore: 85,
      detectedPatterns: [
        { type: 'banking_fraud', confidence: 90 },
        { type: 'malicious_link', confidence: 85 },
        { type: 'urgent_action_required', confidence: 80 }
      ],
      recommendedAction: {
        instructions: [
          'DO NOT click any links in this message',
          'This is a known phishing attempt',
          'Block this number immediately',
          'Report to authorities if money was involved'
        ]
      }
    },
    {
      id: 'critical_scam_call',
      name: 'Critical Scam Call',
      riskLevel: 'critical',
      type: 'incoming_call',
      phoneNumber: '+91-99999-SCAM',
      alertMessage: '🚨 CRITICAL THREAT: Known scammer number attempting to call you',
      riskScore: 95,
      detectedPatterns: [
        { type: 'known_scammer', confidence: 98 },
        { type: 'impersonation_fraud', confidence: 92 },
        { type: 'financial_threat', confidence: 88 }
      ],
      recommendedAction: {
        instructions: [
          'DO NOT answer this call under any circumstances',
          'This number is confirmed to be used by scammers',
          'Block immediately and report to authorities',
          'Never share personal or financial information'
        ]
      }
    },
    {
      id: 'clipboard_threat',
      name: 'Clipboard Threat',
      riskLevel: 'high',
      type: 'clipboard_content',
      content: 'Your account has been suspended! Click here urgently: http://fake-bank-login.scam.com/verify?token=steal-your-data',
      alertMessage: 'Malicious link detected in clipboard - potential phishing website',
      riskScore: 78,
      detectedPatterns: [
        { type: 'phishing_url', confidence: 85 },
        { type: 'account_suspension_scam', confidence: 75 },
        { type: 'urgent_action_language', confidence: 70 }
      ],
      recommendedAction: {
        instructions: [
          'Do not visit the copied link',
          'Clear your clipboard immediately',
          'This is a known phishing website',
          'Report the malicious link'
        ]
      }
    }
  ];

  // Function to trigger a test alert
  const triggerTestAlert = (scenario) => {
    console.log('🧪 Triggering test alert:', scenario.name);
    
    // Create alert object
    const alert = {
      id: `test_${Date.now()}`,
      ...scenario,
      timestamp: new Date().toISOString(),
      source: 'fraud_alert_tester'
    };

    // Dispatch the fraud alert event
    window.dispatchEvent(new CustomEvent('fraudAlert', {
      detail: alert
    }));

    // Record test result
    const testResult = {
      id: alert.id,
      scenario: scenario.name,
      timestamp: new Date().toISOString(),
      status: 'triggered'
    };

    setTestResults(prev => [testResult, ...prev].slice(0, 10)); // Keep last 10 results
  };

  // Function to test all scenarios in sequence
  const runFullTest = async () => {
    console.log('🧪 Running full fraud detection test suite...');
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`Testing scenario ${i + 1}/${testScenarios.length}: ${scenario.name}`);
      
      triggerTestAlert(scenario);
      
      // Wait 3 seconds between tests to see each alert
      if (i < testScenarios.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  };

  // Function to test browser notification permission
  const testNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        new Notification('Jan-Kawach Test', {
          body: 'Browser notifications are working correctly!',
          icon: '/images/fraud-alert-icon.png'
        });
        
        setTestResults(prev => [{
          id: `notify_${Date.now()}`,
          scenario: 'Browser Notification',
          timestamp: new Date().toISOString(),
          status: 'granted'
        }, ...prev].slice(0, 10));
      } else {
        setTestResults(prev => [{
          id: `notify_${Date.now()}`,
          scenario: 'Browser Notification',
          timestamp: new Date().toISOString(),
          status: 'denied'
        }, ...prev].slice(0, 10));
      }
    }
  };

  // Function to test vibration (mobile)
  const testVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([500, 100, 500, 100, 500]);
      setTestResults(prev => [{
        id: `vibrate_${Date.now()}`,
        scenario: 'Device Vibration',
        timestamp: new Date().toISOString(),
        status: 'supported'
      }, ...prev].slice(0, 10));
    } else {
      setTestResults(prev => [{
        id: `vibrate_${Date.now()}`,
        scenario: 'Device Vibration',
        timestamp: new Date().toISOString(),
        status: 'not_supported'
      }, ...prev].slice(0, 10));
    }
  };

  // Function to test audio alerts
  const testAudioAlert = (riskLevel = 'medium') => {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different risk levels
      const frequencies = {
        'low': 400,
        'medium': 600,
        'high': 800,
        'critical': 1000
      };
      
      oscillator.frequency.setValueAtTime(frequencies[riskLevel], audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      setTestResults(prev => [{
        id: `audio_${Date.now()}`,
        scenario: `Audio Alert (${riskLevel})`,
        timestamp: new Date().toISOString(),
        status: 'played'
      }, ...prev].slice(0, 10));
      
    } catch (error) {
      console.error('Audio test failed:', error);
      setTestResults(prev => [{
        id: `audio_${Date.now()}`,
        scenario: 'Audio Alert',
        timestamp: new Date().toISOString(),
        status: 'failed'
      }, ...prev].slice(0, 10));
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-20 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg z-40 transition-colors"
        title="Open Fraud Alert Tester"
      >
        🧪 Test Alerts
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-96 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">🧪 Fraud Alert Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Quick Test Buttons */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Tests</h4>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => triggerTestAlert(testScenarios[0])}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded"
            >
              Low Risk
            </button>
            <button
              onClick={() => triggerTestAlert(testScenarios[1])}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1 px-2 rounded"
            >
              Medium Risk
            </button>
            <button
              onClick={() => triggerTestAlert(testScenarios[2])}
              className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
            >
              High Risk
            </button>
            <button
              onClick={() => triggerTestAlert(testScenarios[3])}
              className="bg-red-700 hover:bg-red-800 text-white text-xs py-1 px-2 rounded"
            >
              Critical
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={runFullTest}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded"
            >
              🎯 Run Full Test Suite
            </button>
          </div>
        </div>

        {/* System Tests */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">System Tests</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={testNotificationPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
            >
              📱 Test Notifications
            </button>
            <button
              onClick={testVibration}
              className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
            >
              📳 Test Vibration
            </button>
            <button
              onClick={() => testAudioAlert('medium')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs py-1 px-2 rounded"
            >
              🔊 Test Audio
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Test Results</h4>
              <button
                onClick={clearTestResults}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {testResults.map((result) => (
                <div key={result.id} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.scenario}</span>
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      result.status === 'triggered' || result.status === 'granted' || result.status === 'played' || result.status === 'supported'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <strong>How to test:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Click any risk level button to trigger an alert</li>
            <li>Check if the popup appears with correct information</li>
            <li>Test sound, vibration, and notifications</li>
            <li>Try responding to alerts with different actions</li>
            <li>Run full test suite to test all scenarios</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default FraudAlertTester;