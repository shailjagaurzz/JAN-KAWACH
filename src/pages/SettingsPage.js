import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { apiFetch } from '../api';
import { soundManager } from '../services/SoundManager';

const SettingsPage = () => {
  const { token, user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    fraudDetection: {
      enabled: true,
      sensitivity: 'medium',
      realTimeMonitoring: true,
      whatsappMonitoring: true,
      smsMonitoring: true,
      callMonitoring: true,
      autoBlock: false,
      alertThreshold: 50
    },
    notifications: {
      soundEnabled: true,
      vibrationEnabled: true,
      emailAlerts: true,
      smsAlerts: true,
      pushNotifications: true,
      soundVolume: 0.7
    },
    privacy: {
      shareWithCommunity: true,
      anonymousReporting: true,
      dataRetention: '1year',
      locationTracking: false
    },
    advanced: {
      mlModelUpdates: true,
      betaFeatures: false,
      diagnosticData: true,
      localProcessing: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('fraud-detection');

  useEffect(() => {
    if (token) {
      loadSettings();
    }
  }, [token]);

  const loadSettings = async () => {
    try {
      const res = await apiFetch('/api/user/settings', {}, token);
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, ...data.settings });
      }
      
      // Load sound settings
      const soundSettings = soundManager.getSettings();
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          soundEnabled: soundSettings.enabled,
          soundVolume: soundSettings.volume
        }
      }));
      
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Save to backend
      const res = await apiFetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      }, token);
      
      const data = await res.json();
      if (data.success) {
        // Update sound manager settings
        soundManager.setEnabled(settings.notifications.soundEnabled);
        soundManager.setVolume(settings.notifications.soundVolume);
        
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Error saving settings: ' + data.message);
      }
    } catch (error) {
      setMessage('Error saving settings. Please try again.');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testSound = () => {
    soundManager.testSounds();
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to default values? This action cannot be undone.')) {
      setSettings({
        fraudDetection: {
          enabled: true,
          sensitivity: 'medium',
          realTimeMonitoring: true,
          whatsappMonitoring: true,
          smsMonitoring: true,
          callMonitoring: true,
          autoBlock: false,
          alertThreshold: 50
        },
        notifications: {
          soundEnabled: true,
          vibrationEnabled: true,
          emailAlerts: true,
          smsAlerts: true,
          pushNotifications: true,
          soundVolume: 0.7
        },
        privacy: {
          shareWithCommunity: true,
          anonymousReporting: true,
          dataRetention: '1year',
          locationTracking: false
        },
        advanced: {
          mlModelUpdates: true,
          betaFeatures: false,
          diagnosticData: true,
          localProcessing: true
        }
      });
    }
  };

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to access settings</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
        <p className="text-gray-600">Configure your fraud protection and notification preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'fraud-detection', label: '🛡️ Fraud Detection', icon: '🛡️' },
            { key: 'notifications', label: '🔔 Notifications', icon: '🔔' },
            { key: 'privacy', label: '🔒 Privacy', icon: '🔒' },
            { key: 'advanced', label: '⚙️ Advanced', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label.replace(/🛡️|🔔|🔒|⚙️\s/, '')}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Fraud Detection Settings */}
      {activeTab === 'fraud-detection' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🛡️ Fraud Detection Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Enable Fraud Detection</label>
                  <p className="text-xs text-gray-500">Turn on/off the entire fraud detection system</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.fraudDetection.enabled}
                  onChange={(e) => updateSetting('fraudDetection', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Detection Sensitivity</label>
                <select
                  value={settings.fraudDetection.sensitivity}
                  onChange={(e) => updateSetting('fraudDetection', 'sensitivity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={!settings.fraudDetection.enabled}
                >
                  <option value="low">Low - Only obvious threats</option>
                  <option value="medium">Medium - Balanced detection</option>
                  <option value="high">High - Aggressive detection</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Higher sensitivity may result in more false positives</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alert Threshold (Risk Score)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.fraudDetection.alertThreshold}
                  onChange={(e) => updateSetting('fraudDetection', 'alertThreshold', parseInt(e.target.value))}
                  className="w-full"
                  disabled={!settings.fraudDetection.enabled}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 (Alert everything)</span>
                  <span>Current: {settings.fraudDetection.alertThreshold}</span>
                  <span>100 (Only critical)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Monitoring Options</h4>
                {[
                  { key: 'realTimeMonitoring', label: 'Real-time monitoring' },
                  { key: 'whatsappMonitoring', label: 'WhatsApp message monitoring' },
                  { key: 'smsMonitoring', label: 'SMS monitoring' },
                  { key: 'callMonitoring', label: 'Call monitoring' },
                  { key: 'autoBlock', label: 'Auto-block critical threats' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <label className="text-sm">{option.label}</label>
                    <input
                      type="checkbox"
                      checked={settings.fraudDetection[option.key]}
                      onChange={(e) => updateSetting('fraudDetection', option.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={!settings.fraudDetection.enabled}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🔔 Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Alert Methods</h4>
                {[
                  { key: 'soundEnabled', label: 'Sound alerts' },
                  { key: 'vibrationEnabled', label: 'Vibration (mobile devices)' },
                  { key: 'emailAlerts', label: 'Email notifications' },
                  { key: 'smsAlerts', label: 'SMS alerts' },
                  { key: 'pushNotifications', label: 'Push notifications' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <label className="text-sm">{option.label}</label>
                    <input
                      type="checkbox"
                      checked={settings.notifications[option.key]}
                      onChange={(e) => updateSetting('notifications', option.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sound Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.notifications.soundVolume}
                  onChange={(e) => {
                    const volume = parseFloat(e.target.value);
                    updateSetting('notifications', 'soundVolume', volume);
                    soundManager.setVolume(volume);
                  }}
                  className="w-full"
                  disabled={!settings.notifications.soundEnabled}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Silent</span>
                  <span>{Math.round(settings.notifications.soundVolume * 100)}%</span>
                  <span>Loud</span>
                </div>
                <button
                  onClick={testSound}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  disabled={!settings.notifications.soundEnabled}
                >
                  🔊 Test Sounds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🔒 Privacy & Data Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Community Sharing</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Share threat data with community</label>
                    <p className="text-xs text-gray-500">Help protect others by sharing anonymized threat data</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.shareWithCommunity}
                    onChange={(e) => updateSetting('privacy', 'shareWithCommunity', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Anonymous reporting</label>
                    <p className="text-xs text-gray-500">Report threats without revealing your identity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.anonymousReporting}
                    onChange={(e) => updateSetting('privacy', 'anonymousReporting', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data Retention Period</label>
                <select
                  value={settings.privacy.dataRetention}
                  onChange={(e) => updateSetting('privacy', 'dataRetention', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="30days">30 Days</option>
                  <option value="90days">90 Days</option>
                  <option value="1year">1 Year</option>
                  <option value="forever">Keep Forever</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Location tracking</label>
                  <p className="text-xs text-gray-500">Allow location data for geographic threat analysis</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.locationTracking}
                  onChange={(e) => updateSetting('privacy', 'locationTracking', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">⚙️ Advanced Configuration</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Machine Learning</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Automatic ML model updates</label>
                    <p className="text-xs text-gray-500">Keep fraud detection models up-to-date</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.advanced.mlModelUpdates}
                    onChange={(e) => updateSetting('advanced', 'mlModelUpdates', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Local processing</label>
                    <p className="text-xs text-gray-500">Process data locally for better privacy</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.advanced.localProcessing}
                    onChange={(e) => updateSetting('advanced', 'localProcessing', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Development</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Beta features</label>
                    <p className="text-xs text-gray-500">Enable experimental features (may be unstable)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.advanced.betaFeatures}
                    onChange={(e) => updateSetting('advanced', 'betaFeatures', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Send diagnostic data</label>
                    <p className="text-xs text-gray-500">Help improve the app by sharing usage data</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.advanced.diagnosticData}
                    onChange={(e) => updateSetting('advanced', 'diagnosticData', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;