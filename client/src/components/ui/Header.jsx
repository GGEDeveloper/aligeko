import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Icons
import { BsSearch, BsCart3, BsPersonCircle, BsList, BsX } from 'react-icons/bs';

/**
 * Header component for the AliTools B2B site
 * Includes navigation, logo, and user controls
 */
const Header = ({ isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo variant="primary" size="small" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/products" className="text-neutral-700 hover:text-primary transition-colors font-medium">
              Produtos
            </Link>
            <Link to="/categories" className="text-neutral-700 hover:text-primary transition-colors font-medium">
              Categorias
            </Link>
            <Link to="/orders" className="text-neutral-700 hover:text-primary transition-colors font-medium">
              Pedidos
            </Link>
            <Link to="/about" className="text-neutral-700 hover:text-primary transition-colors font-medium">
              Sobre
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-neutral-700 hover:text-primary transition-colors font-medium">
                Admin
              </Link>
            )}
          </nav>
          
          {/* Right actions (search, cart, account) */}
          <div className="flex items-center space-x-4">
            {/* Search Button - Reduced icon size */}
            <button 
              aria-label="Pesquisar"
              className="text-neutral-700 hover:text-primary transition-colors p-1.5"
            >
              <BsSearch className="w-5 h-5" />
            </button>
            
            {/* Cart Button - Reduced icon size */}
            <Link 
              to="/cart" 
              aria-label="Carrinho de compras"
              className="text-neutral-700 hover:text-primary transition-colors p-1.5 relative"
            >
              <BsCart3 className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Link>
            
            {/* Account Button - Reduced icon size */}
            <Link 
              to="/account" 
              aria-label="Minha conta"
              className="text-neutral-700 hover:text-primary transition-colors p-1.5"
            >
              <BsPersonCircle className="w-5 h-5" />
            </Link>
            
            {/* Mobile menu button - Reduced icon size */}
            <button 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              className="md:hidden text-neutral-700 hover:text-primary transition-colors p-1.5"
            >
              {isMenuOpen ? (
                <BsX className="w-5 h-5" />
              ) : (
                <BsList className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200">
            <nav className="py-4 flex flex-col">
              <Link to="/products" className="py-2 px-4 text-neutral-700 hover:bg-neutral-100">
                Produtos
              </Link>
              <Link to="/categories" className="py-2 px-4 text-neutral-700 hover:bg-neutral-100">
                Categorias
              </Link>
              <Link to="/orders" className="py-2 px-4 text-neutral-700 hover:bg-neutral-100">
                Pedidos
              </Link>
              <Link to="/about" className="py-2 px-4 text-neutral-700 hover:bg-neutral-100">
                Sobre
              </Link>
              {isAdmin && (
                <Link to="/admin" className="py-2 px-4 text-neutral-700 hover:bg-neutral-100">
                  Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  isAdmin: PropTypes.bool
};

export default Header; 