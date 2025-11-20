import React from 'react';
import { formatTokenAmount } from '@/utils/formatters';

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error = null,
  showBalance = false,
  balance = null,
  decimals = 18,
  onMaxClick = null,
  rightElement = null,
  className = '',
}) => {
  const handleMaxClick = () => {
    if (onMaxClick && balance) {
      onMaxClick(balance);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-off-white">
            {label}
          </label>
          {showBalance && balance !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-light-gray">
                Balance: {formatTokenAmount(balance, decimals, 4)}
              </span>
              {onMaxClick && (
                <button
                  onClick={handleMaxClick}
                  className="text-xs font-semibold text-primary-blue hover:text-accent-blue transition-colors duration-300"
                  disabled={disabled}
                >
                  MAX
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-field w-full
            ${rightElement ? 'pr-24' : ''}
            ${error ? 'border-primary-red' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-primary-red">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
