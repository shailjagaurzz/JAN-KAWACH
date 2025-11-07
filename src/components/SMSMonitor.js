const SMSMonitor = {
  isMonitoring: false,
  fraudDetectionAPI: '/api/fraud-detection',
  lastCheckedSMS: null,

  // Initialize SMS monitoring
  async initialize() {
    console.log('📱 Initializing SMS Fraud Monitor...');
    
    try {
      // Check if we're in a mobile environment
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await this.initializeMobileMonitoring();
      } else {
        await this.initializeWebMonitoring();
      }
      
      this.isMonitoring = true;
      console.log('✅ SMS monitoring activated');
      
    } catch (error) {
      console.error('❌ Failed to initialize SMS monitoring:', error);
    }
  },

  // Mobile-specific SMS monitoring
  async initializeMobileMonitoring() {
    // Monitor SMS notifications
    this.monitorSMSNotifications();
    
    // Monitor clipboard for SMS links
    this.monitorClipboard();
    
    // Monitor app state for SMS app usage
    this.monitorSMSAppUsage();
    
    // Background SMS scanning (if permissions available)
    this.initializeBackgroundScanning();
  },

  // Web-specific monitoring
  async initializeWebMonitoring() {
    // Monitor web-based SMS services
    this.monitorWebSMS();
    
    // Monitor clipboard for suspicious links
    this.monitorClipboard();
    
    // Monitor for SMS-related web activity
    this.monitorSMSWebActivity();
  },

  // Monitor SMS notifications
  monitorSMSNotifications() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sms-monitor-sw.js')
        .then(registration => {
          console.log('📱 SMS monitoring service worker registered');
          
          // Listen for SMS notification events
          registration.addEventListener('message', event => {
            if (event.data.type === 'sms_received') {
              this.handleIncomingSMS(event.data);
            }
          });
        })
        .catch(error => {
          console.warn('SMS monitoring service worker not available:', error);
        });
    }

    // Monitor for notification permission and changes
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.startNotificationMonitoring();
        }
      });
    }
  },

  // Start notification monitoring
  startNotificationMonitoring() {
    // Listen for notification events that might be SMS
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.type === 'notification_received') {
        const notification = event.data.notification;
        
        // Check if notification is from SMS app
        if (this.isSMSNotification(notification)) {
          this.handleSMSNotification(notification);
        }
      }
    });
  },

  // Check if notification is SMS-related
  isSMSNotification(notification) {
    const smsApps = [
      'messages',
      'sms',
      'messaging',
      'text',
      'google messages',
      'samsung messages',
      'default sms'
    ];

    const appName = notification.app?.toLowerCase() || '';
    const title = notification.title?.toLowerCase() || '';
    
    return smsApps.some(app => 
      appName.includes(app) || title.includes(app)
    );
  },

  // Monitor clipboard for SMS links and content
  monitorClipboard() {
    // Check clipboard periodically for suspicious SMS content
    setInterval(async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();
          
          if (clipboardText && clipboardText.length > 0) {
            await this.analyzeSMSContent(clipboardText, 'clipboard');
          }
        }
      } catch (error) {
        // Clipboard access denied or not available
        console.debug('Clipboard monitoring not available');
      }
    }, 3000); // Check every 3 seconds
  },

  // Monitor SMS app usage patterns
  monitorSMSAppUsage() {
    // Monitor app focus changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // App came to foreground - check if coming from SMS app
        this.checkPreviousApp();
      }
    });

    // Monitor page focus
    window.addEventListener('focus', () => {
      this.resumeMonitoring();
    });
  },

  // Initialize background SMS scanning
  initializeBackgroundScanning() {
    // Request SMS permissions (Android)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'sms' }).then(result => {
        if (result.state === 'granted') {
          this.startBackgroundSMSScanning();
        } else {
          console.log('SMS permissions not available');
        }
      }).catch(error => {
        console.log('SMS permissions API not available');
      });
    }
  },

  // Start background SMS scanning
  startBackgroundSMSScanning() {
    // This would use native APIs in a real app
    console.log('📱 Background SMS scanning started');
    
    // Simulate periodic SMS checking
    setInterval(() => {
      this.scanRecentSMS();
    }, 10000); // Check every 10 seconds
  },

  // Monitor web-based SMS services
  monitorWebSMS() {
    // Check if we're on a web SMS service
    const webSMSServices = [
      'messages.google.com',
      'web.telegram.org',
      'web.whatsapp.com',
      'messenger.com'
    ];

    const currentDomain = window.location.hostname;
    const isWebSMSService = webSMSServices.some(service => 
      currentDomain.includes(service)
    );

    if (isWebSMSService) {
      console.log('📱 Detected web SMS service - monitoring messages...');
      this.observeWebSMSMessages();
    }
  },

  // Monitor SMS-related web activity
  monitorSMSWebActivity() {
    // Monitor for SMS-related links being clicked
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && link.href) {
        const href = link.href.toLowerCase();
        
        // Check for SMS protocols and suspicious patterns
        if (href.startsWith('sms:') || href.startsWith('tel:') || 
            this.containsSuspiciousPattern(href)) {
          this.analyzeSMSLink(link.href);
        }
      }
    });

    // Monitor URL changes for SMS-related navigation
    let lastUrl = window.location.href;
    setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        if (this.isSMSRelatedURL(currentUrl)) {
          this.handleSMSRelatedNavigation(currentUrl);
        }
        lastUrl = currentUrl;
      }
    }, 1000);
  },

  // Observe web SMS messages
  observeWebSMSMessages() {
    const messageObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for message elements
            const messages = node.querySelectorAll('[class*="message"], [class*="text"], [data-testid*="message"]');
            messages.forEach(message => {
              this.analyzeWebSMSMessage(message);
            });
          }
        });
      });
    });

    // Start observing the main content area
    const contentArea = document.querySelector('main, [role="main"], #app, .messages-container') || document.body;
    messageObserver.observe(contentArea, {
      childList: true,
      subtree: true
    });
  },

  // Handle incoming SMS
  async handleIncomingSMS(smsData) {
    console.log('📱 Incoming SMS detected:', smsData);
    
    try {
      await this.analyzeSMSContent(smsData.message, 'incoming_sms', {
        phoneNumber: smsData.phoneNumber,
        timestamp: smsData.timestamp
      });
      
    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  },

  // Handle SMS notification
  async handleSMSNotification(notification) {
    console.log('📱 SMS notification detected:', notification);
    
    try {
      await this.analyzeSMSContent(notification.body, 'sms_notification', {
        title: notification.title,
        app: notification.app,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error handling SMS notification:', error);
    }
  },

  // Analyze SMS content for fraud
  async analyzeSMSContent(content, source = 'unknown', metadata = {}) {
    if (!content || content.length === 0) return;

    try {
      // Extract URLs and phone numbers from SMS
      const urls = this.extractURLs(content);
      const phoneNumbers = this.extractPhoneNumbers(content);
      
      const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: content,
          urls: urls,
          phoneNumbers: phoneNumbers,
          type: 'sms_content',
          source: source,
          metadata: metadata,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.isFraud) {
        this.triggerSMSFraudAlert({
          type: 'sms_fraud',
          content: content,
          source: source,
          urls: urls,
          phoneNumbers: phoneNumbers,
          riskLevel: result.riskLevel,
          riskScore: result.riskScore,
          alertMessage: result.alertMessage,
          detectedPatterns: result.detectedPatterns,
          recommendedAction: result.recommendedAction,
          metadata: metadata
        });
      }
      
    } catch (error) {
      console.error('Error analyzing SMS content:', error);
    }
  },

  // Analyze SMS link
  async analyzeSMSLink(url) {
    try {
      const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          urls: [url],
          type: 'sms_link',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.isFraud) {
        this.triggerSMSFraudAlert({
          type: 'sms_link',
          url: url,
          riskLevel: result.riskLevel,
          riskScore: result.riskScore,
          alertMessage: result.alertMessage,
          detectedPatterns: result.detectedPatterns,
          recommendedAction: result.recommendedAction
        });
      }
      
    } catch (error) {
      console.error('Error analyzing SMS link:', error);
    }
  },

  // Analyze web SMS message
  async analyzeWebSMSMessage(messageElement) {
    try {
      const messageText = messageElement.textContent || messageElement.innerText;
      
      if (messageText && messageText.trim().length > 0) {
        await this.analyzeSMSContent(messageText, 'web_sms', {
          element: messageElement.className,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error analyzing web SMS message:', error);
    }
  },

  // Scan recent SMS (simulated)
  async scanRecentSMS() {
    // In a real implementation, this would access device SMS
    console.log('📱 Scanning recent SMS messages...');
    
    // Simulate checking last few SMS
    const simulatedSMS = this.getSimulatedRecentSMS();
    
    for (const sms of simulatedSMS) {
      if (!this.hasBeenChecked(sms.id)) {
        await this.analyzeSMSContent(sms.content, 'background_scan', {
          phoneNumber: sms.phoneNumber,
          timestamp: sms.timestamp
        });
        this.markAsChecked(sms.id);
      }
    }
  },

  // Extract URLs from text
  extractURLs(text) {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|net|org|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|[a-z]{2})[^\s]*)/gi;
    return text.match(urlRegex) || [];
  },

  // Extract phone numbers from text
  extractPhoneNumbers(text) {
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+?91[-.\s]?)?[6-9]\d{9}/g;
    return text.match(phoneRegex) || [];
  },

  // Check if text contains suspicious patterns
  containsSuspiciousPattern(text) {
    const suspiciousPatterns = [
      /urgent.{0,20}action.{0,20}required/i,
      /click.{0,10}here.{0,10}(now|immediately)/i,
      /verify.{0,20}account/i,
      /suspended.{0,20}account/i,
      /won.{0,20}\$[\d,]+/i,
      /congratulations.{0,20}selected/i,
      /limited.{0,10}time.{0,10}offer/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  },

  // Check if URL is SMS-related
  isSMSRelatedURL(url) {
    const smsKeywords = ['sms', 'text', 'message', 'verify', 'otp', 'code'];
    const urlLower = url.toLowerCase();
    
    return smsKeywords.some(keyword => urlLower.includes(keyword));
  },

  // Handle SMS-related navigation
  handleSMSRelatedNavigation(url) {
    console.log('📱 SMS-related navigation detected:', url);
    this.analyzeSMSLink(url);
  },

  // Check previous app (mobile)
  checkPreviousApp() {
    // In a real implementation, this would detect the previous app
    console.log('📱 Checking previous app for SMS activity...');
  },

  // Resume monitoring
  resumeMonitoring() {
    if (!this.isMonitoring) {
      this.initialize();
    }
    console.log('📱 Resumed SMS monitoring');
  },

  // Get simulated recent SMS (for demo)
  getSimulatedRecentSMS() {
    return [
      {
        id: 'sms_' + Date.now(),
        phoneNumber: '+1234567890',
        content: 'Your account has been suspended. Click here to verify: http://suspicious-bank.com/verify',
        timestamp: new Date().toISOString()
      }
    ];
  },

  // Check if SMS has been analyzed
  hasBeenChecked(smsId) {
    const checkedSMS = JSON.parse(localStorage.getItem('checkedSMS') || '[]');
    return checkedSMS.includes(smsId);
  },

  // Mark SMS as checked
  markAsChecked(smsId) {
    const checkedSMS = JSON.parse(localStorage.getItem('checkedSMS') || '[]');
    checkedSMS.push(smsId);
    
    // Keep only last 1000 entries
    if (checkedSMS.length > 1000) {
      checkedSMS.splice(0, checkedSMS.length - 1000);
    }
    
    localStorage.setItem('checkedSMS', JSON.stringify(checkedSMS));
  },

  // Trigger SMS fraud alert
  triggerSMSFraudAlert(alertData) {
    console.log('🚨 SMS FRAUD ALERT TRIGGERED:', alertData);
    
    // Generate unique alert ID
    const alertId = Date.now().toString();
    
    // Create complete alert object
    const alert = {
      id: alertId,
      ...alertData,
      timestamp: new Date().toISOString(),
      source: 'sms_monitor'
    };

    // Trigger custom event for alert popup
    window.dispatchEvent(new CustomEvent('fraudAlert', {
      detail: alert
    }));

    // Play alert sound
    this.playAlertSound(alertData.riskLevel);

    // Trigger device vibration (mobile)
    if (navigator.vibrate) {
      const vibrationPattern = this.getVibrationPattern(alertData.riskLevel);
      navigator.vibrate(vibrationPattern);
    }

    // Show browser notification
    this.showBrowserNotification(alert);

    // Block suspicious links if critical
    if (alertData.riskLevel === 'critical' && alertData.urls) {
      this.blockSuspiciousLinks(alertData.urls);
    }
  },

  // Play alert sound
  playAlertSound(riskLevel) {
    try {
      const audio = new Audio();
      
      const soundUrls = {
        'low': '/sounds/sms-alert-low.mp3',
        'medium': '/sounds/sms-alert-medium.mp3',
        'high': '/sounds/sms-alert-high.mp3',
        'critical': '/sounds/sms-alert-critical.mp3'
      };

      audio.src = soundUrls[riskLevel] || soundUrls['medium'];
      audio.volume = riskLevel === 'critical' ? 1.0 : 0.6;
      audio.play().catch(e => console.log('Audio play blocked by browser'));
      
    } catch (error) {
      console.warn('Could not play SMS alert sound:', error);
    }
  },

  // Get vibration pattern
  getVibrationPattern(riskLevel) {
    const patterns = {
      'low': [150, 100, 150],
      'medium': [250, 100, 250, 100, 250],
      'high': [400, 100, 400, 100, 400, 100, 400],
      'critical': [800, 200, 800, 200, 800, 200, 800]
    };

    return patterns[riskLevel] || patterns['medium'];
  },

  // Show browser notification
  showBrowserNotification(alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Jan-Kawach SMS Fraud Alert', {
        body: alert.alertMessage,
        icon: '/images/sms-fraud-alert-icon.png',
        badge: '/images/fraud-badge.png',
        tag: 'sms-fraud-alert',
        requireInteraction: alert.riskLevel === 'critical',
        actions: [
          {
            action: 'block',
            title: 'Block Content'
          },
          {
            action: 'report',
            title: 'Report Fraud'
          },
          {
            action: 'ignore',
            title: 'Ignore'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 12 seconds unless critical
      if (alert.riskLevel !== 'critical') {
        setTimeout(() => {
          notification.close();
        }, 12000);
      }
    }
  },

  // Block suspicious links
  blockSuspiciousLinks(urls) {
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
    console.log('🚫 Blocked suspicious domains:', urls);
  },

  // Stop monitoring
  stop() {
    this.isMonitoring = false;
    console.log('🛑 SMS monitoring stopped');
  }
};

export default SMSMonitor;