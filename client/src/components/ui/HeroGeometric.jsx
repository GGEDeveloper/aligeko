import React, { useState, useEffect } from 'react';
import { BsArrowRight, BsCircle } from 'react-icons/bs';
import ElegantShape from './ElegantShape';
import { cn } from '../../utils/cn';

/**
 * Modern geometric hero component with animated shapes and elegant styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.badge - Badge text at top of hero
 * @param {string} props.title1 - First line of title
 * @param {string} props.title2 - Second line of title
 * @param {string} props.description - Description paragraph
 * @param {string} props.buttonText - Primary CTA button text
 * @param {string} props.buttonLink - Primary CTA button link
 * @param {string} props.secondaryText - Secondary action text
 * @param {string} props.secondaryLink - Secondary action link
 * @param {boolean} props.darkMode - Whether to use dark mode styling
 * @returns {JSX.Element} Hero component with geometric shapes
 */
function HeroGeometric({
  badge = "Entre em Contato",
  title1 = "Transforme seu Negócio",
  title2 = "com Ferramentas Profissionais",
  description = "Na AliTools, nós entendemos a importância de ter as ferramentas certas para o seu negócio. Estamos aqui para ajudar a encontrar as soluções que você precisa.",
  buttonText = "Fale Conosco",
  buttonLink = "#contact-form",
  secondaryText = "Ver Produtos",
  secondaryLink = "/products",
  darkMode = true,
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Prepare transition styles
  const baseStyles = {
    transition: "opacity 0.5s ease, transform 0.5s ease",
    opacity: isMounted ? 1 : 0,
  };
  
  const containerStyle = {
    ...baseStyles,
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
    backgroundColor: darkMode ? '#0F0F0F' : '#F5F5F5',
    color: darkMode ? '#FFFFFF' : '#111111',
  };
  
  const badgeStyle = {
    ...baseStyles,
    transitionDelay: "0.1s",
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
  };
  
  const title1Style = {
    ...baseStyles,
    transitionDelay: "0.2s",
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
  };
  
  const title2Style = {
    ...baseStyles,
    transitionDelay: "0.3s",
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
  };
  
  const descriptionStyle = {
    ...baseStyles,
    transitionDelay: "0.4s",
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
  };
  
  const buttonsStyle = {
    ...baseStyles,
    transitionDelay: "0.5s",
    transform: isMounted ? "translateY(0)" : "translateY(20px)",
  };
  
  return (
    <div 
      className="relative overflow-hidden"
      style={{
        backgroundColor: darkMode ? '#0F0F0F' : '#F5F5F5',
        color: darkMode ? '#FFFFFF' : '#111111',
      }}
    >
      <div 
        className="container mx-auto px-4 py-16 sm:py-24 relative z-10"
        style={containerStyle}
      >
        <div className="max-w-3xl mx-auto relative z-20">
          {/* Badge */}
          <div style={badgeStyle}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium mb-8",
                darkMode
                  ? "bg-white/10 text-white/80 ring-1 ring-white/20"
                  : "bg-black/10 text-black/80 ring-1 ring-black/20"
              )}
            >
              <BsCircle className="mr-1 h-2 w-2 text-yellow-500" />
              <span>{badge}</span>
            </span>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span 
              className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600" 
              style={title1Style}
            >
              {title1}
            </span>
            <span 
              className="block" 
              style={title2Style}
            >
              {title2}
            </span>
          </h1>
          
          {/* Description */}
          <p 
            className={cn(
              "mt-6 text-lg leading-8 max-w-2xl",
              darkMode ? "text-gray-300" : "text-gray-600"
            )}
            style={descriptionStyle}
          >
            {description}
          </p>
          
          {/* Buttons */}
          <div 
            className="mt-10 flex flex-col sm:flex-row gap-4"
            style={buttonsStyle}
          >
            <a
              href={buttonLink}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-md",
                "bg-yellow-500 text-black shadow-lg shadow-yellow-500/25",
                "hover:bg-yellow-400 transition duration-300 ease-in-out",
                "transform hover:translate-y-[-2px]"
              )}
            >
              {buttonText}
            </a>
            <a
              href={secondaryLink}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-md",
                darkMode 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : "bg-black/10 text-black hover:bg-black/20",
                "transition duration-300 ease-in-out",
              )}
            >
              {secondaryText}
              <BsArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <ElegantShape
        className="top-[5%] right-[10%]"
        width={350}
        height={350}
        rotate={15}
        delay={0.2}
        gradient="bg-gradient-to-r from-yellow-500/10 to-transparent"
      />
      
      <ElegantShape
        className="top-[20%] left-[5%]"
        width={200}
        height={200}
        rotate={-20}
        delay={0.4}
      />
      
      <ElegantShape
        className="bottom-[10%] right-[20%]"
        width={250}
        height={250}
        rotate={30}
        delay={0.6}
        gradient="bg-gradient-to-r from-yellow-500/5 to-transparent"
      />
      
      <ElegantShape
        className="bottom-[30%] left-[15%]"
        width={180}
        height={180}
        rotate={-10}
        delay={0.8}
      />
    </div>
  );
}

export default HeroGeometric; 