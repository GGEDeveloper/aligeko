import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant (default, outlined, elevated)
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {boolean} props.hover - Whether to apply hover effect
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
  children,
  variant = 'default',
  header,
  footer,
  hover = false,
  className = '',
  ...props
}) => {
  // Base classes for all cards
  const baseClasses = 'rounded-lg overflow-hidden';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-neutral-300',
    outlined: 'bg-transparent border border-neutral-300',
    elevated: 'bg-white shadow-card',
    branded: 'bg-brand-50 border border-brand-200',
  };
  
  // Hover effect classes
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : '';
  
  // Combine all classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={cardClasses} {...props}>
      {header && (
        <div className="border-b border-neutral-300 px-4 py-3 bg-neutral-50 font-medium">
          {header}
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-neutral-300 px-4 py-3 bg-neutral-50">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated', 'branded']),
  header: PropTypes.node,
  footer: PropTypes.node,
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default Card; 