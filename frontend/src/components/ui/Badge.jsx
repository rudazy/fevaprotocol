import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-dark-gray text-off-white',
    primary: 'bg-primary-blue text-off-white',
    danger: 'bg-primary-red text-off-white',
    success: 'bg-green-600 text-off-white',
    warning: 'bg-yellow-600 text-off-white',
    positive: 'bg-green-600 text-off-white',
    negative: 'bg-primary-red text-off-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
