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
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to access the blacklist</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">🤝 Community Security Blacklist</h2>
          <p className="text-gray-600 text-sm">Protect yourself and others by reporting threats</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowPhoneForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            📱 Set SMS Phone
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            ➕ Add Threat
          </button>
        </div>
      </div>

      {/* Community Impact Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">🌟 Community Impact</h3>
        <p className="text-sm text-blue-800 mb-2">
          When you add a threat to the blacklist, <strong>all community members</strong> benefit:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
          <div className="flex items-center space-x-1">
            <span>🔍</span>
            <span>Appears in Threat Checker for everyone</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🚨</span>
            <span>Triggers real-time fraud alerts</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📊</span>
            <span>Increases community threat database</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Add to Blacklist Form */}
      {showAddForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">🚩 Report New Threat to Community</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> By adding this threat, you're helping protect the entire Jan-Kawach community. 
              This will be visible to all users and used for threat detection.
            </p>
          </div>
          <form onSubmit={handleAddToBlacklist} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📱 Phone Number</option>
                  <option value="url">🌐 URL/Website</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Threat Level</label>
                <select
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {type === 'email' ? 'Email Address' : type === 'phone' ? 'Phone Number' : 'URL'}
                </label>
                <input
                  type={type === 'email' ? 'email' : type === 'url' ? 'url' : 'text'}
                  placeholder={type === 'email' ? 'threat@example.com' : type === 'phone' ? '+1234567890' : 'https://malicious-site.com'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for Blacklisting</label>
              <textarea
                placeholder="Why is this a threat? (e.g., phishing emails, spam calls, malware)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded h-20"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                🚩 Report to Community
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Phone Number Form */}
      {showPhoneForm && (
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Set Phone Number for SMS Alerts</h3>
          <form onSubmit={handleUpdatePhone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Include country code (e.g., +1 for US). You'll receive SMS alerts when blacklisted sources contact you.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Phone Number
              </button>
              <button
                type="button"
                onClick={() => setShowPhoneForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blacklist Items */}
      {loading ? (
        <div className="text-center py-8">Loading blacklist...</div>
      ) : blacklist.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-xl font-semibold mb-2">No Community Threats Yet</h3>
          <p className="mb-4">Be the first to help protect our community by reporting threats.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
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
              <div key={item._id} className="bg-white border rounded-lg p-4 shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <span className="font-semibold text-lg">{item.value}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getThreatLevelColor(item.threatLevel)}`}>
                        {item.threatLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{item.reason}</p>
                    <div className="text-sm text-gray-500">
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
                      className={`px-3 py-1 rounded text-sm ${
                        isWatching 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isWatching ? '🔕 Unwatch' : '🔔 Watch'}
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => handleRemoveFromBlacklist(item._id)}
                        className="px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
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
  );
}

export default Blacklist;