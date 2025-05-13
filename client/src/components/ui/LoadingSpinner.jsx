import React from 'react';

/**
 * LoadingSpinner component for indicating loading state
 * 
 * @param {Object} props
 * @param {string} props.size - The size of the spinner: 'small', 'medium', or 'large'
 * @param {string} props.message - Optional message to display below the spinner
 * @param {string} props.color - The color of the spinner, default is 'primary'
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({ size = 'medium', message, color = 'primary' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };
  
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    yellow: 'border-yellow-500',
    gray: 'border-gray-500'
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <span className="mt-2 text-gray-700">{message}</span>
      )}
    </div>
  );
};

export default LoadingSpinner; 