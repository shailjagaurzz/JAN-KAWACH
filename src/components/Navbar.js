import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import Button from './Button';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { token, setToken, user } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: '🏠', path: '/'},
    { name: 'Complaint', icon: '🧾', path: '/complaint'},
    { name: 'Posts', icon: '🗨️', path: '/posts'},
    { name: 'Blacklist', icon: '⛔', path: '/blacklist'},
    { name: 'Threat Checker', icon: '🕵️', path: '/threat-checker' },
    { name: 'Validate QR', icon: '📷', path: '/validate-qr' },
    { name: 'Vault', icon: '🗂️', path: '/vault'},
    { name: 'Report', icon: '🚨', path: '/report' },
  ];

  const publicNavItems = [
    { name: 'About', icon: 'ℹ️', path: '/about' },
    { name: 'Complaint', icon: '🧾', path: '/complaint' },
    { name: 'Posts', icon: '🗨️', path: '/posts' },
    { name: 'E-Vault', icon: '🗂️', path: '/vault'},
    { name: 'Blacklist', icon: '⛔', path: '/blacklist' },
    { name: 'Validate QR', icon: '📷', path: '/validate-qr' },
  ];

  const currentNavItems = token ? navItems : publicNavItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // setToken will clear storage and user (handled in App)
    setToken(null);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-md sticky top-0 z-50 motion-sheen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight brand-gradient-text transition-all duration-300 hover:brightness-125 hover:scale-[1.02]">
              JAN - KAWACH
            </Link>
            {token && (
              <span className="ml-3 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-semibold border border-emerald-200">
                Protected
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-8 flex items-baseline space-x-2">
              {currentNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-pill px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    isActive(item.path)
                      ? 'nav-pill-active bg-slate-900 text-white shadow-md soft-glow'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
              <div className="flex items-center space-x-3 animate-fade-in">
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  onClick={onLoginClick} 
                  variant="outline" 
                  size="sm"
                >
                  Login
                </Button>
                <Button 
                  onClick={onSignupClick} 
                  variant="primary" 
                  size="sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-slate-900 inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-slate-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-300 transition-transform duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200 shadow-lg">
            {currentNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-pill flex items-center space-x-2 px-3 py-2 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'nav-pill-active bg-slate-900 text-white soft-glow'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:-translate-y-0.5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
              {token ? (
                <>
                  
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => {
                      onLoginClick();
                      setIsOpen(false);
                    }} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      onSignupClick();
                      setIsOpen(false);
                    }} 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;