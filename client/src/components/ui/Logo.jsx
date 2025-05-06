import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Importações de logos com fallbacks diretos
import primaryLogo from '../../assets/logos/png/primary/alitools_primary_fullcolor_100px.png';
import monoWhiteLogo from '../../assets/logos/png/mono/alitools_mono_white.png';
import monoBlackLogo from '../../assets/logos/png/mono/alitools_mono_black.png';
import symbolLogo from '../../assets/logos/png/symbol/alitools_symbol_fullcolor_128px.png';
import wordmarkLogo from '../../assets/logos/png/wordmark/alitools_wordmark_black.png';
import fallbackLogo from '../../assets/logos/logo_transparente.png';

/**
 * Logo componente reutilizável que suporta diferentes variantes, tamanhos e comportamento responsivo
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.variant - Variante do logo ('primary', 'mono', 'monoDark', 'symbol', 'wordmark')
 * @param {string} props.size - Tamanho do logo ('small', 'medium', 'large', 'xlarge')
 * @param {string} props.linkTo - Destino do link quando o logo é clicável
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.withLink - Se o logo deve ser clicável
 * @param {Object} props.linkProps - Propriedades adicionais para o componente Link
 */
const Logo = ({ 
  variant = 'primary',
  size = 'medium',
  linkTo = '/',
  className = '',
  withLink = true,
  linkProps = {},
  ...props 
}) => {
  // Função para tratamento de erro de imagem não encontrada
  const handleError = (e) => {
    console.warn(`Logo não encontrado: ${e.target.src}`);
    e.target.src = fallbackLogo;
  };
  
  // Mapear variantes para caminhos de arquivo
  const logoSrc = {
    primary: primaryLogo,
    mono: monoWhiteLogo,
    monoDark: monoBlackLogo,
    symbol: symbolLogo,
    wordmark: wordmarkLogo,
  };
  
  // Mapear tamanhos para classes Tailwind - TAMANHOS REDUZIDOS
  const sizeClasses = {
    small: 'w-[60px] md:w-[50px] sm:w-[40px]',
    medium: 'w-[80px] md:w-[70px] sm:w-[60px]',
    large: 'w-[100px] md:w-[90px] sm:w-[80px]',
    xlarge: 'w-[130px] md:w-[110px] sm:w-[90px]',
  };
  
  // Definir descrição alt com base na variante
  const altText = {
    primary: 'AliTools - Ferramentas Profissionais',
    mono: 'AliTools - Ferramentas Profissionais',
    monoDark: 'AliTools - Ferramentas Profissionais',
    symbol: 'AliTools',
    wordmark: 'AliTools',
  };
  
  const imgElement = (
    <img
      src={logoSrc[variant] || fallbackLogo}
      alt={altText[variant]}
      className={`h-auto ${sizeClasses[size]} ${className}`}
      onError={handleError}
      {...props}
    />
  );
  
  // Retornar logo com ou sem link
  if (withLink) {
    return (
      <Link to={linkTo} className="flex items-center" {...linkProps}>
        {imgElement}
      </Link>
    );
  }
  
  return imgElement;
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['primary', 'mono', 'monoDark', 'symbol', 'wordmark']),
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  linkTo: PropTypes.string,
  className: PropTypes.string,
  withLink: PropTypes.bool,
  linkProps: PropTypes.object,
};

export default Logo;