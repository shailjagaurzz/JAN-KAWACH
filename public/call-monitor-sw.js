// Call Monitor Service Worker
// This service worker monitors incoming calls and detects suspicious phone numbers

const CACHE_NAME = 'jan-kawach-call-monitor-v1';
const API_BASE = '/api/fraud-detection';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('📞 Call Monitor Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📞 Call Monitor cache opened');
      return cache.addAll([
        '/sounds/call-alert-warning.mp3',
        '/sounds/call-alert-danger.mp3',
        '/sounds/call-alert-critical.mp3'
      ]).catch(() => {
        console.log('📞 Call audio files not yet available, will load later');
      });
    })
  );
  
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('📞 Call Monitor Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('📞 Deleting old call monitor cache:', cacheName);
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
  console.log('📞 Call Monitor received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_CALL_MONITORING':
      startCallMonitoring(data);
      break;
    case 'STOP_CALL_MONITORING':
      stopCallMonitoring();
      break;
    case 'CHECK_INCOMING_CALL':
      checkIncomingCall(data);
      break;
    case 'REPORT_SCAM_CALL':
      reportScamCall(data);
      break;
    case 'UPDATE_SCAMMER_DATABASE':
      updateScammerDatabase(data);
      break;
    default:
      console.log('📞 Unknown call message type:', type);
  }
});

