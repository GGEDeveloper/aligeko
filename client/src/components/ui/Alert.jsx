import React from 'react';
import PropTypes from 'prop-types';

/**
 * Alert component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.variant - Alert variant (info, success, warning, error)
 * @param {string} props.title - Alert title
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {Function} props.onDismiss - Callback for dismiss action
 * @param {string} props.className - Additional CSS classes
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  // Base classes for all alerts
  const baseClasses = 'p-4 rounded-md border mb-4';
  
  // Variant classes
  const variantClasses = {
    info: 'bg-info/10 border-info/30 text-info',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    error: 'bg-error/10 border-error/30 text-error',
  };
  
  // Combine all classes
  const alertClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={alertClasses} role="alert" {...props}>
      {dismissible && onDismiss && (
        <button
          type="button"
          className="float-right -mt-1 -mr-1 ml-2 text-current opacity-50 hover:opacity-100 focus:outline-none"
          onClick={onDismiss}
          aria-label="Fechar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {title && (
        <div className="font-bold mb-1">{title}</div>
      )}
      
      <div className={title ? 'text-sm' : ''}>
        {children}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

export default Alert; 