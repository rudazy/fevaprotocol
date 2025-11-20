import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick = null,
  padding = 'default',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'card',
    glass: 'glass-effect',
    outline: 'border-2 border-dark-gray hover:border-primary-blue',
  };

  const baseClasses = `
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hover ? 'cursor-pointer hover:shadow-lg hover:shadow-primary-blue/20' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardProps = {
    className: baseClasses,
    onClick: onClick,
  };

  if (hover) {
    return (
      <motion.div
        {...cardProps}
        whileHover={{ scale: 1.02 }}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div {...cardProps}>{children}</div>;
};

export default Card;
