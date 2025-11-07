const WhatsAppMonitor = {
  isMonitoring: false,
  listeners: [],
  fraudDetectionAPI: '/api/fraud-detection',

  // Initialize WhatsApp monitoring
  async initialize() {
    console.log('🔍 Initializing WhatsApp Fraud Monitor...');
    
    try {
      // Check if we're in a mobile environment
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await this.initializeMobileMonitoring();
      } else {
        await this.initializeWebMonitoring();
      }
      
      this.isMonitoring = true;
      console.log('✅ WhatsApp monitoring activated');
      
    } catch (error) {
      console.error('❌ Failed to initialize WhatsApp monitoring:', error);
    }
  },

  // Mobile-specific monitoring
  async initializeMobileMonitoring() {
    // Monitor incoming calls
    this.monitorIncomingCalls();
    
    // Monitor app state changes (WhatsApp opening/closing)
    this.monitorAppStateChanges();
    
    // Monitor clipboard for WhatsApp links
    this.monitorClipboard();
    
    // Monitor notification access
    this.monitorNotifications();
  },

  // Web-specific monitoring
  async initializeWebMonitoring() {
    // Monitor WhatsApp Web
    this.monitorWhatsAppWeb();
    
    // Monitor clipboard for phone numbers and links
    this.monitorClipboard();
    
    // Monitor page focus for WhatsApp tabs
    this.monitorPageFocus();
  },

  // Monitor incoming calls
  monitorIncomingCalls() {
    // Check if Device API is available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/whatsapp-monitor-sw.js')
        .then(registration => {
          console.log('📞 Call monitoring service worker registered');
          
          // Listen for incoming call events
          registration.addEventListener('message', event => {
            if (event.data.type === 'incoming_call') {
              this.handleIncomingCall(event.data.phoneNumber);
            }
          });
        })
        .catch(error => {
          console.warn('Call monitoring not available:', error);
        });
    }

    // Fallback: Monitor phone state changes (if accessible)
    if ('connection' in navigator) {
      const connection = navigator.connection;
      connection.addEventListener('change', () => {
        // Monitor for call state changes
        this.checkCallState();
      });
    }
  },

  // Monitor app state changes
  monitorAppStateChanges() {
    // Monitor visibility changes (app switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background - might be switching to WhatsApp
        this.checkActiveApp();
      } else {
        // App came to foreground
        this.resumeMonitoring();
      }
    });

    // Monitor page focus
    window.addEventListener('focus', () => {
      this.resumeMonitoring();
    });

    window.addEventListener('blur', () => {
      this.checkActiveApp();
    });
  },

  // Monitor clipboard for suspicious content
  monitorClipboard() {
    // Check clipboard periodically for phone numbers and links
    setInterval(async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipboardText = await navigator.clipboard.readText();
          
          if (clipboardText && clipboardText.length > 0) {
            await this.analyzeClipboardContent(clipboardText);
          }
        }
      } catch (error) {
        // Clipboard access denied or not available
        console.debug('Clipboard monitoring not available');
      }
    }, 2000); // Check every 2 seconds
  },

  // Monitor notifications for WhatsApp messages
  monitorNotifications() {
    if ('Notification' in window) {
      // Request notification permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Monitor notification events
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
              if (event.data.type === 'whatsapp_notification') {
                this.handleWhatsAppNotification(event.data);
              }
            });
          }
        }
      });
    }
  },

  // Monitor WhatsApp Web
  monitorWhatsAppWeb() {
    // Check if we're on WhatsApp Web
    const isWhatsAppWeb = window.location.hostname.includes('web.whatsapp.com');
    
    if (isWhatsAppWeb) {
      console.log('🔍 Detected WhatsApp Web - Monitoring messages...');
      
      // Monitor DOM changes for new messages
      this.observeWhatsAppMessages();
      
      // Monitor contact additions
      this.observeContactChanges();
    }

    // Monitor for WhatsApp Web opening in new tabs
    window.addEventListener('beforeunload', () => {
      // Check if user is navigating to WhatsApp Web
      const destination = document.activeElement?.href;
      if (destination && destination.includes('web.whatsapp.com')) {
        console.log('🔍 User navigating to WhatsApp Web');
      }
    });
  },

  // Observe WhatsApp messages in web interface
  observeWhatsAppMessages() {
    const messageObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for new message elements
            const messages = node.querySelectorAll('[data-testid="msg-container"]');
            messages.forEach(message => {
              this.analyzeWhatsAppMessage(message);
            });
          }
        });
      });
    });

    // Start observing WhatsApp chat container
    const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (chatContainer) {
      messageObserver.observe(chatContainer, {
        childList: true,
        subtree: true
      });
    }
  },

  // Monitor page focus for WhatsApp detection
  monitorPageFocus() {
    let focusTimer;
    
    window.addEventListener('focus', () => {
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        // Check if user might be using WhatsApp
        this.detectWhatsAppUsage();
      }, 1000);
    });
  },

  // Handle incoming call detection
  async handleIncomingCall(phoneNumber) {
    console.log('📞 Incoming call detected:', phoneNumber);
    
    try {
      const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          type: 'incoming_call',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.isFraud) {
        this.triggerFraudAlert({
          type: 'incoming_call',
          phoneNumber: phoneNumber,
          riskLevel: result.riskLevel,
          riskScore: result.riskScore,
          alertMessage: result.alertMessage,
          detectedPatterns: result.detectedPatterns,
          recommendedAction: result.recommendedAction
        });
      }
      
    } catch (error) {
      console.error('Error checking incoming call:', error);
    }
  },

  // Handle WhatsApp notification
  async handleWhatsAppNotification(data) {
    console.log('💬 WhatsApp notification detected:', data);
    
    try {
      const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          message: data.message,
          type: 'whatsapp_message',
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.isFraud) {
        this.triggerFraudAlert({
          type: 'whatsapp_message',
          phoneNumber: data.phoneNumber,
          message: data.message,
          riskLevel: result.riskLevel,
          riskScore: result.riskScore,
          alertMessage: result.alertMessage,
          detectedPatterns: result.detectedPatterns,
          recommendedAction: result.recommendedAction
        });
      }
      
    } catch (error) {
      console.error('Error checking WhatsApp notification:', error);
    }
  },

  // Analyze clipboard content
  async analyzeClipboardContent(content) {
    // Check for phone numbers
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const phoneMatches = content.match(phoneRegex);
    const urlMatches = content.match(urlRegex);
    
    if (phoneMatches || urlMatches) {
      try {
        const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            phoneNumber: phoneMatches ? phoneMatches[0] : null,
            message: content,
            urls: urlMatches,
            type: 'clipboard_content',
            timestamp: new Date().toISOString()
          })
        });

        const result = await response.json();
        
        if (result.isFraud) {
          this.triggerFraudAlert({
            type: 'clipboard_content',
            content: content,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            alertMessage: result.alertMessage,
            detectedPatterns: result.detectedPatterns,
            recommendedAction: result.recommendedAction
          });
        }
        
      } catch (error) {
        console.error('Error checking clipboard content:', error);
      }
    }
  },

  // Analyze WhatsApp message from web interface
  async analyzeWhatsAppMessage(messageElement) {
    try {
      const messageText = messageElement.querySelector('[data-testid="msg-text"]')?.textContent;
      const messageTime = messageElement.querySelector('[data-testid="msg-time"]')?.textContent;
      
      if (messageText) {
        const response = await fetch(`${this.fraudDetectionAPI}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: messageText,
            type: 'whatsapp_web_message',
            timestamp: new Date().toISOString()
          })
        });

        const result = await response.json();
        
        if (result.isFraud) {
          this.triggerFraudAlert({
            type: 'whatsapp_web_message',
            message: messageText,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            alertMessage: result.alertMessage,
            detectedPatterns: result.detectedPatterns,
            recommendedAction: result.recommendedAction
          });
        }
      }
      
    } catch (error) {
      console.error('Error analyzing WhatsApp message:', error);
    }
  },

  // Check current call state
  checkCallState() {
    // Placeholder for call state detection
    // In a real implementation, this would use device APIs
    console.log('🔍 Checking call state...');
  },

  // Check active app (mobile)
  checkActiveApp() {
    // Placeholder for active app detection
    // In a real implementation, this would detect if WhatsApp is active
    console.log('🔍 Checking active app...');
  },

  // Detect WhatsApp usage patterns
  detectWhatsAppUsage() {
    // Check various indicators of WhatsApp usage
    const indicators = {
      hasWhatsAppWebOpen: this.hasWhatsAppWebOpen(),
      hasWhatsAppMobile: this.hasWhatsAppMobile(),
      recentClipboardActivity: this.hasRecentClipboardActivity()
    };
    
    console.log('🔍 WhatsApp usage indicators:', indicators);
  },

  // Check if WhatsApp Web is open
  hasWhatsAppWebOpen() {
    return window.location.hostname.includes('web.whatsapp.com') ||
           document.title.includes('WhatsApp');
  },

  // Check if WhatsApp mobile is likely active
  hasWhatsAppMobile() {
    // Check for mobile indicators
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile && document.hidden; // App is in background on mobile
  },

  // Check for recent clipboard activity
  hasRecentClipboardActivity() {
    // This would track recent clipboard changes
    return false; // Placeholder
  },

  // Resume monitoring after focus
  resumeMonitoring() {
    if (!this.isMonitoring) {
      this.initialize();
    }
    console.log('🔍 Resumed fraud monitoring');
  },

  // Observe contact changes in WhatsApp Web
  observeContactChanges() {
    const contactObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // Check for new contacts or contact changes
        if (mutation.target.dataset && mutation.target.dataset.testid === 'contact-list') {
          console.log('👥 Contact list changed - checking for suspicious contacts');
        }
      });
    });

    const contactList = document.querySelector('[data-testid="contact-list"]');
    if (contactList) {
      contactObserver.observe(contactList, {
        childList: true,
        subtree: true
      });
    }
  },

  // Trigger fraud alert
  triggerFraudAlert(alertData) {
    console.log('🚨 FRAUD ALERT TRIGGERED:', alertData);
    
    // Generate unique alert ID
    const alertId = Date.now().toString();
    
    // Create complete alert object
    const alert = {
      id: alertId,
      ...alertData,
      timestamp: new Date().toISOString(),
      source: 'whatsapp_monitor'
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
  },

  // Play alert sound based on risk level
  playAlertSound(riskLevel) {
    try {
      const audio = new Audio();
      
      // Different sounds for different risk levels
      const soundUrls = {
        'low': '/sounds/alert-low.mp3',
        'medium': '/sounds/alert-medium.mp3',
        'high': '/sounds/alert-high.mp3',
        'critical': '/sounds/alert-critical.mp3'
      };

      audio.src = soundUrls[riskLevel] || soundUrls['medium'];
      audio.volume = riskLevel === 'critical' ? 1.0 : 0.7;
      audio.play().catch(e => console.log('Audio play blocked by browser'));
      
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  },

  // Get vibration pattern based on risk level
  getVibrationPattern(riskLevel) {
    const patterns = {
      'low': [200, 100, 200],
      'medium': [300, 100, 300, 100, 300],
      'high': [500, 100, 500, 100, 500, 100, 500],
      'critical': [1000, 200, 1000, 200, 1000]
    };

    return patterns[riskLevel] || patterns['medium'];
  },

  // Show browser notification
  showBrowserNotification(alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Jan-Kawach Fraud Alert', {
        body: alert.alertMessage,
        icon: '/images/fraud-alert-icon.png',
        badge: '/images/fraud-badge.png',
        tag: 'fraud-alert',
        requireInteraction: alert.riskLevel === 'critical',
        actions: [
          {
            action: 'block',
            title: 'Block Number'
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

      // Auto-close after 10 seconds unless critical
      if (alert.riskLevel !== 'critical') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    }
  },

  // Stop monitoring
  stop() {
    this.isMonitoring = false;
    console.log('🛑 WhatsApp monitoring stopped');
  }
};

export default WhatsAppMonitor;