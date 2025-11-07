// SMS Monitor Service Worker
// This service worker runs in the background to monitor SMS notifications and phishing links

const CACHE_NAME = 'jan-kawach-sms-monitor-v1';
const API_BASE = '/api/fraud-detection';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('📱 SMS Monitor Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📱 SMS Monitor cache opened');
      return cache.addAll([
        '/sounds/sms-alert-low.mp3',
        '/sounds/sms-alert-medium.mp3', 
        '/sounds/sms-alert-high.mp3',
        '/sounds/sms-alert-critical.mp3'
      ]).catch(() => {
        console.log('📱 SMS audio files not yet available, will load later');
      });
    })
  );
  
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('📱 SMS Monitor Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('📱 Deleting old SMS cache:', cacheName);
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
  console.log('📱 SMS Monitor received message:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'START_SMS_MONITORING':
      startSMSMonitoring(data);
      break;
    case 'STOP_SMS_MONITORING':
      stopSMSMonitoring();
      break;
    case 'ANALYZE_SMS':
      analyzeSMSContent(data);
      break;
    case 'CHECK_CLIPBOARD':
      checkClipboardContent(data);
      break;
    case 'UPDATE_FRAUD_PATTERNS':
      updateFraudPatterns(data);
      break;
    default:
      console.log('📱 Unknown SMS message type:', type);
  }
});

// Listen for push notifications (SMS notifications)
self.addEventListener('push', (event) => {
  console.log('📱 SMS push notification received:', event);
  
  if (event.data) {
    try {
      const notificationData = event.data.json();
      
      // Check if this is an SMS notification
      if (isSMSNotification(notificationData)) {
        event.waitUntil(handleSMSPushNotification(notificationData));
      }
    } catch (error) {
      console.error('📱 Error processing SMS push notification:', error);
    }
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 SMS notification clicked:', event.notification);
  
  event.notification.close();
  
  // Handle notification actions
  if (event.action === 'block') {
    handleSMSBlockAction(event.notification.data);
  } else if (event.action === 'report') {
    handleSMSReportAction(event.notification.data);
  } else if (event.action === 'ignore') {
    handleSMSIgnoreAction(event.notification.data);
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for background sync
self.addEventListener('sync', (event) => {
  console.log('📱 SMS background sync triggered:', event.tag);
  
  if (event.tag === 'sms-fraud-check') {
    event.waitUntil(processPendingSMSChecks());
  } else if (event.tag === 'phishing-url-check') {
    event.waitUntil(processPendingURLChecks());
  }
});

// SMS monitoring state
let smsMonitoringActive = false;
let fraudPatterns = [];
let blockedDomains = [];
let suspiciousNumbers = [];

function startSMSMonitoring(config = {}) {
  console.log('📱 Starting SMS monitoring with config:', config);
  
  smsMonitoringActive = true;
  
  // Initialize fraud patterns
  initializeFraudPatterns();
  
  // Start monitoring various SMS sources
  monitorSMSNotifications();
  monitorURLClicks();
  monitorClipboardActivity();
  
  // Send confirmation back to main thread
  sendMessageToClients({
    type: 'sms_monitoring_started',
    timestamp: new Date().toISOString()
  });
}

function stopSMSMonitoring() {
  console.log('📱 Stopping SMS monitoring');
  
  smsMonitoringActive = false;
  
  sendMessageToClients({
    type: 'sms_monitoring_stopped',
    timestamp: new Date().toISOString()
  });
}

async function initializeFraudPatterns() {
  // Load fraud patterns from cache or defaults
  fraudPatterns = await getStoredFraudPatterns() || getDefaultFraudPatterns();
  blockedDomains = await getStoredBlockedDomains() || [];
  suspiciousNumbers = await getStoredSuspiciousNumbers() || [];
  
  console.log('📱 Loaded fraud patterns:', {
    patterns: fraudPatterns.length,
    blockedDomains: blockedDomains.length,
    suspiciousNumbers: suspiciousNumbers.length
  });
}

function getDefaultFraudPatterns() {
  return [
    {
      type: 'phishing_banking',
      pattern: /your.{0,10}(bank|account).{0,20}(suspended|locked|frozen|blocked)/i,
      riskScore: 85,
      category: 'banking_fraud'
    },
    {
      type: 'urgent_action',
      pattern: /urgent.{0,20}action.{0,20}required/i,
      riskScore: 70,
      category: 'pressure_tactics'
    },
    {
      type: 'verify_account',
      pattern: /verify.{0,20}(account|identity|information)/i,
      riskScore: 75,
      category: 'verification_scam'
    },
    {
      type: 'click_link',
      pattern: /click.{0,10}(here|link|below).{0,20}(immediately|now|urgent)/i,
      riskScore: 80,
      category: 'malicious_link'
    },
    {
      type: 'lottery_scam',
      pattern: /congratulations.{0,20}(won|selected|winner)/i,
      riskScore: 90,
      category: 'lottery_fraud'
    },
    {
      type: 'tax_scam',
      pattern: /(irs|tax|refund).{0,20}(owe|refund|payment)/i,
      riskScore: 85,
      category: 'government_impersonation'
    },
    {
      type: 'otp_theft',
      pattern: /do.{0,10}not.{0,10}share.{0,10}(otp|code|pin)/i,
      riskScore: 60,
      category: 'otp_warning'
    }
  ];
}

function monitorSMSNotifications() {
  console.log('📱 Starting SMS notification monitoring');
  
  // This would integrate with native SMS APIs in a real mobile app
  // For web, we monitor web-based messaging services
}

function monitorURLClicks() {
  console.log('🔗 Starting URL click monitoring');
  
  // Monitor for suspicious URL interactions
}

function monitorClipboardActivity() {
  console.log('📋 Starting clipboard monitoring');
  
  // Periodic clipboard checking would be handled by main thread
  // Service worker responds to requests to analyze clipboard content
}

function isSMSNotification(notificationData) {
  // Check if notification is from SMS app
  const smsApps = [
    'messages',
    'sms',
    'messaging',
    'text',
    'google messages',
    'samsung messages',
    'default sms',
    'android.provider.telephony'
  ];
  
  const source = (notificationData.source || '').toLowerCase();
  const packageName = (notificationData.packageName || '').toLowerCase();
  const title = (notificationData.title || '').toLowerCase();
  
  return smsApps.some(app => 
    source.includes(app) || 
    packageName.includes(app) ||
    title.includes(app) ||
    title.includes('text') ||
    title.includes('sms')
  );
}

async function handleSMSPushNotification(notificationData) {
  console.log('📱 SMS push notification:', notificationData);
  
  try {
    // Extract SMS content and sender
    const phoneNumber = extractPhoneNumber(notificationData);
    const message = extractSMSMessage(notificationData);
    const urls = extractURLs(message);
    
    if (message) {
      // Analyze SMS content for fraud
      const fraudAnalysis = await analyzeSMSForFraud({
        phoneNumber: phoneNumber,
        message: message,
        urls: urls,
        source: 'push_notification'
      });
      
      if (fraudAnalysis.isFraud) {
        // Show fraud warning
        await showSMSFraudNotification(fraudAnalysis);
        
        // Send to main app
        sendMessageToClients({
          type: 'sms_fraud_detected',
          phoneNumber: phoneNumber,
          message: message,
          urls: urls,
          fraudAnalysis: fraudAnalysis,
          timestamp: new Date().toISOString()
        });
        
        // Auto-block if critical
        if (fraudAnalysis.riskLevel === 'critical') {
          await autoBlockSMSSource(phoneNumber, urls);
        }
      }
    }
    
  } catch (error) {
    console.error('📱 Error handling SMS push notification:', error);
  }
}

function extractPhoneNumber(notificationData) {
  // Extract phone number from SMS notification
  const text = `${notificationData.title || ''} ${notificationData.body || ''} ${notificationData.sender || ''}`;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+?91[-.\s]?)?[6-9]\d{9}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : notificationData.sender || null;
}

function extractSMSMessage(notificationData) {
  // Extract SMS message content
  return notificationData.body || notificationData.text || notificationData.message || '';
}

function extractURLs(text) {
  // Extract URLs from SMS text
  if (!text) return [];
  
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|net|org|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum|[a-z]{2})[^\s]*)/gi;
  return text.match(urlRegex) || [];
}

async function analyzeSMSForFraud(smsData) {
  try {
    // First check against local patterns
    const localAnalysis = analyzeWithLocalPatterns(smsData);
    
    // If high risk locally, return immediately
    if (localAnalysis.riskScore >= 80) {
      return localAnalysis;
    }
    
    // Check with API if available
    const apiAnalysis = await checkWithFraudAPI(smsData);
    
    // Combine results
    return combineAnalysisResults(localAnalysis, apiAnalysis);
    
  } catch (error) {
    console.error('📱 Error analyzing SMS for fraud:', error);
    
    // Fallback to local analysis only
    return analyzeWithLocalPatterns(smsData);
  }
}

function analyzeWithLocalPatterns(smsData) {
  const { phoneNumber, message, urls } = smsData;
  
  let riskScore = 0;
  let detectedPatterns = [];
  let riskFactors = [];
  
  // Check against fraud patterns
  fraudPatterns.forEach(pattern => {
    if (pattern.pattern.test(message)) {
      riskScore += pattern.riskScore;
      detectedPatterns.push({
        type: pattern.type,
        category: pattern.category,
        confidence: pattern.riskScore
      });
      riskFactors.push(`Detected ${pattern.category} pattern`);
    }
  });
  
  // Check suspicious phone number
  if (phoneNumber && suspiciousNumbers.includes(phoneNumber)) {
    riskScore += 40;
    riskFactors.push('Known suspicious sender');
  }
  
  // Check URLs against blocked domains
  urls.forEach(url => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (blockedDomains.includes(domain)) {
        riskScore += 50;
        riskFactors.push(`Blocked domain: ${domain}`);
      }
      
      // Check for suspicious URL patterns
      if (isSuspiciousURL(url)) {
        riskScore += 30;
        riskFactors.push('Suspicious URL pattern');
      }
    } catch (error) {
      // Invalid URL
      riskScore += 20;
      riskFactors.push('Malformed URL');
    }
  });
  
  // Additional risk factors
  if (message.length > 500) {
    riskScore += 10;
    riskFactors.push('Unusually long message');
  }
  
  if (urls.length > 3) {
    riskScore += 15;
    riskFactors.push('Multiple links');
  }
  
  // Normalize risk score
  riskScore = Math.min(100, riskScore);
  
  // Determine risk level
  let riskLevel;
  if (riskScore >= 90) riskLevel = 'critical';
  else if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';
  else riskLevel = 'low';
  
  return {
    isFraud: riskScore >= 40,
    riskLevel: riskLevel,
    riskScore: riskScore,
    detectedPatterns: detectedPatterns,
    riskFactors: riskFactors,
    alertMessage: generateAlertMessage(riskLevel, riskFactors),
    recommendedAction: getRecommendedAction(riskLevel, riskFactors),
    source: 'local_analysis'
  };
}

function isSuspiciousURL(url) {
  const suspiciousPatterns = [
    /bit\.ly|tinyurl|t\.co/i,  // URL shorteners
    /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,  // IP addresses
    /[a-z0-9]+-[a-z0-9]+-[a-z0-9]+\.(com|net|org)/i,  // Random domain pattern
    /verify|secure|account|login|update/i,  // Phishing keywords in domain
    /-+/,  // Multiple hyphens
    /[0-9]{5,}/  // Long number sequences
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

function generateAlertMessage(riskLevel, riskFactors) {
  const messages = {
    'critical': '🚨 CRITICAL THREAT: This SMS contains dangerous content that could steal your personal information or money!',
    'high': '⚠️ HIGH RISK: This SMS shows multiple signs of being a scam or phishing attempt.',
    'medium': '🔶 CAUTION: This SMS contains suspicious elements that require verification.',
    'low': 'ℹ️ INFO: Minor suspicious indicators detected in this SMS.'
  };
  
  let message = messages[riskLevel] || messages['low'];
  
  if (riskFactors.length > 0) {
    message += ` Main concerns: ${riskFactors.slice(0, 2).join(', ')}.`;
  }
  
  return message;
}

function getRecommendedAction(riskLevel, riskFactors) {
  const actions = {
    'critical': {
      instructions: [
        'DO NOT click any links or call any numbers in this message',
        'Delete this message immediately',
        'Block the sender',
        'Report to authorities if it claims to be from a bank or government',
        'Never share personal information via SMS'
      ]
    },
    'high': {
      instructions: [
        'Do not click any links in this message',
        'Verify the sender through official channels',
        'Do not provide personal information',
        'Consider blocking the sender',
        'Report if claiming to be from a legitimate organization'
      ]
    },
    'medium': {
      instructions: [
        'Verify the sender before taking any action',
        'Be cautious with any links or attachments',
        'Contact the organization directly if in doubt',
        'Do not provide sensitive information'
      ]
    },
    'low': {
      instructions: [
        'Exercise normal caution',
        'Verify any unusual requests',
        'Be aware of potential risks'
      ]
    }
  };
  
  return actions[riskLevel] || actions['low'];
}

async function checkWithFraudAPI(smsData) {
  try {
    const token = await getStoredAuthToken();
    
    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({
        ...smsData,
        type: 'sms_content',
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return { ...result, source: 'api_analysis' };
    } else {
      throw new Error(`API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('📱 Error checking with fraud API:', error);
    return null;
  }
}

function combineAnalysisResults(localAnalysis, apiAnalysis) {
  if (!apiAnalysis) {
    return localAnalysis;
  }
  
  // Take the higher risk score
  const combinedRiskScore = Math.max(localAnalysis.riskScore, apiAnalysis.riskScore);
  
  // Combine detected patterns
  const combinedPatterns = [
    ...localAnalysis.detectedPatterns,
    ...(apiAnalysis.detectedPatterns || [])
  ];
  
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
    detectedPatterns: combinedPatterns,
    riskFactors: [...localAnalysis.riskFactors, ...(apiAnalysis.riskFactors || [])],
    alertMessage: apiAnalysis.alertMessage || localAnalysis.alertMessage,
    recommendedAction: apiAnalysis.recommendedAction || localAnalysis.recommendedAction,
    source: 'combined_analysis'
  };
}

async function showSMSFraudNotification(fraudAnalysis) {
  const riskColors = {
    'critical': '🔴',
    'high': '🚨',
    'medium': '🔶',
    'low': '⚠️'
  };
  
  const options = {
    title: `${riskColors[fraudAnalysis.riskLevel]} Jan-Kawach: SMS Fraud Alert`,
    body: fraudAnalysis.alertMessage,
    icon: '/images/sms-fraud-alert-icon.png',
    badge: '/images/fraud-badge.png',
    tag: 'sms-fraud-alert',
    requireInteraction: fraudAnalysis.riskLevel === 'critical',
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
    ],
    data: {
      type: 'sms_fraud',
      fraudAnalysis: fraudAnalysis
    }
  };
  
  return self.registration.showNotification(options.title, options);
}

async function autoBlockSMSSource(phoneNumber, urls) {
  console.log('🚫 Auto-blocking critical SMS threat');
  
  // Add phone number to blocked list
  if (phoneNumber) {
    suspiciousNumbers.push(phoneNumber);
    await saveSuspiciousNumbers(suspiciousNumbers);
  }
  
  // Add domains to blocked list
  urls.forEach(url => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      if (!blockedDomains.includes(domain)) {
        blockedDomains.push(domain);
      }
    } catch (error) {
      console.error('Error parsing URL for blocking:', error);
    }
  });
  
  await saveBlockedDomains(blockedDomains);
  
  // Notify main app
  sendMessageToClients({
    type: 'auto_block_triggered',
    phoneNumber: phoneNumber,
    urls: urls,
    timestamp: new Date().toISOString()
  });
}

function handleSMSBlockAction(notificationData) {
  console.log('🚫 SMS block action triggered:', notificationData);
  
  const fraudAnalysis = notificationData.fraudAnalysis;
  
  // Block the content
  if (fraudAnalysis.phoneNumber) {
    suspiciousNumbers.push(fraudAnalysis.phoneNumber);
    saveSuspiciousNumbers(suspiciousNumbers);
  }
  
  if (fraudAnalysis.urls) {
    fraudAnalysis.urls.forEach(url => {
      try {
        const domain = new URL(url).hostname.toLowerCase();
        if (!blockedDomains.includes(domain)) {
          blockedDomains.push(domain);
        }
      } catch (error) {
        console.error('Error blocking domain:', error);
      }
    });
    saveBlockedDomains(blockedDomains);
  }
  
  // Notify main app
  sendMessageToClients({
    type: 'sms_block_action',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

function handleSMSReportAction(notificationData) {
  console.log('📋 SMS report action triggered:', notificationData);
  
  // Send report to fraud database
  sendMessageToClients({
    type: 'sms_report_action',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

function handleSMSIgnoreAction(notificationData) {
  console.log('👁️ SMS ignore action triggered:', notificationData);
  
  // Log the ignore action
  sendMessageToClients({
    type: 'sms_ignore_action',
    data: notificationData,
    timestamp: new Date().toISOString()
  });
}

async function analyzeSMSContent(data) {
  console.log('📱 Analyzing SMS content:', data);
  
  const fraudAnalysis = await analyzeSMSForFraud(data);
  
  // Send result back to main thread
  sendMessageToClients({
    type: 'sms_analysis_result',
    data: data,
    fraudAnalysis: fraudAnalysis,
    timestamp: new Date().toISOString()
  });
}

async function checkClipboardContent(data) {
  console.log('📋 Checking clipboard content:', data);
  
  const urls = extractURLs(data.content);
  
  if (urls.length > 0) {
    const fraudAnalysis = await analyzeSMSForFraud({
      message: data.content,
      urls: urls,
      source: 'clipboard'
    });
    
    if (fraudAnalysis.isFraud) {
      sendMessageToClients({
        type: 'clipboard_fraud_detected',
        content: data.content,
        urls: urls,
        fraudAnalysis: fraudAnalysis,
        timestamp: new Date().toISOString()
      });
    }
  }
}

function updateFraudPatterns(data) {
  console.log('🔄 Updating fraud patterns:', data);
  
  fraudPatterns = data.patterns || fraudPatterns;
  blockedDomains = data.blockedDomains || blockedDomains;
  suspiciousNumbers = data.suspiciousNumbers || suspiciousNumbers;
  
  // Save to cache
  saveFraudPatterns(fraudPatterns);
  saveBlockedDomains(blockedDomains);
  saveSuspiciousNumbers(suspiciousNumbers);
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

async function getStoredFraudPatterns() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/fraud-patterns-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting fraud patterns:', error);
  }
  return null;
}

async function saveFraudPatterns(patterns) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(patterns));
    await cache.put('/fraud-patterns-cache', response);
  } catch (error) {
    console.error('Error saving fraud patterns:', error);
  }
}

async function getStoredBlockedDomains() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/blocked-domains-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting blocked domains:', error);
  }
  return null;
}

async function saveBlockedDomains(domains) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(domains));
    await cache.put('/blocked-domains-cache', response);
  } catch (error) {
    console.error('Error saving blocked domains:', error);
  }
}

async function getStoredSuspiciousNumbers() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/suspicious-numbers-cache');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting suspicious numbers:', error);
  }
  return null;
}

async function saveSuspiciousNumbers(numbers) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(numbers));
    await cache.put('/suspicious-numbers-cache', response);
  } catch (error) {
    console.error('Error saving suspicious numbers:', error);
  }
}

function sendMessageToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

async function processPendingSMSChecks() {
  console.log('🔄 Processing pending SMS checks...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-sms-checks');
    
    if (response) {
      const pendingChecks = await response.json();
      
      for (const check of pendingChecks) {
        try {
          await analyzeSMSContent(check);
        } catch (error) {
          console.error('Error processing pending SMS check:', error);
        }
      }
      
      await cache.delete('/pending-sms-checks');
    }
    
  } catch (error) {
    console.error('Error processing pending SMS checks:', error);
  }
}

async function processPendingURLChecks() {
  console.log('🔄 Processing pending URL checks...');
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('/pending-url-checks');
    
    if (response) {
      const pendingChecks = await response.json();
      
      for (const check of pendingChecks) {
        try {
          await checkClipboardContent(check);
        } catch (error) {
          console.error('Error processing pending URL check:', error);
        }
      }
      
      await cache.delete('/pending-url-checks');
    }
    
  } catch (error) {
    console.error('Error processing pending URL checks:', error);
  }
}

// Handle errors
self.addEventListener('error', (event) => {
  console.error('📱 SMS Monitor Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('📱 SMS Monitor unhandled rejection:', event.reason);
});

console.log('📱 SMS Monitor Service Worker loaded');