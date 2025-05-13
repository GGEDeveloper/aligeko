import React from 'react';

/**
 * ErrorMessage component for displaying error states
 * 
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message details
 * @param {Function} props.action - Optional callback function for action button
 * @param {string} props.actionText - Text for action button, defaults to "Tentar novamente"
 * @returns {JSX.Element}
 */
const ErrorMessage = ({ title, message, action, actionText = "Tentar novamente" }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center text-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-12 w-12 text-red-400 mb-3" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <h3 className="text-lg font-medium text-red-800 mb-2">{title}</h3>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 