import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { apiFetch, BACKEND } from '../api';

function Blacklist() {
  const { token } = useContext(AuthContext);
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Form state
  const [type, setType] = useState('email');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [threatLevel, setThreatLevel] = useState('medium');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // User phone for SMS
  const [userPhone, setUserPhone] = useState('');
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBlacklist();
    }
  }, [token]);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/blacklist', {}, token);
      const data = await res.json();
      if (data.success) {
        setBlacklist(data.blacklist);
      } else {
        setMessage(data.message || 'Error fetching blacklist');
      }
    } catch (error) {
      setMessage('Error fetching blacklist');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBlacklist = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const res = await apiFetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, reason, threatLevel })
      }, token);
      
      const data = await res.json();
      setMessage(data.message);
      
      if (data.success) {
        setType('email');
        setValue('');
        setReason('');
        setThreatLevel('medium');
        setShowAddForm(false);
        fetchBlacklist(); // Refresh list
      }
    } catch (error) {
      setMessage('Error adding to blacklist');
      console.error('Error:', error);
    }
  };

  const handleWatchToggle = async (entityId, isWatching) => {
    try {
      const method = isWatching ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/blacklist/${entityId}/watch`, { method }, token);
      const data = await res.json();
      setMessage(data.message);
      
      if (data.success) {
        fetchBlacklist(); // Refresh to update watch status
      }
    } catch (error) {
      setMessage('Error updating watch status');
      console.error('Error:', error);
    }
  };

  const handleRemoveFromBlacklist = async (entityId) => {
    if (!window.confirm('Are you sure you want to remove this item from the blacklist?')) {
      return;
    }
    
    try {
      const res = await apiFetch(`/api/blacklist/${entityId}`, { method: 'DELETE' }, token);
      const data = await res.json();
      setMessage(data.message);
      
      if (data.success) {
        fetchBlacklist(); // Refresh list
      }
    } catch (error) {
      setMessage('Error removing from blacklist');
      console.error('Error:', error);
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const res = await apiFetch('/api/user/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone })
      }, token);
      
      const data = await res.json();
      setMessage(data.message);
      
      if (data.success) {
        setShowPhoneForm(false);
      }
    } catch (error) {
      setMessage('Error updating phone number');
      console.error('Error:', error);
    }
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (!token) {
    return (
      <div className="min-h-screen relative overflow-hidden px-4 py-8">
        <div className="hero-orb h-56 w-56 bg-cyan-300/35 -top-10 -left-12" />
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 text-center reveal-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please log in to access the blacklist</h2>
            <p className="text-slate-600">Sign in to report threats and follow community updates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-8">
      <div className="hero-orb h-56 w-56 bg-cyan-300/35 -top-10 -left-12" />
      <div className="hero-orb h-64 w-64 bg-amber-300/35 top-24 -right-16" />
      <div className="max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 reveal-up">
        <div>
          <h2 className="text-3xl font-bold brand-gradient-text">🤝 Community Security Blacklist</h2>
          <p className="text-slate-600 text-sm">Protect yourself and others by reporting threats</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPhoneForm(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform shadow-lg shadow-slate-900/15"
          >
            📱 Set SMS Phone
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform shadow-lg shadow-cyan-600/20"
          >
            ➕ Add Threat
          </button>
        </div>
      </div>

      {/* Community Impact Banner */}
      <div className="glass-panel rounded-3xl p-5 mb-6 reveal-up">
        <h3 className="font-semibold text-slate-900 mb-2">🌟 Community Impact</h3>
        <p className="text-sm text-slate-600 mb-2">
          When you add a threat to the blacklist, <strong>all community members</strong> benefit:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="flex items-center space-x-2 bg-white/80 rounded-2xl px-3 py-2 border border-slate-200">
            <span>🔍</span>
            <span>Appears in Threat Checker for everyone</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 rounded-2xl px-3 py-2 border border-slate-200">
            <span>🚨</span>
            <span>Triggers real-time fraud alerts</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 rounded-2xl px-3 py-2 border border-slate-200">
            <span>📊</span>
            <span>Increases community threat database</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl mb-4 border ${message.includes('Error') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {message}
        </div>
      )}

      {/* Add to Blacklist Form */}
      {showAddForm && (
        <div className="glass-panel rounded-3xl p-6 mb-6 reveal-up">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🚩 Report New Threat to Community</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Important:</strong> By adding this threat, you're helping protect the entire Jan-Kawach community. 
              This will be visible to all users and used for threat detection.
            </p>
          </div>
          <form onSubmit={handleAddToBlacklist} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/80"
                  required
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📱 Phone Number</option>
                  <option value="url">🌐 URL/Website</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Threat Level</label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/80"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {type === 'email' ? 'Email Address' : type === 'phone' ? 'Phone Number' : 'URL'}
                </label>
                <input
                  type={type === 'email' ? 'email' : type === 'url' ? 'url' : 'text'}
                  placeholder={type === 'email' ? 'threat@example.com' : type === 'phone' ? '+1234567890' : 'https://malicious-site.com'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-white/80"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Blacklisting</label>
              <textarea
                placeholder="Why is this a threat? (e.g., phishing emails, spam calls, malware)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white/80 h-24"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform"
              >
                🚩 Report to Community
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Phone Number Form */}
      {showPhoneForm && (
        <div className="glass-panel rounded-3xl p-6 mb-6 reveal-up">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Set Phone Number for SMS Alerts</h3>
          <form onSubmit={handleUpdatePhone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-2xl bg-white/80"
                required
              />
              <p className="text-sm text-slate-600 mt-1">
                Include country code (e.g., +1 for US). You'll receive SMS alerts when blacklisted sources contact you.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform"
              >
                Save Phone Number
              </button>
              <button
                type="button"
                onClick={() => setShowPhoneForm(false)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-2xl hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blacklist Items */}
      {loading ? (
        <div className="text-center py-8 glass-panel rounded-3xl">Loading blacklist...</div>
      ) : blacklist.length === 0 ? (
        <div className="text-center py-8 text-slate-500 glass-panel rounded-3xl">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-2">No Community Threats Yet</h3>
          <p className="mb-4">Be the first to help protect our community by reporting threats.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white px-6 py-2 rounded-2xl hover:-translate-y-0.5 transition-transform"
          >
            🚩 Report First Threat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {blacklist.map((item) => {
            const isCreator = item.reportedBy && item.reportedBy._id;
            const isWatching = item.usersWatching && item.usersWatching.length > 0;
            
            return (
              <div key={item._id} className="glass-panel rounded-3xl p-4 hover-lift">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <span className="font-semibold text-lg text-slate-900">{item.value}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getThreatLevelColor(item.threatLevel)}`}>
                        {item.threatLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-2">{item.reason}</p>
                    <div className="text-sm text-slate-500">
                      <span>🚩 Reported by: {item.reportedBy?.name || 'Community Member'}</span>
                      <span className="mx-2">•</span>
                      <span>📊 Community Reports: {item.reportCount}</span>
                      <span className="mx-2">•</span>
                      <span>👥 Active Watchers: {item.usersWatching?.length || 0}</span>
                      <span className="mx-2">•</span>
                      <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleWatchToggle(item._id, isWatching)}
                        className={`px-3 py-1 rounded-2xl text-sm ${
                        isWatching 
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                          : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                      }`}
                    >
                      {isWatching ? '🔕 Unwatch' : '🔔 Watch'}
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => handleRemoveFromBlacklist(item._id)}
                        className="px-3 py-1 rounded-2xl text-sm bg-rose-50 text-rose-700 hover:bg-rose-100"
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

export default Blacklist;