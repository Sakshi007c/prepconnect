import React from 'react';

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="glass-panel visible-card-border p-8 rounded-3xl border hover:border-blue-200 transition-all hover:shadow-xl hover:-translate-y-1 group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="text-white w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default FeatureCard;
