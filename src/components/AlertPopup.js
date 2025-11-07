import React, { useState, useEffect } from 'react';
import { soundManager } from '../services/SoundManager';

const AlertPopup = () => {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userResponse, setUserResponse] = useState(null);

  useEffect(() => {
    const handleFraudAlert = (event) => {
      const alert = event.detail;
      setCurrentAlert(alert);
      setIsVisible(true);
      setUserResponse(null);
      
      // Play alert sound based on risk level
      soundManager.playAlert(alert.riskLevel, { 
        vibrate: alert.riskLevel === 'critical' || alert.riskLevel === 'high' 
      });
    };

    window.addEventListener('fraudAlert', handleFraudAlert);

    return () => {
      window.removeEventListener('fraudAlert', handleFraudAlert);
    };
  }, []);

  const handleResponse = async (response) => {
    setUserResponse(response);
    
    // Send response to backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/fraud-detection/detection-response/${currentAlert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userResponse: response })
      });
    } catch (error) {
      console.error('Error sending response:', error);
    }

    // Auto-close after 3 seconds if not critical
    if (currentAlert.riskLevel !== 'critical') {
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  };

  const closeAlert = () => {
    setIsVisible(false);
    setCurrentAlert(null);
    setUserResponse(null);
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'low': 'bg-yellow-50 border-yellow-200',
      'medium': 'bg-orange-50 border-orange-200',
      'high': 'bg-red-50 border-red-200',
      'critical': 'bg-red-100 border-red-300'
    };
    return colors[riskLevel] || 'bg-gray-50 border-gray-200';
  };

  const getRiskTextColor = (riskLevel) => {
    const colors = {
      'low': 'text-yellow-800',
      'medium': 'text-orange-800',
      'high': 'text-red-800',
      'critical': 'text-red-900'
    };
    return colors[riskLevel] || 'text-gray-800';
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

  if (!isVisible || !currentAlert) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg border-2 shadow-2xl ${getRiskColor(currentAlert.riskLevel)}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getRiskIcon(currentAlert.riskLevel)}</span>
            <div>
              <h2 className={`text-xl font-bold ${getRiskTextColor(currentAlert.riskLevel)}`}>
                FRAUD ALERT DETECTED
              </h2>
              <p className={`text-sm ${getRiskTextColor(currentAlert.riskLevel)}`}>
                {currentAlert.riskLevel.toUpperCase()} RISK LEVEL
              </p>
            </div>
          </div>
        </div>

        {/* Alert Content */}
        <div className="p-6">
          {/* Phone Number */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Suspicious Number:</h3>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded border">
              {currentAlert.phoneNumber}
            </p>
          </div>

          {/* Alert Message */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Alert Details:</h3>
            <p className="text-sm text-gray-800 bg-white p-3 rounded border">
              {currentAlert.alertMessage}
            </p>
          </div>

          {/* Risk Score */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Risk Score:</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    currentAlert.riskScore >= 80 ? 'bg-red-600' :
                    currentAlert.riskScore >= 60 ? 'bg-orange-500' :
                    currentAlert.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${currentAlert.riskScore}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold">{currentAlert.riskScore}%</span>
            </div>
          </div>

          {/* Detected Patterns */}
          {currentAlert.detectedPatterns && currentAlert.detectedPatterns.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Detected Threats:</h3>
              <div className="space-y-1">
                {currentAlert.detectedPatterns.map((pattern, index) => (
                  <div key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    • {pattern.type}: {pattern.confidence}% confidence
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {currentAlert.recommendedAction && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions:</h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <ul className="text-sm text-blue-800 space-y-1">
                  {currentAlert.recommendedAction.instructions.map((instruction, index) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* User Response Buttons */}
          {!userResponse && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">What would you like to do?</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleResponse('blocked_number')}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  🚫 Block This Number
                </button>
                
                <button
                  onClick={() => handleResponse('confirmed_fraud')}
                  className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  ⚠️ Confirm as Fraud
                </button>
                
                <button
                  onClick={() => handleResponse('marked_safe')}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  ✅ Mark as Safe
                </button>
                
                <button
                  onClick={() => handleResponse('ignored')}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  👁️ Ignore Alert
                </button>
              </div>
            </div>
          )}

          {/* Response Confirmation */}
          {userResponse && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800">
                ✅ Response recorded: {userResponse.replace('_', ' ').toUpperCase()}
              </p>
              {currentAlert.riskLevel !== 'critical' && (
                <p className="text-xs text-green-600 mt-1">
                  This alert will close automatically...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Jan-Kawach Fraud Protection
            </p>
            <button
              onClick={closeAlert}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Close Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;