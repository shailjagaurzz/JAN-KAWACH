import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ title, subtitle, centered = false }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b-4 border-brown-primary shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center py-6 ${centered ? 'justify-center' : 'justify-between'}`}>
          <div className={centered ? 'text-center' : ''}>
            <Link to="/" className="text-4xl md:text-5xl font-bold text-brown-primary tracking-wider hover:text-brown-secondary transition-colors">
              {title || 'JAN - KAWACH'}
            </Link>
            {subtitle && (
              <p className="text-brown-secondary font-medium text-lg mt-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;