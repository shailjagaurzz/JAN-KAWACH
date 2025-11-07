// WhatsApp Monitor Service Worker
// This service worker runs in the background to monitor WhatsApp notifications and calls

const CACHE_NAME = 'jan-kawach-whatsapp-monitor-v1';
const API_BASE = '/api/fraud-detection';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('📱 WhatsApp Monitor Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📱 WhatsApp Monitor cache opened');
      return cache.addAll([
        '/sounds/alert-low.mp3',
        '/sounds/alert-medium.mp3', 
        '/sounds/alert-high.mp3',
        '/sounds/alert-critical.mp3'
      ]).catch(() => {
        console.log('📱 Audio files not yet available, will load later');
      });
    })
  );
  
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('📱 WhatsApp Monitor Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('📱 Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  console.log('📱 WhatsApp Monitor received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_MONITORING':
      startWhatsAppMonitoring(data);
      break;
    case 'STOP_MONITORING':
      stopWhatsAppMonitoring();
      break;
    case 'CHECK_CALL_STATE':
      checkCallState();
      break;
    case 'ANALYZE_NOTIFICATION':
      analyzeNotification(data);
      break;
    default:
      console.log('📱 Unknown message type:', type);
  }
});

// Listen for push notifications (WhatsApp notifications)
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event);
  
  if (event.data) {
    try {
      const notificationData = event.data.json();
      
      // Check if this is a WhatsApp notification
      if (isWhatsAppNotification(notificationData)) {
        event.waitUntil(handleWhatsAppPushNotification(notificationData));
      }
    } catch (error) {
      console.error('📱 Error processing push notification:', error);
    }
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Handle notification actions
  if (event.action === 'block') {
    handleBlockAction(event.notification.data);
  } else if (event.action === 'ignore') {
    handleIgnoreAction(event.notification.data);
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for background sync (when connection is restored)
self.addEventListener('sync', (event) => {
  console.log('📱 Background sync triggered:', event.tag);
  
  if (event.tag === 'whatsapp-fraud-check') {
    event.waitUntil(processPendingFraudChecks());
  }
});

// Monitor phone call state changes
let callMonitoringActive = false;
let lastCallState = null;

function startWhatsAppMonitoring(config = {}) {
  console.log('📱 Starting WhatsApp monitoring with config:', config);
  
  callMonitoringActive = true;
  
  // Start monitoring various signals
  monitorNotifications();
  monitorCallState();
  monitorNetworkActivity();
  
  // Send confirmation back to main thread
  sendMessageToClients({
    type: 'monitoring_started',
    timestamp: new Date().toISOString()
  });
}

function stopWhatsAppMonitoring() {
  console.log('📱 Stopping WhatsApp monitoring');
  
  callMonitoringActive = false;
  
  sendMessageToClients({
    type: 'monitoring_stopped',
    timestamp: new Date().toISOString()
  });
}

function monitorNotifications() {
  console.log('📱 Starting notification monitoring');
  
  // This would integrate with native notification APIs
  // For now, we'll monitor web-based notifications
}

function monitorCallState() {
  if (!callMonitoringActive) return;
  
  // Check call state every 2 seconds
  setTimeout(() => {
    checkCallState();
    if (callMonitoringActive) {
      monitorCallState();
    }
  }, 2000);
}

function checkCallState() {
  // In a real implementation, this would check device call state
  // For web, we can monitor some indicators
  
  const currentState = {
    timestamp: new Date().toISOString(),
    activeCall: false, // Would detect actual call state
    callType: null,
    phoneNumber: null
  };
  
  // Compare with last state
  if (lastCallState && hasCallStateChanged(currentState, lastCallState)) {
    handleCallStateChange(currentState);
  }
  
  lastCallState = currentState;
}

function hasCallStateChanged(current, previous) {
  return current.activeCall !== previous.activeCall ||
         current.phoneNumber !== previous.phoneNumber;
}

function handleCallStateChange(callState) {
  console.log('📞 Call state changed:', callState);
  
  if (callState.activeCall && callState.phoneNumber) {
    // Incoming call detected
    handleIncomingCall(callState.phoneNumber);
  }
}

async function handleIncomingCall(phoneNumber) {
  console.log('📞 Incoming call detected:', phoneNumber);
  
  try {
    // Send to fraud detection API
    const fraudCheck = await checkPhoneNumberForFraud(phoneNumber);
    
    if (fraudCheck.isFraud) {
      // Show immediate warning
      await showCallWarningNotification(phoneNumber, fraudCheck);
      
      // Send to main app
      sendMessageToClients({
        type: 'incoming_call',
        phoneNumber: phoneNumber,
        fraudCheck: fraudCheck,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('📞 Error checking incoming call:', error);
  }
}

function monitorNetworkActivity() {
  // Monitor for WhatsApp-related network requests
  console.log('🌐 Starting network activity monitoring');
}

function isWhatsAppNotification(notificationData) {
  // Check if notification is from WhatsApp
  const whatsappIndicators = [
    'whatsapp',
    'com.whatsapp',
    'WhatsApp Messenger',
    'wa.me'
  ];
  
  const source = (notificationData.source || '').toLowerCase();
  const title = (notificationData.title || '').toLowerCase();
  const body = (notificationData.body || '').toLowerCase();
  
  return whatsappIndicators.some(indicator => 
    source.includes(indicator) || 
    title.includes(indicator) ||
    body.includes('whatsapp')
  );
}

async function handleWhatsAppPushNotification(notificationData) {
  console.log('💬 WhatsApp push notification:', notificationData);
  
  try {
    // Extract phone number and message from notification
    const phoneNumber = extractPhoneNumber(notificationData);
    const message = extractMessage(notificationData);
    
    if (phoneNumber || message) {
      // Check for fraud
      const fraudCheck = await checkContentForFraud({
        phoneNumber: phoneNumber,
        message: message,
        type: 'whatsapp_notification'
      });
      
      if (fraudCheck.isFraud) {
        // Show warning notification
        await showFraudWarningNotification(fraudCheck);
        
        // Send to main app
        sendMessageToClients({
          type: 'whatsapp_notification',
          phoneNumber: phoneNumber,
          message: message,
          fraudCheck: fraudCheck,
          timestamp: new Date().toISOString()
        });
      }
    }
    
  } catch (error) {
    console.error('💬 Error handling WhatsApp notification:', error);
  }
}

function extractPhoneNumber(notificationData) {
  // Extract phone number from notification data
  const text = `${notificationData.title || ''} ${notificationData.body || ''}`;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+?91[-.\s]?)?[6-9]\d{9}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
}

function extractMessage(notificationData) {
  // Extract message content from notification
  return notificationData.body || notificationData.text || null;
}

async function checkPhoneNumberForFraud(phoneNumber) {
  try {
    // Get stored auth token
    const token = await getStoredAuthToken();
    
    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        type: 'incoming_call',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('📞 Error checking phone number:', error);
    
    // Fallback to local cache
    return await checkPhoneNumberLocally(phoneNumber);
  }
}

async function checkContentForFraud(content) {
  try {
    const token = await getStoredAuthToken();
    
    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        ...content,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('💬 Error checking content:', error);
    
    // Fallback to local analysis
    return await analyzeContentLocally(content);
  }
}

async function checkPhoneNumberLocally(phoneNumber) {
  // Local fraud database check (cached data)
  const localFraudDB = await getLocalFraudDatabase();
  
  const suspiciousNumber = localFraudDB.find(entry => 
    entry.phoneNumber === phoneNumber
  );
  
  if (suspiciousNumber) {
    return {
      isFraud: true,
      riskLevel: suspiciousNumber.riskLevel || 'high',
      riskScore: suspiciousNumber.riskScore || 80,
      alertMessage: `Known suspicious number: ${phoneNumber}`,
      source: 'local_cache'
    };
  }
  
  return {
    isFraud: false,
    riskLevel: 'low',
    riskScore: 10,
    source: 'local_cache'
  };
}

async function analyzeContentLocally(content) {
  // Basic local content analysis
  const suspiciousPatterns = [
    /urgent.*action.*required/i,
    /click.*here.*now/i,
    /verify.*account/i,
    /suspended/i,
    /won.*\$[\d,]+/i,
    /congratulations.*selected/i
  ];
  
  const text = content.message || '';
  const matchedPatterns = suspiciousPatterns.filter(pattern => 
    pattern.test(text)
  );
  
  if (matchedPatterns.length > 0) {
    const riskScore = Math.min(90, 30 + (matchedPatterns.length * 20));
    
    return {
      isFraud: true,
      riskLevel: riskScore > 70 ? 'high' : 'medium',
      riskScore: riskScore,
      alertMessage: 'Suspicious content patterns detected',
      detectedPatterns: matchedPatterns.map(p => ({
        type: 'suspicious_language',
        pattern: p.toString()
      })),
      source: 'local_analysis'
    };
  }
  
  return {
    isFraud: false,
    riskLevel: 'low',
    riskScore: 5,
    source: 'local_analysis'
  };
}

async function showCallWarningNotification(phoneNumber, fraudCheck) {
  const options = {
    title: '🚨 Jan-Kawach: Suspicious Call Alert',
    body: `WARNING: Potential fraud call from ${phoneNumber}`,
    icon: '/images/fraud-alert-icon.png',
    badge: '/images/fraud-badge.png',
    tag: 'call-fraud-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'block',
        title: 'Block Number'
      },
      {
        action: 'ignore',
        title: 'Ignore Warning'
      }
    ],
    data: {
      type: 'call_fraud',
      phoneNumber: phoneNumber,
      fraudCheck: fraudCheck
    }
  };
  
  return self.registration.showNotification(options.title, options);
}

async function showFraudWarningNotification(fraudCheck) {
  const options = {
    title: '🚨 Jan-Kawach: Fraud Alert',
    body: fraudCheck.alertMessage || 'Suspicious activity detected',
    icon: '/images/fraud-alert-icon.png',
    badge: '/images/fraud-badge.png',
    tag: 'fraud-alert',
    requireInteraction: fraudCheck.riskLevel === 'critical',
    actions: [
      {
        action: 'block',
        title: 'Block'
      },
      {
        action: 'ignore',
        title: 'Ignore'
      }
    ],
    data: {
      type: 'fraud_alert',
      fraudCheck: fraudCheck
    }
  };
  
  return self.registration.showNotification(options.title, options);
}

function handleBlockAction(notificationData) {
  console.log('🚫 Block action triggered:', notificationData);
  
  // Add to blocked list
  addToBlockedList(notificationData);
  
  // Notify main app
  sendMessageToClients({
    type: 'block_action',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

function handleIgnoreAction(notificationData) {
  console.log('👁️ Ignore action triggered:', notificationData);
  
  // Log the ignore action
  sendMessageToClients({
    type: 'ignore_action',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

async function addToBlockedList(notificationData) {
  // Add to local blocked list
  const blockedList = await getBlockedList();
  
  if (notificationData.phoneNumber) {
    blockedList.phoneNumbers = blockedList.phoneNumbers || [];
    if (!blockedList.phoneNumbers.includes(notificationData.phoneNumber)) {
      blockedList.phoneNumbers.push(notificationData.phoneNumber);
    }
  }
  
  await saveBlockedList(blockedList);
}

async function getStoredAuthToken() {
  // Get auth token from storage
  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Request token from client
      clients[0].postMessage({ type: 'get_auth_token' });
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
}

async function getLocalFraudDatabase() {
  // Get cached fraud database
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/api/fraud-database-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting local fraud database:', error);
  }
  
  return []; // Return empty array if no cache
}

async function getBlockedList() {
  // Get blocked list from storage
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/blocked-list-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting blocked list:', error);
  }
  
  return { phoneNumbers: [], domains: [] };
}

async function saveBlockedList(blockedList) {
  // Save blocked list to cache
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(blockedList));
    await cache.put('/blocked-list-cache', response);
  } catch (error) {
    console.error('Error saving blocked list:', error);
  }
}

function sendMessageToClients(message) {
  // Send message to all connected clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

async function processPendingFraudChecks() {
  // Process any pending fraud checks when connection is restored
  console.log('🔄 Processing pending fraud checks...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-fraud-checks');
    
    if (response) {
      const pendingChecks = await response.json();
      
      for (const check of pendingChecks) {
        try {
          await processDelayedFraudCheck(check);
        } catch (error) {
          console.error('Error processing delayed check:', error);
        }
      }
      
      // Clear pending checks
      await cache.delete('/pending-fraud-checks');
    }
    
  } catch (error) {
    console.error('Error processing pending fraud checks:', error);
  }
}

async function processDelayedFraudCheck(check) {
  // Process a delayed fraud check
  const result = await checkContentForFraud(check.content);
  
  if (result.isFraud) {
    await showFraudWarningNotification(result);
    
    sendMessageToClients({
      type: 'delayed_fraud_alert',
      check: check,
      result: result,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle errors
self.addEventListener('error', (event) => {
  console.error('📱 WhatsApp Monitor Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('📱 WhatsApp Monitor unhandled rejection:', event.reason);
});

console.log('📱 WhatsApp Monitor Service Worker loaded');