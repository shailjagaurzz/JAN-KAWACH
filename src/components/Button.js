import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  to, 
  href, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'motion-sheen inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white focus:ring-cyan-500 shadow-lg shadow-cyan-600/25 soft-glow',
    secondary: 'border-2 border-cyan-700/70 text-cyan-900 hover:bg-cyan-700 hover:text-white focus:ring-cyan-600 bg-white/80 soft-glow',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500 bg-white/70'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const disabledClasses = disabled
    ? 'opacity-55 cursor-not-allowed transform-none hover:scale-100 shadow-none'
    : 'hover:-translate-y-0.5 active:translate-y-0';
  
  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;
  
  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {children}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {children}
      </a>
    );
  }
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={combinedClasses}
    >
      {children}
    </button>
  );
};

export default Button;