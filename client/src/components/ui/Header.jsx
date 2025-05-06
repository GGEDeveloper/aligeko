import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Header component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether the header is for the admin interface
 * @param {React.ReactNode} props.children - Additional content to render in the header
 * @param {string} props.className - Additional CSS classes
 */
const Header = ({
  isAdmin = false,
  children,
  className = '',
  ...props
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header 
      className={`bg-white border-b border-neutral-200 shadow-sm w-full z-20 ${className}`}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img 
                src="/client/src/assets/logos/png/primary/alitools_primary_fullcolor_100px.png" 
                alt="AliTools" 
                className="h-10"
              />
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/products" className="text-primary hover:text-brand transition-colors font-medium">
              Produtos
            </a>
            <a href="/categories" className="text-primary hover:text-brand transition-colors font-medium">
              Categorias
            </a>
            <a href="/orders" className="text-primary hover:text-brand transition-colors font-medium">
              Pedidos
            </a>
            <a href="/about" className="text-primary hover:text-brand transition-colors font-medium">
              Sobre
            </a>
            {isAdmin && (
              <a href="/admin" className="text-primary hover:text-brand transition-colors font-medium">
                Admin
              </a>
            )}
          </nav>
          
          {/* User and Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/cart" className="flex items-center text-primary hover:text-brand">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="ml-1 text-sm">Cart</span>
            </a>
            <a href="/account" className="flex items-center text-primary hover:text-brand">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="ml-1 text-sm">Account</span>
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="text-primary hover:text-brand"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200">
            <nav className="flex flex-col space-y-3">
              <a href="/products" className="text-primary hover:text-brand transition-colors font-medium">
                Produtos
              </a>
              <a href="/categories" className="text-primary hover:text-brand transition-colors font-medium">
                Categorias
              </a>
              <a href="/orders" className="text-primary hover:text-brand transition-colors font-medium">
                Pedidos
              </a>
              <a href="/about" className="text-primary hover:text-brand transition-colors font-medium">
                Sobre
              </a>
              {isAdmin && (
                <a href="/admin" className="text-primary hover:text-brand transition-colors font-medium">
                  Admin
                </a>
              )}
              <div className="pt-2 border-t border-neutral-100">
                <a href="/cart" className="flex items-center text-primary hover:text-brand py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="ml-2">Cart</span>
                </a>
                <a href="/account" className="flex items-center text-primary hover:text-brand py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="ml-2">Account</span>
                </a>
              </div>
            </nav>
          </div>
        )}
        
        {/* Additional content */}
        {children}
      </div>
    </header>
  );
};

Header.propTypes = {
  isAdmin: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Header; 