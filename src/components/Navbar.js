import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import Button from './Button';

const Navbar = ({ onLoginClick, onSignupClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { token, setToken, user } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/'},
    { name: 'Complaint', path: '/complaint'},
    { name: 'Posts', path: '/posts'},
    { name: 'Blacklist', path: '/blacklist'},
    { name: 'Threat Checker', path: '/threat-checker' },
    { name: 'Validate QR', path: '/validate-qr' },
    { name: 'Vault', path: '/vault'},
    { name: 'Report', path: '/report' },
  ];

  const publicNavItems = [
    { name: 'About', path: '/about' },
    { name: 'Complaint', path: '/complaint' },
    { name: 'Posts', path: '/posts' },
    { name: 'E-Vault', path: '/vault'},
    { name: 'Blacklist', path: '/blacklist' },
    { name: 'Validate QR', path: '/validate-qr' },
  ];

  const currentNavItems = token ? navItems : publicNavItems;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // setToken will clear storage and user (handled in App)
    setToken(null);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b-2 border-brown-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-brown-primary tracking-wider hover:text-brown-secondary transition-colors">
              JAN - KAWACH
            </Link>
            {token && (
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Protected
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {currentNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                    isActive(item.path)
                      ? 'bg-brown-primary text-white'
                      : 'text-gray-700 hover:text-brown-primary hover:bg-brown-primary/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {token ? (
                <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">Welcome, {user?.name || (user?.email && user.email.split('@')[0]) || 'Member'}</span>
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
              className="bg-brown-primary inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-brown-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-brown-primary/20">
            {currentNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-brown-primary text-white'
                    : 'text-gray-700 hover:text-brown-primary hover:bg-brown-primary/10'
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
                  <div className="text-sm text-gray-600 px-3">Welcome, {user?.name || (user?.email && user.email.split('@')[0]) || 'Member'}</div>
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