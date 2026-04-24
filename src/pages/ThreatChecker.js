import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { apiFetch } from '../api';

// Community Statistics Component
function CommunityStats() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityStats();
  }, [token]);

  const fetchCommunityStats = async () => {
    if (!token) return;
    
    try {
      const res = await apiFetch('/api/blacklist/stats', {}, token);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 glass-panel rounded-3xl p-4">
        <div className="animate-pulse text-slate-600">Loading community statistics...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mt-8 glass-panel rounded-3xl p-6">
      <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
        🤝 Community Protection Statistics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white/80 p-3 rounded-2xl border border-slate-200">
          <div className="text-2xl font-bold text-cyan-700">{stats.totalThreats || 0}</div>
          <div className="text-sm text-slate-600">Total Threats</div>
        </div>
        <div className="bg-white/80 p-3 rounded-2xl border border-slate-200">
          <div className="text-2xl font-bold text-rose-600">{stats.highRiskThreats || 0}</div>
          <div className="text-sm text-slate-600">High Risk</div>
        </div>
        <div className="bg-white/80 p-3 rounded-2xl border border-slate-200">
          <div className="text-2xl font-bold text-emerald-600">{stats.activeWatchers || 0}</div>
          <div className="text-sm text-slate-600">Active Watchers</div>
        </div>
        <div className="bg-white/80 p-3 rounded-2xl border border-slate-200">
          <div className="text-2xl font-bold text-amber-600">{stats.reportsToday || 0}</div>
          <div className="text-sm text-slate-600">Reports Today</div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-cyan-700">
        <strong>Together we've blocked {stats.totalThreats || 0} threats!</strong> 
        Join our community to help protect others.
      </div>
    </div>
  );
}

function ThreatChecker() {
  const { token } = useContext(AuthContext);
  const [senderValue, setSenderValue] = useState('');
  const [senderType, setSenderType] = useState('email');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to check threats');
      return;
    }

    setLoading(true);
    setResult(null);
    setMessage('');

    try {
      const res = await apiFetch('/api/monitor/check-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderValue, senderType })
      }, token);

      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setMessage(data.message || 'Error checking threat');
      }
    } catch (error) {
      setMessage('Error checking threat');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonitorMessage = async () => {
    if (!token) {
      setMessage('Please log in to monitor messages');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await apiFetch('/api/monitor/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderValue, 
          senderType, 
          messageContent: 'Test message from threat checker' 
        })
      }, token);

      const data = await res.json();
      
      if (data.success) {
        if (data.isThreat && data.alertSent) {
          setMessage('🚨 Threat detected! SMS alert sent to your phone.');
        } else if (data.isThreat && !data.alertSent) {
          setMessage('⚠️ Threat detected but no SMS sent (check if you\'re watching this threat and have set your phone number).');
        } else {
          setMessage('✅ No threat detected - this source is safe.');
        }
        setResult(data);
      } else {
        setMessage(data.message || 'Error monitoring message');
      }
    } catch (error) {
      setMessage('Error monitoring message');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return '📧';
      case 'phone': return '📱';
      case 'url': return '🌐';
      default: return '⚠️';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8">
      <div className="hero-orb h-56 w-56 bg-cyan-300/35 -top-10 -left-12" />
      <div className="hero-orb h-64 w-64 bg-amber-300/35 top-24 -right-16" />
      <div className="max-w-3xl mx-auto relative z-10">
      <div className="glass-panel rounded-3xl p-6 md:p-8 reveal-up">
      <h2 className="text-3xl md:text-4xl font-bold brand-gradient-text mb-4">🔍 Threat Checker</h2>
      <p className="text-slate-600 mb-6">
        Check if an email, phone number, or URL has been blacklisted by our community members. 
        Our threat detection is powered by <strong>community intelligence</strong> - when users report threats, 
        everyone benefits from shared protection.
      </p>

      <form onSubmit={handleCheck} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={senderType}
              onChange={(e) => setSenderType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="email">📧 Email</option>
              <option value="phone">📱 Phone</option>
              <option value="url">🌐 URL</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              {senderType === 'email' ? 'Email Address' : 
               senderType === 'phone' ? 'Phone Number' : 'URL'}
            </label>
            <input
              type={senderType === 'email' ? 'email' : senderType === 'url' ? 'url' : 'text'}
              placeholder={
                senderType === 'email' ? 'sender@example.com' : 
                senderType === 'phone' ? '+1234567890' : 
                'https://example.com'
              }
              value={senderValue}
              onChange={(e) => setSenderValue(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {loading ? 'Checking...' : '🔍 Check Threat'}
          </button>
          
          {result && result.isThreat && (
            <button
              type="button"
              onClick={handleMonitorMessage}
              disabled={loading}
              className="bg-slate-900 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform disabled:opacity-50"
            >
              {loading ? 'Sending...' : '🚨 Test SMS Alert'}
            </button>
          )}
        </div>
      </form>

      {message && (
        <div className={`p-4 rounded-2xl mb-4 border ${message.includes('Error') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
          {message}
        </div>
      )}

      {result && (
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            {result.isThreat ? '⚠️ Threat Detected' : '✅ Safe'}
          </h3>
          
          {result.isThreat && result.threat ? (
            <div className={`border rounded-2xl p-4 ${getThreatLevelColor(result.threat.threatLevel)}`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{getTypeIcon(result.threat.type)}</span>
                <span className="font-semibold">{result.threat.value}</span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-current bg-opacity-20">
                  {result.threat.threatLevel.toUpperCase()} RISK
                </span>
              </div>
              
              <p className="mb-3"><strong>Reason:</strong> {result.threat.reason}</p>
              
              <div className="text-sm">
                <div className="mb-1">
                  <strong>📊 Community Reports:</strong> {result.threat.reportCount} user(s) have reported this threat
                </div>
                <div className="mb-1">
                  <strong>👥 Active Watchers:</strong> {result.threat.usersWatching?.length || 0} user(s) monitoring for alerts
                </div>
                <div className="mb-1">
                  <strong>🕐 First Reported:</strong> {new Date(result.threat.createdAt).toLocaleDateString()}
                </div>
                <div className="mb-1">
                  <strong>📅 Last Updated:</strong> {new Date(result.threat.lastReportedAt).toLocaleDateString()}
                </div>
                {result.threat.reportedBy && (
                  <div>
                    <strong>🚩 Originally Reported By:</strong> {result.threat.reportedBy.name || 'Community Member'}
                  </div>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>⚠️ Community Warning:</strong> This source has been flagged as potentially dangerous by {result.threat.reportCount} community member(s). 
                Avoid interacting with messages, calls, or links from this source.
              </div>

              {/* Community Actions */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">🤝 Community Protection</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    onClick={() => window.open('/blacklist', '_blank')}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    🔔 Watch for Alerts
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Threat Alert from Jan-Kawach',
                          text: `⚠️ Warning: ${result.threat.value} has been reported as ${result.threat.threatLevel} risk by ${result.threat.reportCount} users. Reason: ${result.threat.reason}`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(`⚠️ Threat Alert: ${result.threat.value} reported as ${result.threat.threatLevel} risk by ${result.threat.reportCount} users.`);
                        alert('Threat info copied to clipboard!');
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    📢 Share Warning
                  </button>
                  {result.threat.reportCount < 5 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      Help others by confirming this threat!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-green-300 rounded-lg p-4 bg-green-50 text-green-700">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">✅</span>
                <span className="font-semibold">{senderValue}</span>
              </div>
              <p>This source is not in our community blacklist and appears to be safe.</p>
              <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded">
                <strong>🤝 Help Our Community:</strong> If you encounter suspicious activity from this source, 
                please <button 
                  onClick={() => window.open('/blacklist', '_blank')}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  add it to the blacklist
                </button> to help protect others in our community.
              </div>
              
              {/* Report Button for Safe Sources */}
              <div className="mt-3 text-center">
                <button
                  onClick={() => window.open(`/blacklist?prefill=${encodeURIComponent(senderValue)}&type=${senderType}`, '_blank')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  🚩 Report as Threat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">How to use:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Check Threat:</strong> Verify if a source has been reported by community members</li>
          <li>• <strong>Test SMS Alert:</strong> Simulate receiving a message from this threat (if blacklisted)</li>
          <li>• <strong>Community Reports:</strong> See how many users have flagged this source</li>
          <li>• <strong>Share Warnings:</strong> Help protect others by sharing threat information</li>
          <li>• Make sure to set your phone number in the Blacklist page to receive SMS alerts</li>
          <li>• You must be "watching" a blacklisted item to receive SMS notifications about it</li>
        </ul>
      </div>

      {/* Community Statistics Section */}
      <CommunityStats />
      </div>
      </div>
    </div>
  );
}

export default ThreatChecker;