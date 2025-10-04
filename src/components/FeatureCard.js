import React from 'react';

const FeatureCard = ({ icon, title, description, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-brown-primary/20 ${className}`}>
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h4 className="text-xl font-semibold text-gray-900 mb-3 text-center">
        {title}
      </h4>
      <p className="text-gray-600 text-center leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;