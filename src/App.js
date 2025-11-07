import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ForgotPassword from "./pages/ForgotPassword";
import ValidateQR from "./pages/ValidateQR";
import Posts from "./pages/Posts";
import Complaint from "./pages/Complaint";
import Vault from "./pages/Vault";
import Report from "./pages/Report";
import Blacklist from "./pages/Blacklist";
import ThreatChecker from "./pages/ThreatChecker";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SettingsPage from "./pages/SettingsPage";
import Auth from "./pages/Auth";
import Notifications from "./Notifications"; // adjust path
import About from './pages/About';
import AIChatbox from './components/AIChatbox';
import AlertPopup from './components/AlertPopup';
import MainFraudDetectionSystem from './components/MainFraudDetectionSystem';
import { socket } from "./socket";


// Simple page component for pages under development
const ComingSoonPage = ({ title }) => (
  <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brown-primary mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">This page is coming soon!</p>
        <Link to="/" className="inline-flex items-center gap-2 text-brown-primary hover:text-brown-secondary font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  </div>
);

export const AuthContext = createContext();

// Small helper to decode JWT without external deps
function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    return null;
  }
}

function App() {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize token from localStorage on app start and derive user
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    let timeout = null;
    
    if (storedToken) {
      setTokenState(storedToken);
      const parsed = parseJwt(storedToken);
      if (parsed) setUser(parsed.user || parsed);
      // auto-logout when token expired
      if (parsed && parsed.exp) {
        const expiresAt = parsed.exp * 1000;
        const now = Date.now();
        if (expiresAt <= now) {
          // token expired
          localStorage.removeItem('token');
          setTokenState(null);
          setUser(null);
        } else {
          // set timeout to auto-logout when token expires
          timeout = setTimeout(() => {
            localStorage.removeItem('token');
            setTokenState(null);
            setUser(null);
          }, expiresAt - now);
        }
      }
    }
    
    // Always set loading to false, regardless of token presence
    setLoading(false);
    
    // Return cleanup function to clear timeout if it exists
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
      const parsed = parseJwt(newToken);
      if (parsed) setUser(parsed.user || parsed);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Show loading spinner while checking for stored token
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brown-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-brown-primary font-medium">Loading JAN-KAWACH...</p>
        </div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={{ token, setToken, user }}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth onAuth={setToken} />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/complaint" element={<Complaint />} />
            <Route path="/report" element={<Report />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/blacklist" element={<Blacklist />} />
            <Route path="/threat-checker" element={<ThreatChecker />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/validate-qr" element={<ValidateQR />} />
            <Route path="/e-vault" element={<Vault />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
          
          {/* AI Chatbox - Available on all pages */}
          <AIChatbox />
          
          {/* Fraud Alert Popup - Global alert system */}
          <AlertPopup />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;