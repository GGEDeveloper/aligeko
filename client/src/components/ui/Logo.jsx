import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Logo component for AliTools B2B platform
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Color variant ('primary', 'mono', 'light')
 * @param {string} props.size - Size variant ('small', 'medium', 'large')
 * @param {boolean} props.withLink - Whether to wrap in a Link to home
 * @param {string} props.className - Additional CSS classes
 */
const Logo = ({
  variant = 'primary',
  size = 'medium',
  withLink = false,
  className = '',
  ...props
}) => {
  // Define size dimensions and font sizes
  const dimensions = {
    small: { 
      container: 'h-8',
      fontSize: 'text-lg'
    },
    medium: { 
      container: 'h-10',
      fontSize: 'text-xl'
    },
    large: { 
      container: 'h-12',
      fontSize: 'text-2xl'
    }
  };

  // Style based on variant
  const variantStyles = {
    primary: {
      logoClass: 'text-primary',
      accentClass: 'text-brand'
    },
    mono: {
      logoClass: 'text-white',
      accentClass: 'text-brand'
    },
    light: {
      logoClass: 'text-white',
      accentClass: 'text-brand-300'
    }
  };

  const { container, fontSize } = dimensions[size];
  const { logoClass, accentClass } = variantStyles[variant];

  const logoContent = (
    <div 
      className={`flex items-center font-bold ${logoClass} ${container} ${className}`}
      {...props}
    >
      <span className={`${fontSize} mr-1 font-extrabold`}>Ali</span>
      <span className={`${fontSize} font-extrabold ${accentClass}`}>Tools</span>
    </div>
  );

  // Wrap in Link if withLink is true
  if (withLink) {
    return (
      <Link to="/" aria-label="AliTools Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['primary', 'mono', 'light']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  withLink: PropTypes.bool,
  className: PropTypes.string
};

export default Logo;