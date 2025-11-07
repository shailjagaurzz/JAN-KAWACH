// Main Fraud Detection System Integration
// This is the central hub that coordinates all fraud detection components

import WhatsAppMonitor from './WhatsAppMonitor.js';
import SMSMonitor from './SMSMonitor.js';
import FraudAlertSystem from './FraudAlertSystem.js';
import AlertPopup from './AlertPopup.js';

class MainFraudDetectionSystem {
  constructor() {
    this.isInitialized = false;
    this.isActive = false;
    this.monitors = {
      whatsapp: WhatsAppMonitor,
      sms: SMSMonitor
    };
    this.alertSystem = null;
    this.settings = this.loadSettings();
    this.statistics = this.initializeStatistics();
  }

  // Initialize the complete fraud detection system
  async initialize() {
    console.log('🔐 Initializing Jan-Kawach Fraud Detection System...');
    
    try {
      // Check user authentication
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('User not authenticated - fraud detection running in limited mode');
      }

      // Load user settings
      await this.loadUserSettings();

      // Initialize alert system
      this.alertSystem = new FraudAlertSystem();
      await this.alertSystem.initialize();

      // Initialize monitoring components
      await this.initializeMonitors();

      // Set up global event listeners
      this.setupGlobalEventListeners();

      // Start real-time monitoring
      await this.startRealTimeMonitoring();

      // Set up system health monitoring
      this.setupSystemHealthMonitoring();

      this.isInitialized = true;
      this.isActive = true;

      console.log('✅ Jan-Kawach Fraud Detection System fully initialized');
      
      // Show initialization notification
      this.showSystemNotification('Jan-Kawach Protection Activated', 'success');

      // Start background tasks
      this.startBackgroundTasks();

    } catch (error) {
      console.error('❌ Failed to initialize fraud detection system:', error);
      this.showSystemNotification('Fraud detection system failed to start', 'error');
    }
  }

  // Initialize all monitoring components
  async initializeMonitors() {
    console.log('🔍 Initializing fraud monitors...');

    // Initialize WhatsApp monitor
    if (this.settings.enableWhatsAppMonitoring) {
      try {
        await this.monitors.whatsapp.initialize();
        console.log('✅ WhatsApp monitor ready');
      } catch (error) {
        console.error('❌ WhatsApp monitor failed:', error);
      }
    }

    // Initialize SMS monitor
    if (this.settings.enableSMSMonitoring) {
      try {
        await this.monitors.sms.initialize();
        console.log('✅ SMS monitor ready');
      } catch (error) {
        console.error('❌ SMS monitor failed:', error);
      }
    }

    // Initialize additional monitors if needed
    await this.initializeAdditionalMonitors();
  }

  // Initialize additional monitoring capabilities
  async initializeAdditionalMonitors() {
    // Phone call monitoring
    if (this.settings.enableCallMonitoring) {
      await this.initializeCallMonitoring();
    }

    // Email monitoring
    if (this.settings.enableEmailMonitoring) {
      await this.initializeEmailMonitoring();
    }

    // Web browsing protection
    if (this.settings.enableWebProtection) {
      await this.initializeWebProtection();
    }
  }

  // Initialize call monitoring
  async initializeCallMonitoring() {
    console.log('📞 Initializing call monitoring...');
    
    // Monitor for incoming calls
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/call-monitor-sw.js');
        console.log('📞 Call monitoring service worker registered');
      } catch (error) {
        console.warn('Call monitoring not available:', error);
      }
    }
  }

  // Initialize email monitoring
  async initializeEmailMonitoring() {
    console.log('📧 Initializing email monitoring...');
    
    // Monitor for phishing emails
    this.setupEmailPhishingDetection();
  }

  // Initialize web protection
  async initializeWebProtection() {
    console.log('🌐 Initializing web protection...');
    
    // Block malicious websites
    this.setupMaliciousWebsiteBlocking();
    
    // Monitor for phishing attempts
    this.setupPhishingDetection();
  }

  // Setup global event listeners
  setupGlobalEventListeners() {
    // Listen for fraud alerts from all monitors
    window.addEventListener('fraudAlert', (event) => {
      this.handleFraudAlert(event.detail);
    });

    // Listen for system events
    window.addEventListener('online', () => {
      this.handleConnectionChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleConnectionChange(false);
    });

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Listen for beforeunload to save state
    window.addEventListener('beforeunload', () => {
      this.saveSystemState();
    });
  }

  // Start real-time monitoring
  async startRealTimeMonitoring() {
    console.log('⚡ Starting real-time fraud monitoring...');

    // Start real-time alert stream
    if (this.alertSystem) {
      await this.alertSystem.startRealTimeMonitoring();
    }

    // Start periodic security scans
    this.startPeriodicScans();

    // Start threat intelligence updates
    this.startThreatIntelligenceUpdates();
  }

  // Start periodic security scans
  startPeriodicScans() {
    // Scan every 5 minutes
    setInterval(() => {
      this.performSecurityScan();
    }, 5 * 60 * 1000);

    // Immediate scan
    setTimeout(() => {
      this.performSecurityScan();
    }, 10000); // After 10 seconds
  }

  // Perform comprehensive security scan
  async performSecurityScan() {
    console.log('🔍 Performing security scan...');

    try {
      // Scan device for suspicious activity
      const scanResults = await this.scanDeviceActivity();

      // Check for new threats
      const threatCheck = await this.checkForNewThreats();

      // Update fraud patterns
      const patternUpdate = await this.updateFraudPatterns();

      // Compile scan report
      const scanReport = {
        timestamp: new Date().toISOString(),
        deviceActivity: scanResults,
        threatCheck: threatCheck,
        patternUpdate: patternUpdate,
        status: 'completed'
      };

      // Store scan results
      this.storeScanResults(scanReport);

      console.log('✅ Security scan completed');

    } catch (error) {
      console.error('❌ Security scan failed:', error);
    }
  }

  // Scan device activity
  async scanDeviceActivity() {
    const activity = {
      suspiciousApps: [],
      recentCalls: [],
      recentSMS: [],
      networkActivity: [],
      timestamp: new Date().toISOString()
    };

    // Check for suspicious app activity
    activity.suspiciousApps = await this.checkSuspiciousApps();

    // Check recent communications
    activity.recentCalls = await this.checkRecentCalls();
    activity.recentSMS = await this.checkRecentSMS();

    // Check network activity
    activity.networkActivity = await this.checkNetworkActivity();

    return activity;
  }

  // Check for suspicious apps
  async checkSuspiciousApps() {
    // In a real implementation, this would scan installed apps
    return [];
  }

  // Check recent calls for fraud
  async checkRecentCalls() {
    // In a real implementation, this would analyze call logs
    return [];
  }

  // Check recent SMS for fraud
  async checkRecentSMS() {
    // In a real implementation, this would analyze SMS messages
    return [];
  }

  // Check network activity
  async checkNetworkActivity() {
    // Monitor for suspicious network connections
    return {
      suspiciousConnections: [],
      blockedDomains: JSON.parse(localStorage.getItem('blockedDomains') || '[]'),
      trafficAnalysis: {
        totalRequests: 0,
        suspiciousRequests: 0,
        blockedRequests: 0
      }
    };
  }

  // Start threat intelligence updates
  startThreatIntelligenceUpdates() {
    // Update threat intelligence every hour
    setInterval(() => {
      this.updateThreatIntelligence();
    }, 60 * 60 * 1000);

    // Immediate update
    setTimeout(() => {
      this.updateThreatIntelligence();
    }, 30000); // After 30 seconds
  }

  // Update threat intelligence
  async updateThreatIntelligence() {
    console.log('🛡️ Updating threat intelligence...');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/fraud-detection/threat-intelligence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const intelligence = await response.json();
        this.processThreatIntelligence(intelligence);
        console.log('✅ Threat intelligence updated');
      }

    } catch (error) {
      console.error('❌ Threat intelligence update failed:', error);
    }
  }

  // Process threat intelligence
  processThreatIntelligence(intelligence) {
    // Update suspicious numbers
    if (intelligence.suspiciousNumbers) {
      this.updateSuspiciousNumbers(intelligence.suspiciousNumbers);
    }

    // Update fraud patterns
    if (intelligence.fraudPatterns) {
      this.updateLocalFraudPatterns(intelligence.fraudPatterns);
    }

    // Update malicious domains
    if (intelligence.maliciousDomains) {
      this.updateMaliciousDomains(intelligence.maliciousDomains);
    }
  }

  // Handle fraud alert
  async handleFraudAlert(alertData) {
    console.log('🚨 Handling fraud alert:', alertData);

    // Update statistics
    this.updateStatistics(alertData);

    // Log the alert
    this.logFraudAlert(alertData);

    // Check if critical alert needs immediate action
    if (alertData.riskLevel === 'critical') {
      await this.handleCriticalAlert(alertData);
    }

    // Send alert to backend for analysis
    await this.reportAlertToBackend(alertData);
  }

  // Handle critical alerts
  async handleCriticalAlert(alertData) {
    console.log('🔥 CRITICAL FRAUD ALERT - Taking immediate action');

    // Block the source immediately
    if (alertData.phoneNumber) {
      await this.blockPhoneNumber(alertData.phoneNumber);
    }

    if (alertData.urls) {
      await this.blockURLs(alertData.urls);
    }

    // Notify emergency contacts if configured
    if (this.settings.emergencyNotifications) {
      await this.notifyEmergencyContacts(alertData);
    }

    // Trigger maximum security mode
    this.activateMaximumSecurity();
  }

  // Block phone number
  async blockPhoneNumber(phoneNumber) {
    const blockedNumbers = JSON.parse(localStorage.getItem('blockedNumbers') || '[]');
    if (!blockedNumbers.includes(phoneNumber)) {
      blockedNumbers.push(phoneNumber);
      localStorage.setItem('blockedNumbers', JSON.stringify(blockedNumbers));
      console.log('🚫 Blocked phone number:', phoneNumber);
    }
  }

  // Block URLs
  async blockURLs(urls) {
    const blockedDomains = JSON.parse(localStorage.getItem('blockedDomains') || '[]');
    
    urls.forEach(url => {
      try {
        const domain = new URL(url).hostname;
        if (!blockedDomains.includes(domain)) {
          blockedDomains.push(domain);
        }
      } catch (error) {
        console.warn('Invalid URL:', url);
      }
    });
    
    localStorage.setItem('blockedDomains', JSON.stringify(blockedDomains));
    console.log('🚫 Blocked domains:', urls);
  }

  // Activate maximum security mode
  activateMaximumSecurity() {
    console.log('🔒 Activating maximum security mode');
    
    // Enable all monitoring
    this.settings.enableWhatsAppMonitoring = true;
    this.settings.enableSMSMonitoring = true;
    this.settings.enableCallMonitoring = true;
    this.settings.enableWebProtection = true;
    
    // Increase alert sensitivity
    this.settings.alertSensitivity = 'maximum';
    
    // Save settings
    this.saveSettings();
    
    // Show security mode notification
    this.showSystemNotification('Maximum Security Mode Activated', 'warning');
  }

  // Setup system health monitoring
  setupSystemHealthMonitoring() {
    // Monitor system health every minute
    setInterval(() => {
      this.checkSystemHealth();
    }, 60 * 1000);
  }

  // Check system health
  checkSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      components: {
        whatsappMonitor: this.monitors.whatsapp.isMonitoring,
        smsMonitor: this.monitors.sms.isMonitoring,
        alertSystem: this.alertSystem ? this.alertSystem.isActive : false
      },
      memory: this.getMemoryUsage(),
      performance: this.getPerformanceMetrics()
    };

    // Check for issues
    const hasIssues = !Object.values(health.components).every(status => status);
    if (hasIssues) {
      health.status = 'degraded';
      console.warn('⚠️ System health issues detected:', health);
      this.handleHealthIssues(health);
    }

    // Store health report
    this.storeHealthReport(health);
  }

  // Handle health issues
  handleHealthIssues(health) {
    // Try to restart failed components
    Object.entries(health.components).forEach(([component, status]) => {
      if (!status) {
        this.restartComponent(component);
      }
    });
  }

  // Restart component
  async restartComponent(componentName) {
    console.log(`🔄 Restarting ${componentName}...`);
    
    try {
      switch (componentName) {
        case 'whatsappMonitor':
          await this.monitors.whatsapp.initialize();
          break;
        case 'smsMonitor':
          await this.monitors.sms.initialize();
          break;
        case 'alertSystem':
          if (this.alertSystem) {
            await this.alertSystem.initialize();
          }
          break;
      }
      console.log(`✅ ${componentName} restarted successfully`);
    } catch (error) {
      console.error(`❌ Failed to restart ${componentName}:`, error);
    }
  }

  // Load user settings
  async loadUserSettings() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('/api/fraud-detection/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const serverSettings = await response.json();
          this.settings = { ...this.settings, ...serverSettings };
        }
      }
    } catch (error) {
      console.warn('Could not load server settings, using defaults');
    }
  }

  // Load default settings
  loadSettings() {
    const defaultSettings = {
      enableWhatsAppMonitoring: true,
      enableSMSMonitoring: true,
      enableCallMonitoring: true,
      enableEmailMonitoring: false,
      enableWebProtection: true,
      alertSensitivity: 'medium',
      soundAlerts: true,
      vibrationAlerts: true,
      browserNotifications: true,
      emergencyNotifications: false,
      emergencyContacts: []
    };

    const savedSettings = localStorage.getItem('fraudDetectionSettings');
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  }

  // Save settings
  saveSettings() {
    localStorage.setItem('fraudDetectionSettings', JSON.stringify(this.settings));
  }

  // Initialize statistics
  initializeStatistics() {
    const defaultStats = {
      totalAlerts: 0,
      blockedThreats: 0,
      fraudPrevented: 0,
      lastScan: null,
      alertsToday: 0,
      riskLevelCounts: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    const savedStats = localStorage.getItem('fraudDetectionStats');
    return savedStats ? JSON.parse(savedStats) : defaultStats;
  }

  // Update statistics
  updateStatistics(alertData) {
    this.statistics.totalAlerts++;
    this.statistics.alertsToday++;
    this.statistics.riskLevelCounts[alertData.riskLevel]++;
    
    if (alertData.blocked) {
      this.statistics.blockedThreats++;
    }

    this.saveStatistics();
  }

  // Save statistics
  saveStatistics() {
    localStorage.
    
    setItem('fraudDetectionStats', JSON.stringify(this.statistics));
  }

  // Start background tasks
  startBackgroundTasks() {
    // Clean up old data every day
    setInterval(() => {
      this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);

    // Reset daily counters at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyCounters();
      // Then repeat every 24 hours
      setInterval(() => {
        this.resetDailyCounters();
      }, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  // Reset daily counters
  resetDailyCounters() {
    this.statistics.alertsToday = 0;
    this.saveStatistics();
    console.log('📊 Daily counters reset');
  }

  // Cleanup old data
  cleanupOldData() {
    console.log('🧹 Cleaning up old data...');
    
    // Clean up old scan results (keep last 30 days)
    const scanResults = JSON.parse(localStorage.getItem('scanResults') || '[]');
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const filteredResults = scanResults.filter(result => 
      new Date(result.timestamp).getTime() > thirtyDaysAgo
    );
    localStorage.setItem('scanResults', JSON.stringify(filteredResults));

    // Clean up old health reports (keep last 7 days)
    const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filteredReports = healthReports.filter(report => 
      new Date(report.timestamp).getTime() > sevenDaysAgo
    );
    localStorage.setItem('healthReports', JSON.stringify(filteredReports));

    console.log('✅ Data cleanup completed');
  }

  // Show system notification
  showSystemNotification(message, type = 'info') {
    const notification = {
      message,
      type,
      timestamp: new Date().toISOString()
    };

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('systemNotification', {
      detail: notification
    }));

    console.log(`📢 System notification (${type}): ${message}`);
  }

  // Get memory usage
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
      domReady: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0
    };
  }

  // Store scan results
  storeScanResults(results) {
    const scanResults = JSON.parse(localStorage.getItem('scanResults') || '[]');
    scanResults.push(results);
    localStorage.setItem('scanResults', JSON.stringify(scanResults));
  }

  // Store health report
  storeHealthReport(report) {
    const healthReports = JSON.parse(localStorage.getItem('healthReports') || '[]');
    healthReports.push(report);
    localStorage.setItem('healthReports', JSON.stringify(healthReports));
  }

  // Handle connection change
  handleConnectionChange(online) {
    if (online) {
      console.log('🌐 Connection restored - resuming full monitoring');
      this.resumeFullMonitoring();
    } else {
      console.log('📡 Connection lost - switching to offline mode');
      this.switchToOfflineMode();
    }
  }

  // Resume full monitoring
  resumeFullMonitoring() {
    // Restart all monitors
    Object.values(this.monitors).forEach(monitor => {
      if (monitor.resumeMonitoring) {
        monitor.resumeMonitoring();
      }
    });

    // Restart alert system
    if (this.alertSystem && this.alertSystem.resumeMonitoring) {
      this.alertSystem.resumeMonitoring();
    }
  }

  // Switch to offline mode
  switchToOfflineMode() {
    console.log('📴 Switched to offline monitoring mode');
    // Continue monitoring with local data only
  }

  // Handle visibility change
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('📱 App in background - maintaining monitoring');
    } else {
      console.log('📱 App in foreground - full monitoring active');
    }
  }

  // Save system state
  saveSystemState() {
    const state = {
      isActive: this.isActive,
      settings: this.settings,
      statistics: this.statistics,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('fraudDetectionState', JSON.stringify(state));
  }

  // Get system status
  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      monitors: Object.fromEntries(
        Object.entries(this.monitors).map(([name, monitor]) => [
          name, 
          monitor.isMonitoring || false
        ])
      ),
      alertSystem: this.alertSystem ? this.alertSystem.isActive : false,
      statistics: this.statistics,
      settings: this.settings
    };
  }

  // Stop the fraud detection system
  stop() {
    console.log('🛑 Stopping fraud detection system...');

    // Stop all monitors
    Object.values(this.monitors).forEach(monitor => {
      if (monitor.stop) {
        monitor.stop();
      }
    });

    // Stop alert system
    if (this.alertSystem && this.alertSystem.stop) {
      this.alertSystem.stop();
    }

    this.isActive = false;
    this.saveSystemState();

    console.log('✅ Fraud detection system stopped');
  }
}

// Create global instance
const fraudDetectionSystem = new MainFraudDetectionSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fraudDetectionSystem.initialize();
  });
} else {
  fraudDetectionSystem.initialize();
}

export default fraudDetectionSystem;