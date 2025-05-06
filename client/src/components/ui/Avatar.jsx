import React from 'react';
import PropTypes from 'prop-types';

/**
 * Avatar component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Avatar image source
 * @param {string} props.alt - Avatar image alt text
 * @param {string} props.size - Avatar size (xs, sm, md, lg, xl)
 * @param {string} props.variant - Avatar variant (circle, rounded, square)
 * @param {string} props.fallback - Fallback text to display when image fails or is not provided
 * @param {string} props.bgColor - Background color for fallback avatar
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'circle',
  fallback,
  bgColor = 'bg-brand',
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  
  // Variant classes
  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-md',
    square: 'rounded-none',
  };
  
  // Generate fallback text from alt or provided fallback
  const getFallbackText = () => {
    if (fallback) return fallback;
    if (alt) {
      return alt
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return '';
  };
  
  // Combine all classes
  const avatarClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    inline-flex items-center justify-center
    overflow-hidden
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return src ? (
    <img 
      src={src} 
      alt={alt} 
      className={avatarClasses}
      {...props}
    />
  ) : (
    <div 
      className={`${avatarClasses} ${bgColor} text-white font-medium`}
      title={alt}
      {...props}
    >
      {getFallbackText()}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['circle', 'rounded', 'square']),
  fallback: PropTypes.string,
  bgColor: PropTypes.string,
  className: PropTypes.string,
};

export default Avatar; 