import React from 'react';

const PlaceholderSection = ({ title, phase, description }) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-2xl font-bold text-off-white mb-4">{title}</h3>
      <p className="text-light-gray mb-2">{description}</p>
      <p className="text-primary-red font-semibold">Coming in {phase}</p>
    </div>
  );
};

export default PlaceholderSection;
