import React from 'react';

const FeatureCard = ({ icon, title, description, className = '' }) => {
  return (
    <div className={`glass-panel p-6 rounded-3xl hover-lift border border-white/80 ${className}`}>
      <div className="text-4xl mb-4 text-center transition-transform duration-300 hover:scale-110">{icon}</div>
      <h4 className="text-xl font-bold text-slate-900 mb-3 text-center">
        {title}
      </h4>
      <p className="text-slate-600 text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;