import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'px-6 py-3 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-red text-off-white hover:shadow-red-glow hover:scale-105',
    secondary: 'bg-primary-blue text-off-white hover:shadow-blue-glow hover:scale-105',
    outline: 'border-2 border-primary-red text-primary-red hover:bg-primary-red hover:text-off-white',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="loading-spinner mr-2" />
          Processing...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
