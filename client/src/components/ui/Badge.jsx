import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Badge variant (primary, secondary, success, warning, error, info)
 * @param {string} props.size - Badge size (sm, md)
 * @param {boolean} props.rounded - Whether to apply fully rounded corners
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
  ...props
}) => {
  // Base classes for all badges
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-100 text-primary-800',
    secondary: 'bg-primary-100 text-primary-800',
    neutral: 'bg-neutral-200 text-neutral-800',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };
  
  // Rounded classes
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Combine all classes
  const badgeClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${roundedClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'neutral', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['sm', 'md']),
  rounded: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge; 