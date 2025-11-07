import React, { useState, useEffect, useRef } from 'react';

const FraudAlertSystem = ({ user, isEnabled = true }) => {
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    soundEnabled: true,
    vibrateEnabled: true,
    popupEnabled: true,
    riskThreshold: 50
  });

  const audioRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (isEnabled && user) {
      initializeAlertSystem();
      startRealtimeMonitoring();
    }

    return () => {
      cleanup();
    };
  }, [isEnabled, user]);

  const initializeAlertSystem = () => {
    // Request notification permissions
    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Initialize audio for alerts
    if (audioRef.current) {
      audioRef.current.load();
    }

    setIsMonitoring(true);
  };

  const startRealtimeMonitoring = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Server-Sent Events for real-time alerts
    eventSourceRef.current = new EventSource(
      `/api/fraud-detection/alerts/stream?token=${token}`
    );

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'fraud_alert') {
        handleFraudAlert(data.alert);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error('Alert stream error:', error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (isMonitoring) {
          startRealtimeMonitoring();
        }
      }, 5000);
    };
  };

  const handleFraudAlert = (alertData) => {
    const alert = {
      id: Date.now(),
      timestamp: new Date(),
      ...alertData
    };

    setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts

    // Trigger alert based on settings and risk level
    if (alert.riskScore >= alertSettings.riskThreshold) {
      triggerAlert(alert);
    }
  };

  const triggerAlert = (alert) => {
    // Play sound
    if (alertSettings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }

    // Vibrate (mobile devices)
    if (alertSettings.vibrateEnabled && navigator.vibrate) {
      const pattern = alert.riskLevel === 'critical' ? [200, 100, 200, 100, 200] : [200, 100, 200];
      navigator.vibrate(pattern);
    }

    // Show browser notification
    if (alertSettings.popupEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 Jan-Kawach Fraud Alert', {
        body: alert.alertMessage,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: `fraud-alert-${alert.id}`,
        requireInteraction: alert.riskLevel === 'critical'
      });
    }

    // Show in-app popup
    showInAppAlert(alert);
  };

  const showInAppAlert = (alert) => {
    // This will be handled by the AlertPopup component
    window.dispatchEvent(new CustomEvent('fraudAlert', { detail: alert }));
  };

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsMonitoring(false);
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'low': 'text-yellow-600',
      'medium': 'text-orange-600',
      'high': 'text-red-600',
      'critical': 'text-red-800'
    };
    return colors[riskLevel] || 'text-gray-600';
  };

  const getRiskIcon = (riskLevel) => {
    const icons = {
      'low': '⚠️',
      'medium': '🔶',
      'high': '🚨',
      'critical': '🔴'
    };
    return icons[riskLevel] || 'ℹ️';
  };

  if (!isEnabled || !user) {
    return null;
  }

  return (
    <div className="fraud-alert-system">
      {/* Audio element for alert sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/fraud-alert.mp3" type="audio/mpeg" />
        <source src="/sounds/fraud-alert.wav" type="audio/wav" />
      </audio>

      {/* Monitoring Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
          isMonitoring ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            isMonitoring ? 'text-green-800' : 'text-red-800'
          }`}>
            {isMonitoring ? '🛡️ Protected' : '⚠️ Not Protected'}
          </span>
        </div>
      </div>

      {/* Recent Alerts Panel */}
      {alerts.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-40">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Fraud Alerts</h3>
            <button
              onClick={() => setAlerts([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2 p-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getRiskIcon(alert.riskLevel)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getRiskColor(alert.riskLevel)}`}>
                        {alert.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.phoneNumber}</p>
                    <p className="text-xs text-gray-600 mt-1">{alert.alertMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Settings Toggle */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => document.getElementById('alert-settings').style.display = 'block'}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Alert Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Alert Settings Modal */}
      <div id="alert-settings" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alert Settings</h3>
              <button
                onClick={() => document.getElementById('alert-settings').style.display = 'none'}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
                <input
                  type="checkbox"
                  checked={alertSettings.soundEnabled}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Vibration</label>
                <input
                  type="checkbox"
                  checked={alertSettings.vibrateEnabled}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, vibrateEnabled: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Pop-up Notifications</label>
                <input
                  type="checkbox"
                  checked={alertSettings.popupEnabled}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, popupEnabled: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Threshold: {alertSettings.riskThreshold}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={alertSettings.riskThreshold}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, riskThreshold: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => document.getElementById('alert-settings').style.display = 'none'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudAlertSystem;