import React, { useState, useRef, useEffect } from 'react';

const AIChatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I'm here to help you with any questions about JAN-KAWACH. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Quick suggestion buttons
  const suggestions = [
    "How do I file a cyber crime complaint?",
    "What is the Blockchain Evidence Vault?",
    "Emergency helpline numbers?",
    "Tell me about security features"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined responses for common questions
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('complaint') || message.includes('report') || message.includes('file complaint') || message.includes('cyber crime')) {
      return "You can file cyber security complaints through our Complaint section. Navigate to the Complaint page where you can submit detailed reports about cyber crimes including online fraud, identity theft, cyberbullying, phishing, and more. The form supports evidence upload and generates a complaint ID for tracking. For emergencies, call the National Cyber Crime Helpline: 1930.";
    }
    
    if (message.includes('vault') || message.includes('document') || message.includes('evidence') || message.includes('blockchain')) {
      return "Our Blockchain Evidence Vault provides immutable, tamper-proof storage for evidence files. Features include: cryptographic hash verification, blockchain integrity checks, complete audit trails, and secure evidence management. All evidence is secured using blockchain technology to ensure it cannot be modified or corrupted.";
    }
    
    if (message.includes('qr') || message.includes('validate')) {
      return "Our QR Validation feature helps you verify QR codes for security purposes. You can scan QR codes to check if they're safe before accessing any linked content.";
    }
    
    if (message.includes('post') || message.includes('community')) {
      return "The Posts section is our community feature where you can share thoughts, images, and connect with other users. You can create posts with text and images to engage with the community.";
    }
    
    if (message.includes('blacklist') || message.includes('threat')) {
      return "Our security features include Blacklist management and Threat Checker tools. These help identify and prevent potentially harmful content or contacts.";
    }
    
    if (message.includes('password') || message.includes('forgot')) {
      return "If you've forgotten your password, use the 'Forgot Password' link on the login page. You'll receive instructions to reset your password securely.";
    }
    
    if (message.includes('account') || message.includes('profile')) {
      return "You can manage your account through the dashboard. Make sure you're logged in to access all features. Your profile information is displayed in the top section.";
    }
    
    if (message.includes('fraud') || message.includes('scam') || message.includes('phishing')) {
      return "If you've encountered online fraud, phishing, or scams, immediately file a complaint through our Complaint section. Choose the appropriate category (Online Financial Fraud, Phishing/Email Scam, etc.) and provide detailed information. Also report to the National Cyber Crime Helpline: 1930. Don't delay - quick reporting helps prevent further damage.";
    }
    
    if (message.includes('evidence') || message.includes('screenshot') || message.includes('proof')) {
      return "When filing a complaint, you can attach evidence like screenshots, documents, emails, or transaction records. Our system supports JPG, PNG, PDF, DOC, and TXT files up to 10MB each. Detailed evidence helps in faster resolution of your complaint.";
    }
    
    if (message.includes('helpline') || message.includes('emergency') || message.includes('urgent')) {
      return "For urgent cyber security matters: Call National Cyber Crime Helpline 1930 (24x7 toll-free). For immediate threats or ongoing attacks, don't wait - call immediately. You can also email complaints@cybercrime.gov.in or visit www.cybercrime.gov.in for online reporting.";
    }
    
    if (message.includes('help') || message.includes('how')) {
      return "I'm here to help! You can ask me about filing cyber security complaints, using our vault for secure document storage, QR validation, community posts, security tools, or account management. What specific area would you like to know more about?";
    }
    
    if (message.includes('security') || message.includes('safe')) {
      return "JAN-KAWACH prioritizes your security with encrypted document storage, secure QR validation, threat detection, and protected user authentication. All your data is handled with the highest security standards. We also provide easy complaint filing for cyber crimes and direct access to national helplines.";
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm always here to help. Feel free to ask me anything about JAN-KAWACH features, filing complaints, or if you need assistance with any part of the platform.";
    }
    
    // Default response
    return "I understand you're asking about JAN-KAWACH. Our platform offers several key features: Cyber Security Complaint Filing, Secure E-Vault for documents, QR Code Validation, Community Posts, and Security Tools. We also provide direct access to National Cyber Crime Helpline (1930). Could you please specify which feature you'd like to know more about?";
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false); // Hide suggestions after first message

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: getAIResponse(messageText),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <div className="relative">
        <button
          onClick={toggleChat}
          className={`${
            isOpen ? 'hidden' : 'flex'
          } items-center justify-center w-14 h-14 bg-gradient-to-r from-brown-primary to-brown-secondary text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
        
        {/* Notification badge */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse">
            <div className="sr-only">AI Available</div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-brown-primary to-brown-secondary text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">JAN-KAWACH AI Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-brown-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-none border'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user'
                        ? 'text-brown-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Quick Suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Quick questions:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-2 text-xs bg-white border border-brown-primary/20 text-brown-primary rounded-lg hover:bg-brown-primary/5 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm rounded-lg rounded-bl-none border p-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-500">AI is typing...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about JAN-KAWACH..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-primary focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 bg-brown-primary text-white rounded-lg hover:bg-brown-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbox;