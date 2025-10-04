import React from 'react';

const Section = ({ 
  children, 
  className = '', 
  background = 'default',
  padding = 'default',
  maxWidth = '6xl'
}) => {
  const backgrounds = {
    default: 'bg-white',
    cream: 'bg-cream',
    gradient: 'bg-gradient-to-r from-brown-primary to-brown-secondary text-white',
    light: 'bg-brown-primary/10',
    transparent: 'bg-transparent'
  };
  
  const paddings = {
    none: '',
    sm: 'py-8 px-4',
    default: 'py-12 px-8',
    lg: 'py-16 px-8'
  };
  
  const maxWidths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };
  
  return (
    <section className={`${backgrounds[background]} ${paddings[padding]} ${className}`}>
      <div className={`${maxWidths[maxWidth]} mx-auto`}>
        {children}
      </div>
    </section>
  );
};

export default Section;