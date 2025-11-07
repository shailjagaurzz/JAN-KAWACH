import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { apiFetch } from '../api';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AnalyticsDashboard = () => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Chart colors
  const CHART_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];
  
  // Sample data for charts (in real app, this would come from analytics API)
  const threatTrendData = [
    { date: '2024-10-19', whatsapp: 12, sms: 8, calls: 5 },
    { date: '2024-10-20', whatsapp: 19, sms: 12, calls: 8 },
    { date: '2024-10-21', whatsapp: 15, sms: 18, calls: 12 },
    { date: '2024-10-22', whatsapp: 22, sms: 14, calls: 9 },
    { date: '2024-10-23', whatsapp: 18, sms: 20, calls: 15 },
    { date: '2024-10-24', whatsapp: 25, sms: 16, calls: 11 },
    { date: '2024-10-25', whatsapp: 32, sms: 22, calls: 18 }
  ];

  const riskDistributionData = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 30, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' },
    { name: 'Critical Risk', value: 5, color: '#7C2D12' }
  ];

  const topThreatsData = [
    { threat: 'Fake WhatsApp Messages', count: 127 },
    { threat: 'SMS Phishing Links', count: 89 },
    { threat: 'Spoofed Calls', count: 67 },
    { threat: 'Investment Scams', count: 45 },
    { threat: 'OTP Fraud', count: 34 }
  ];

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/analytics/dashboard?range=${timeRange}`, {}, token);
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to access analytics</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time fraud detection insights and community impact</p>
        </div>
        
        {/* Time Range Selector */}
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'threats', 'community', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Threats Detected"
              value={analytics.overview?.totalThreats || 0}
              change={analytics.overview?.threatsChange || 0}
              icon="🚨"
              color="red"
            />
            <MetricCard
              title="Community Reports"
              value={analytics.overview?.communityReports || 0}
              change={analytics.overview?.reportsChange || 0}
              icon="🤝"
              color="blue"
            />
            <MetricCard
              title="Fraud Prevented"
              value={`₹${(analytics.overview?.fraudPrevented || 0).toLocaleString()}`}
              change={analytics.overview?.preventedChange || 0}
              icon="💰"
              color="green"
            />
            <MetricCard
              title="Active Users"
              value={analytics.overview?.activeUsers || 0}
              change={analytics.overview?.usersChange || 0}
              icon="👥"
              color="purple"
            />
          </div>

          {/* Threat Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Threat Detection Trends</h3>
            <ThreatTrendsChart data={threatTrendData} />
          </div>

          {/* Risk Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Risk Level Distribution</h3>
              <RiskDistributionChart data={riskDistributionData} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Threat Types</h3>
              <ThreatTypesChart data={topThreatsData} />
            </div>
          </div>
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && analytics && (
        <div className="space-y-6">
          {/* Threat Heatmap */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🗺️ Geographic Threat Distribution</h3>
            <ThreatHeatmap data={analytics.geoThreats} />
          </div>

          {/* Top Threat Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">🔴 Top Threat Numbers</h3>
              <ThreatList threats={analytics.topThreats} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">⚡ Recent Attacks</h3>
              <RecentAttacks attacks={analytics.recentAttacks} />
            </div>
          </div>
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && analytics && (
        <div className="space-y-6">
          {/* Community Impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Community Members"
              value={analytics.community?.totalMembers || 0}
              icon="👥"
              color="blue"
            />
            <MetricCard
              title="Reports Submitted"
              value={analytics.community?.totalReports || 0}
              icon="📋"
              color="green"
            />
            <MetricCard
              title="Lives Protected"
              value={analytics.community?.livesProtected || 0}
              icon="🛡️"
              color="purple"
            />
          </div>

          {/* Top Contributors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🏆 Top Community Contributors</h3>
            <TopContributors contributors={analytics.topContributors} />
          </div>

          {/* Community Growth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📈 Community Growth</h3>
            <CommunityGrowthChart data={analytics.communityGrowth} />
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && analytics && (
        <div className="space-y-6">
          {/* Detection Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Detection Accuracy"
              value={`${analytics.performance?.accuracy || 0}%`}
              icon="🎯"
              color="green"
            />
            <MetricCard
              title="Response Time"
              value={`${analytics.performance?.responseTime || 0}ms`}
              icon="⚡"
              color="blue"
            />
            <MetricCard
              title="False Positives"
              value={`${analytics.performance?.falsePositives || 0}%`}
              icon="⚠️"
              color="orange"
            />
          </div>

          {/* ML Model Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🤖 ML Model Performance</h3>
            <MLPerformanceChart data={analytics.mlPerformance} />
          </div>

          {/* System Health */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">💻 System Health</h3>
            <SystemHealthMetrics health={analytics.systemHealth} />
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}% from last period
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Real Chart Components using Recharts
const ThreatTrendsChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="whatsapp" stroke="#25D366" strokeWidth={2} name="WhatsApp" />
      <Line type="monotone" dataKey="sms" stroke="#F59E0B" strokeWidth={2} name="SMS" />
      <Line type="monotone" dataKey="calls" stroke="#EF4444" strokeWidth={2} name="Calls" />
    </LineChart>
  </ResponsiveContainer>
);

const RiskDistributionChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const ThreatTypesChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="threat" angle={-45} textAnchor="end" height={100} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#3B82F6" />
    </BarChart>
  </ResponsiveContainer>
);

const ThreatHeatmap = ({ data }) => (
  <div className="h-64 bg-gradient-to-br from-red-50 to-orange-50 rounded flex items-center justify-center border">
    <div className="text-center">
      <div className="text-4xl mb-2">🗺️</div>
      <p className="text-gray-600 font-medium">Geographic Threat Heatmap</p>
      <p className="text-sm text-gray-500 mt-1">Real-time threat distribution across regions</p>
      <div className="mt-4 flex justify-center space-x-4 text-xs">
        <div className="flex items-center"><div className="w-3 h-3 bg-green-400 rounded mr-1"></div>Low</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>Medium</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-red-400 rounded mr-1"></div>High</div>
      </div>
    </div>
  </div>
);

const ThreatList = ({ threats }) => (
  <div className="space-y-2">
    {threats?.slice(0, 5).map((threat, index) => (
      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
        <span className="font-mono text-sm">{threat.number}</span>
        <span className="text-red-600 text-sm">{threat.reports} reports</span>
      </div>
    )) || <p className="text-gray-500">No threat data available</p>}
  </div>
);

const RecentAttacks = ({ attacks }) => (
  <div className="space-y-2">
    {attacks?.slice(0, 5).map((attack, index) => (
      <div key={index} className="p-2 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{attack.type}</span>
          <span className="text-xs text-gray-500">{attack.time}</span>
        </div>
        <p className="text-xs text-gray-600">{attack.description}</p>
      </div>
    )) || <p className="text-gray-500">No recent attacks</p>}
  </div>
);

const TopContributors = ({ contributors }) => (
  <div className="space-y-2">
    {contributors?.slice(0, 5).map((contributor, index) => (
      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}</span>
          <span className="text-sm">{contributor.name}</span>
        </div>
        <span className="text-sm font-medium">{contributor.reports} reports</span>
      </div>
    )) || <p className="text-gray-500">No contributor data available</p>}
  </div>
);

const CommunityGrowthChart = ({ data }) => (
  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
    <p className="text-gray-500">📈 Community Growth Line Chart</p>
  </div>
);

const MLPerformanceChart = ({ data }) => (
  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
    <p className="text-gray-500">🤖 ML Performance Metrics</p>
  </div>
);

const SystemHealthMetrics = ({ health }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="text-center p-4 bg-green-50 rounded">
      <p className="text-2xl">🟢</p>
      <p className="text-sm font-medium">API Status</p>
      <p className="text-xs text-gray-600">Operational</p>
    </div>
    <div className="text-center p-4 bg-blue-50 rounded">
      <p className="text-2xl">💾</p>
      <p className="text-sm font-medium">Database</p>
      <p className="text-xs text-gray-600">Healthy</p>
    </div>
    <div className="text-center p-4 bg-purple-50 rounded">
      <p className="text-2xl">⚡</p>
      <p className="text-sm font-medium">Processing</p>
      <p className="text-xs text-gray-600">Normal</p>
    </div>
  </div>
);

export default AnalyticsDashboard;