// Listen for push notifications (call notifications)
self.addEventListener('push', (event) => {
  console.log('📞 Call push notification received:', event);
  
  if (event.data) {
    try {
      const notificationData = event.data.json();
      
      // Check if this is a call notification
      if (isCallNotification(notificationData)) {
        event.waitUntil(handleCallPushNotification(notificationData));
      }
    } catch (error) {
      console.error('📞 Error processing call push notification:', error);
    }
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📞 Call notification clicked:', event.notification);
  
  event.notification.close();
  
  // Handle notification actions
  if (event.action === 'block_number') {
    handleBlockNumberAction(event.notification.data);
  } else if (event.action === 'report_scam') {
    handleReportScamAction(event.notification.data);
  } else if (event.action === 'mark_safe') {
    handleMarkSafeAction(event.notification.data);
  } else if (event.action === 'answer_call') {
    handleAnswerCallAction(event.notification.data);
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for background sync
self.addEventListener('sync', (event) => {
  console.log('📞 Call background sync triggered:', event.tag);
  
  if (event.tag === 'call-fraud-check') {
    event.waitUntil(processPendingCallChecks());
  } else if (event.tag === 'scam-report-sync') {
    event.waitUntil(syncScamReports());
  }
});

// Call monitoring state
let callMonitoringActive = false;
let scammerDatabase = [];
let trustedNumbers = [];
let blockedNumbers = [];
let callHistory = [];

function startCallMonitoring(config = {}) {
  console.log('📞 Starting call monitoring with config:', config);
  
  callMonitoringActive = true;
  
  // Initialize scammer database
  initializeScammerDatabase();
  
  // Start monitoring call events
  monitorCallEvents();
  monitorCallStateChanges();
  
  // Send confirmation back to main thread
  sendMessageToClients({
    type: 'call_monitoring_started',
    timestamp: new Date().toISOString()
  });
}

function stopCallMonitoring() {
  console.log('📞 Stopping call monitoring');
  
  callMonitoringActive = false;
  
  sendMessageToClients({
    type: 'call_monitoring_stopped',
    timestamp: new Date().toISOString()
  });
}

async function initializeScammerDatabase() {
  // Load scammer database from cache or defaults
  scammerDatabase = await getStoredScammerDatabase() || getDefaultScammerDatabase();
  trustedNumbers = await getStoredTrustedNumbers() || [];
  blockedNumbers = await getStoredBlockedNumbers() || [];
  
  console.log('📞 Loaded call fraud database:', {
    scammers: scammerDatabase.length,
    trusted: trustedNumbers.length,
    blocked: blockedNumbers.length
  });
}

function getDefaultScammerDatabase() {
  return [
    {
      phoneNumber: '+91-9999999999',
      type: 'tech_support_scam',
      riskLevel: 'critical',
      riskScore: 95,
      reportCount: 150,
      lastReported: '2024-10-20T10:00:00Z',
      description: 'Known tech support scammer impersonating Microsoft'
    },
    {
      phoneNumber: '+1-800-SCAMMER',
      type: 'banking_fraud',
      riskLevel: 'critical',
      riskScore: 98,
      reportCount: 230,
      lastReported: '2024-10-21T14:30:00Z',
      description: 'Impersonates bank representatives to steal credentials'
    },
    {
      phoneNumber: '+91-8888888888',
      type: 'lottery_scam',
      riskLevel: 'high',
      riskScore: 85,
      reportCount: 75,
      lastReported: '2024-10-18T09:15:00Z',
      description: 'Fake lottery winner notifications'
    },
    {
      phoneNumber: '+1-555-TAX-SCAM',
      type: 'government_impersonation',
      riskLevel: 'critical',
      riskScore: 92,
      reportCount: 180,
      lastReported: '2024-10-22T16:45:00Z',
      description: 'Impersonates IRS/tax authorities'
    }
  ];
}

function monitorCallEvents() {
  console.log('📞 Starting call event monitoring');
  
  // This would integrate with native telephony APIs in a real mobile app
  // For web, we monitor web-based call services and notifications
}

function monitorCallStateChanges() {
  console.log('📞 Starting call state monitoring');
  
  // Periodic monitoring for call state changes
  if (callMonitoringActive) {
    setTimeout(() => {
      checkForCallStateChanges();
      if (callMonitoringActive) {
        monitorCallStateChanges();
      }
    }, 1000); // Check every second
  }
}

function checkForCallStateChanges() {
  // In a real implementation, this would check device call state
  // For demonstration, we'll simulate call state detection
}

function isCallNotification(notificationData) {
  // Check if notification is related to incoming calls
  const callIndicators = [
    'incoming call',
    'missed call',
    'phone',
    'dialer',
    'telephony',
    'call from',
    'calling'
  ];
  
  const source = (notificationData.source || '').toLowerCase();
  const title = (notificationData.title || '').toLowerCase();
  const body = (notificationData.body || '').toLowerCase();
  
  return callIndicators.some(indicator => 
    source.includes(indicator) || 
    title.includes(indicator) ||
    body.includes(indicator)
  );
}

async function handleCallPushNotification(notificationData) {
  console.log('📞 Call push notification:', notificationData);
  
  try {
    // Extract phone number from notification
    const phoneNumber = extractPhoneNumberFromCall(notificationData);
    
    if (phoneNumber) {
      // Check if this is a known scammer
      const fraudCheck = await checkPhoneNumberForCallFraud(phoneNumber);
      
      if (fraudCheck.isFraud) {
        // Show immediate warning
        await showCallFraudWarning(phoneNumber, fraudCheck);
        
        // Send to main app
        sendMessageToClients({
          type: 'incoming_call_fraud_detected',
          phoneNumber: phoneNumber,
          fraudCheck: fraudCheck,
          timestamp: new Date().toISOString()
        });
        
        // Auto-block if critical
        if (fraudCheck.riskLevel === 'critical') {
          await autoBlockNumber(phoneNumber);
        }
      } else {
        // Log the call for analysis
        logCallEvent(phoneNumber, 'incoming', fraudCheck);
      }
    }
    
  } catch (error) {
    console.error('📞 Error handling call push notification:', error);
  }
}

function extractPhoneNumberFromCall(notificationData) {
  // Extract phone number from call notification
  const text = `${notificationData.title || ''} ${notificationData.body || ''} ${notificationData.number || ''}`;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+?91[-.\s]?)?[6-9]\d{9}|\+[1-9]\d{6,14}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : notificationData.number || null;
}

async function checkPhoneNumberForCallFraud(phoneNumber) {
  try {
    // First check local scammer database
    const localCheck = checkAgainstLocalDatabase(phoneNumber);
    
    if (localCheck.isFraud && localCheck.riskScore >= 80) {
      return localCheck;
    }
    
    // Check with API if available
    const apiCheck = await checkWithCallFraudAPI(phoneNumber);
    
    // Combine results
    return combineCallFraudResults(localCheck, apiCheck);
    
  } catch (error) {
    console.error('📞 Error checking phone number for call fraud:', error);
    
    // Fallback to local check only
    return checkAgainstLocalDatabase(phoneNumber);
  }
}

function checkAgainstLocalDatabase(phoneNumber) {
  // Check if number is in trusted list
  if (trustedNumbers.includes(phoneNumber)) {
    return {
      isFraud: false,
      riskLevel: 'low',
      riskScore: 0,
      source: 'trusted_list',
      alertMessage: 'This number is in your trusted contacts'
    };
  }
  
  // Check if number is blocked
  if (blockedNumbers.includes(phoneNumber)) {
    return {
      isFraud: true,
      riskLevel: 'critical',
      riskScore: 100,
      source: 'blocked_list',
      alertMessage: 'This number has been blocked due to suspicious activity'
    };
  }
  
  // Check against scammer database
  const scammerEntry = scammerDatabase.find(entry => 
    entry.phoneNumber === phoneNumber ||
    phoneNumber.includes(entry.phoneNumber.replace(/[-\s()]/g, ''))
  );
  
  if (scammerEntry) {
    return {
      isFraud: true,
      riskLevel: scammerEntry.riskLevel,
      riskScore: scammerEntry.riskScore,
      source: 'scammer_database',
      alertMessage: `KNOWN SCAMMER: ${scammerEntry.description}`,
      scamType: scammerEntry.type,
      reportCount: scammerEntry.reportCount,
      lastReported: scammerEntry.lastReported,
      recommendedAction: {
        instructions: [
          'DO NOT answer this call',
          'This number is confirmed to be used by scammers',
          'Block immediately',
          'Report any contact to authorities',
          'Never share personal information with this caller'
        ]
      }
    };
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = checkSuspiciousNumberPatterns(phoneNumber);
  
  return {
    isFraud: suspiciousPatterns.isSuspicious,
    riskLevel: suspiciousPatterns.riskLevel,
    riskScore: suspiciousPatterns.riskScore,
    source: 'pattern_analysis',
    alertMessage: suspiciousPatterns.message,
    suspiciousIndicators: suspiciousPatterns.indicators
  };
}

function checkSuspiciousNumberPatterns(phoneNumber) {
  let riskScore = 0;
  let indicators = [];
  
  // Remove formatting for analysis
  const cleanNumber = phoneNumber.replace(/[-\s()]/g, '');
  
  // Check for suspicious patterns
  
  // Repeated digits
  if (/(\d)\1{4,}/.test(cleanNumber)) {
    riskScore += 30;
    indicators.push('Contains many repeated digits');
  }
  
  // Sequential digits
  if (/01234|12345|23456|34567|45678|56789|6789/.test(cleanNumber)) {
    riskScore += 25;
    indicators.push('Contains sequential digits');
  }
  
  // All same digit
  if (/^(\d)\1+$/.test(cleanNumber.slice(-7))) {
    riskScore += 40;
    indicators.push('Contains all same digits');
  }
  
  // Too many 0s or 9s
  const zeroCount = (cleanNumber.match(/0/g) || []).length;
  const nineCount = (cleanNumber.match(/9/g) || []).length;
  
  if (zeroCount >= 4) {
    riskScore += 20;
    indicators.push('Contains many zeros');
  }
  
  if (nineCount >= 4) {
    riskScore += 20;
    indicators.push('Contains many nines');
  }
  
  // Short number (less than 7 digits)
  if (cleanNumber.length < 7) {
    riskScore += 35;
    indicators.push('Unusually short number');
  }
  
  // Very long number (more than 15 digits)
  if (cleanNumber.length > 15) {
    riskScore += 30;
    indicators.push('Unusually long number');
  }
  
  // Common scam prefixes (country-specific)
  const scamPrefixes = [
    '+1900',  // Premium rate
    '+1976',  // Often used for scams
    '+234',   // Nigeria (common scam origin)
    '+233',   // Ghana
    '+225'    // Ivory Coast
  ];
  
  if (scamPrefixes.some(prefix => phoneNumber.startsWith(prefix))) {
    riskScore += 40;
    indicators.push('Number from high-risk region');
  }
  
  // Determine risk level
  let riskLevel;
  if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';
  else if (riskScore >= 20) riskLevel = 'low';
  else riskLevel = 'minimal';
  
  const message = riskScore >= 40 
    ? `Suspicious number pattern detected (${riskScore}% risk)`
    : riskScore >= 20
    ? `Minor suspicious indicators detected`
    : 'Number appears normal';
  
  return {
    isSuspicious: riskScore >= 40,
    riskLevel: riskLevel,
    riskScore: riskScore,
    message: message,
    indicators: indicators
  };
}

async function checkWithCallFraudAPI(phoneNumber) {
  try {
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
      const result = await response.json();
      return { ...result, source: 'api_check' };
    } else {
      throw new Error(`API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('📞 Error checking with call fraud API:', error);
    return null;
  }
}

function combineCallFraudResults(localCheck, apiCheck) {
  if (!apiCheck) {
    return localCheck;
  }
  
  // Take the higher risk score
  const combinedRiskScore = Math.max(localCheck.riskScore, apiCheck.riskScore);
  
  // Determine final risk level
  let riskLevel;
  if (combinedRiskScore >= 90) riskLevel = 'critical';
  else if (combinedRiskScore >= 70) riskLevel = 'high';
  else if (combinedRiskScore >= 40) riskLevel = 'medium';
  else riskLevel = 'low';
  
  return {
    isFraud: combinedRiskScore >= 40,
    riskLevel: riskLevel,
    riskScore: combinedRiskScore,
    source: 'combined_analysis',
    alertMessage: apiCheck.alertMessage || localCheck.alertMessage,
    scamType: apiCheck.scamType || localCheck.scamType,
    recommendedAction: apiCheck.recommendedAction || localCheck.recommendedAction,
    reportCount: apiCheck.reportCount || localCheck.reportCount
  };
}

async function showCallFraudWarning(phoneNumber, fraudCheck) {
  const riskIcons = {
    'critical': '🔴',
    'high': '🚨',
    'medium': '⚠️',
    'low': '🔶'
  };
  
  const options = {
    title: `${riskIcons[fraudCheck.riskLevel]} Jan-Kawach: SCAM CALL ALERT`,
    body: `${fraudCheck.alertMessage}\n\nFrom: ${phoneNumber}`,
    icon: '/images/call-fraud-alert-icon.png',
    badge: '/images/fraud-badge.png',
    tag: 'call-fraud-alert',
    requireInteraction: true,
    silent: false,
    actions: [
      {
        action: 'block_number',
        title: 'Block Number'
      },
      {
        action: 'report_scam',
        title: 'Report Scam'
      },
      {
        action: 'mark_safe',
        title: 'Mark Safe'
      }
    ],
    data: {
      type: 'call_fraud',
      phoneNumber: phoneNumber,
      fraudCheck: fraudCheck
    }
  };
  
  // Don't show answer option for known scammers
  if (fraudCheck.riskLevel !== 'critical') {
    options.actions.push({
      action: 'answer_call',
      title: 'Answer Anyway'
    });
  }
  
  return self.registration.showNotification(options.title, options);
}

async function autoBlockNumber(phoneNumber) {
  console.log('🚫 Auto-blocking critical scam number:', phoneNumber);
  
  // Add to blocked list
  if (!blockedNumbers.includes(phoneNumber)) {
    blockedNumbers.push(phoneNumber);
    await saveBlockedNumbers(blockedNumbers);
  }
  
  // Notify main app
  sendMessageToClients({
    type: 'number_auto_blocked',
    phoneNumber: phoneNumber,
    timestamp: new Date().toISOString()
  });
}

function logCallEvent(phoneNumber, eventType, fraudCheck) {
  const callEvent = {
    phoneNumber: phoneNumber,
    eventType: eventType,
    timestamp: new Date().toISOString(),
    riskLevel: fraudCheck.riskLevel,
    riskScore: fraudCheck.riskScore,
    isFraud: fraudCheck.isFraud
  };
  
  callHistory.push(callEvent);
  
  // Keep only last 100 call events
  if (callHistory.length > 100) {
    callHistory = callHistory.slice(-100);
  }
  
  saveCallHistory(callHistory);
}

async function checkIncomingCall(data) {
  console.log('📞 Checking incoming call:', data);
  
  const fraudCheck = await checkPhoneNumberForCallFraud(data.phoneNumber);
  
  // Send result back to main thread
  sendMessageToClients({
    type: 'call_fraud_check_result',
    phoneNumber: data.phoneNumber,
    fraudCheck: fraudCheck,
    timestamp: new Date().toISOString()
  });
}

function handleBlockNumberAction(notificationData) {
  console.log('🚫 Block number action triggered:', notificationData);
  
  const phoneNumber = notificationData.phoneNumber;
  
  // Add to blocked list
  if (!blockedNumbers.includes(phoneNumber)) {
    blockedNumbers.push(phoneNumber);
    saveBlockedNumbers(blockedNumbers);
  }
  
  // Notify main app
  sendMessageToClients({
    type: 'number_blocked',
    phoneNumber: phoneNumber,
    timestamp: new Date().toISOString()
  });
}

function handleReportScamAction(notificationData) {
  console.log('📋 Report scam action triggered:', notificationData);
  
  // Send report to main app for API submission
  sendMessageToClients({
    type: 'scam_call_reported',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

function handleMarkSafeAction(notificationData) {
  console.log('✅ Mark safe action triggered:', notificationData);
  
  const phoneNumber = notificationData.phoneNumber;
  
  // Add to trusted list
  if (!trustedNumbers.includes(phoneNumber)) {
    trustedNumbers.push(phoneNumber);
    saveTrustedNumbers(trustedNumbers);
  }
  
  // Remove from blocked list if present
  blockedNumbers = blockedNumbers.filter(num => num !== phoneNumber);
  saveBlockedNumbers(blockedNumbers);
  
  // Notify main app
  sendMessageToClients({
    type: 'number_marked_safe',
    phoneNumber: phoneNumber,
    timestamp: new Date().toISOString()
  });
}

function handleAnswerCallAction(notificationData) {
  console.log('📞 Answer call action triggered:', notificationData);
  
  // Log that user chose to answer despite warning
  logCallEvent(notificationData.phoneNumber, 'answered_despite_warning', notificationData.fraudCheck);
  
  // Notify main app
  sendMessageToClients({
    type: 'call_answered_despite_warning',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

async function reportScamCall(data) {
  console.log('📋 Reporting scam call:', data);
  
  // Add to local scammer database
  const scammerEntry = {
    phoneNumber: data.phoneNumber,
    type: data.scamType || 'unknown',
    riskLevel: 'high',
    riskScore: 80,
    reportCount: 1,
    lastReported: new Date().toISOString(),
    description: data.description || 'User-reported scam call'
  };
  
  scammerDatabase.push(scammerEntry);
  await saveScammerDatabase(scammerDatabase);
  
  // Send to API
  try {
    const token = await getStoredAuthToken();
    
    await fetch(`${API_BASE}/report-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        phoneNumber: data.phoneNumber,
        reportType: 'scam_call',
        description: data.description,
        timestamp: new Date().toISOString()
      })
    });
    
  } catch (error) {
    console.error('Error reporting scam call to API:', error);
  }
}

function updateScammerDatabase(data) {
  console.log('🔄 Updating scammer database:', data);
  
  scammerDatabase = data.scammerDatabase || scammerDatabase;
  trustedNumbers = data.trustedNumbers || trustedNumbers;
  blockedNumbers = data.blockedNumbers || blockedNumbers;
  
  // Save to cache
  saveScammerDatabase(scammerDatabase);
  saveTrustedNumbers(trustedNumbers);
  saveBlockedNumbers(blockedNumbers);
}

// Storage functions
async function getStoredAuthToken() {
  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      clients[0].postMessage({ type: 'get_auth_token' });
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return null;
}

async function getStoredScammerDatabase() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/scammer-database-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting scammer database:', error);
  }
  return null;
}

async function saveScammerDatabase(database) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(database));
    await cache.put('/scammer-database-cache', response);
  } catch (error) {
    console.error('Error saving scammer database:', error);
  }
}

async function getStoredTrustedNumbers() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/trusted-numbers-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting trusted numbers:', error);
  }
  return null;
}

async function saveTrustedNumbers(numbers) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(numbers));
    await cache.put('/trusted-numbers-cache', response);
  } catch (error) {
    console.error('Error saving trusted numbers:', error);
  }
}

async function getStoredBlockedNumbers() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/blocked-numbers-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting blocked numbers:', error);
  }
  return null;
}

async function saveBlockedNumbers(numbers) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(numbers));
    await cache.put('/blocked-numbers-cache', response);
  } catch (error) {
    console.error('Error saving blocked numbers:', error);
  }
}

async function saveCallHistory(history) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(history));
    await cache.put('/call-history-cache', response);
  } catch (error) {
    console.error('Error saving call history:', error);
  }
}

function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

async function processPendingCallChecks() {
  console.log('🔄 Processing pending call checks...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-call-checks');
    
    if (response) {
      const pendingChecks = await response.json();
      
      for (const check of pendingChecks) {
        try {
          await checkIncomingCall(check);
        } catch (error) {
          console.error('Error processing pending call check:', error);
        }
      }
      
      await cache.delete('/pending-call-checks');
    }
    
  } catch (error) {
    console.error('Error processing pending call checks:', error);
  }
}

async function syncScamReports() {
  console.log('🔄 Syncing scam reports...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-scam-reports');
    
    if (response) {
      const pendingReports = await response.json();
      
      for (const report of pendingReports) {
        try {
          await reportScamCall(report);
        } catch (error) {
          console.error('Error syncing scam report:', error);
        }
      }
      
      await cache.delete('/pending-scam-reports');
    }
    
  } catch (error) {
    console.error('Error syncing scam reports:', error);
  }
}

// Handle errors
self.addEventListener('error', (event) => {
  console.error('📞 Call Monitor Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('📞 Call Monitor unhandled rejection:', event.reason);
});

console.log('📞 Call Monitor Service Worker loaded');