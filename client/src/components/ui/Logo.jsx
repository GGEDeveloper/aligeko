import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Importar logos
import logoPrimary from '../../assets/logos/png/primary/alitools_primary_fullcolor_250px.png';
import logoMonoBlack from '../../assets/logos/png/mono/alitools_mono_black.png';
import logoMonoWhite from '../../assets/logos/png/mono/alitools_mono_white.png';
import logoMonoYellow from '../../assets/logos/png/mono/alitools_mono_yellow.png';

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
  // Define size dimensions
  const dimensions = {
    small: { height: '32px' },
    medium: { height: '40px' },
    large: { height: '48px' }
  };

  // Select logo based on variant
  const getLogo = () => {
    switch(variant) {
      case 'primary':
        return logoPrimary;
      case 'mono':
        return logoMonoBlack;
      case 'light':
        return logoMonoWhite;
      case 'brand':
        return logoMonoYellow;
      default:
        return logoPrimary;
    }
  };

  const logo = getLogo();
  const { height } = dimensions[size];

  const logoContent = (
    <div className={`flex items-center ${className}`} {...props}>
      <img 
        src={logo} 
        alt="AliTools Logo" 
        style={{ height: height }}
        className="max-w-full"
      />
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
  variant: PropTypes.oneOf(['primary', 'mono', 'light', 'brand']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  withLink: PropTypes.bool,
  className: PropTypes.string
};

export default Logo;