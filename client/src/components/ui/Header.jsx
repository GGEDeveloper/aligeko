import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Icons
import { BsSearch, BsCart3, BsPersonCircle, BsList, BsX, BsTelephone, BsEnvelope } from 'react-icons/bs';

/**
 * Header component for the AliTools B2B site
 * Includes navigation, logo, and user controls
 */
const Header = ({ isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="relative bg-white shadow-md w-full z-50">
      {/* Top Bar - Contact Info and Account Links */}
      <div className="bg-primary-800 text-white py-2 px-4 text-xs md:text-sm hidden md:block">
        <div className="container mx-auto flex justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <BsTelephone className="mr-1 text-brand" />
              <span>Tel: (+351) 96 396 59 03</span>
            </span>
            <span>|</span>
            <span className="flex items-center">
              <BsEnvelope className="mr-1 text-brand" />
              <span>alimamedetools@gmail.com</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-brand transition-colors">Sobre Nós</Link>
            <span>|</span>
            <Link to="/contactos" className="hover:text-brand transition-colors">Contactos</Link>
            <span>|</span>
            <Link to="/ajuda" className="hover:text-brand transition-colors">Ajuda</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="block mr-4" aria-label="AliTools Home">
              <Logo variant="primary" size="medium" />
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Procurar produtos..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                aria-label="Search products"
              />
              <button 
                className="absolute right-0 top-0 bottom-0 bg-brand hover:bg-brand-600 text-primary-900 px-4 rounded-r-md transition-colors"
                aria-label="Search"
              >
                <BsSearch className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Link */}
            <Link 
              to="/cart" 
              className="hidden md:flex items-center text-primary hover:text-brand transition-colors"
              aria-label="View Cart"
            >
              <BsCart3 className="w-5 h-5 mr-1" />
              <span className="hidden lg:inline-block">Carrinho</span>
            </Link>
            
            {/* Account Link */}
            <Link 
              to="/auth/login" 
              className="hidden md:flex items-center text-primary hover:text-brand transition-colors ml-4"
              aria-label="Account"
            >
              <BsPersonCircle className="w-5 h-5 mr-1" />
              <span className="hidden lg:inline-block">Conta</span>
            </Link>
            
            {/* Mobile Search Toggle */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-2 text-primary hover:text-brand transition-colors"
              aria-label="Search"
            >
              <BsSearch className="w-5 h-5" />
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 text-primary hover:text-brand transition-colors ml-1"
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? (
                <BsX className="w-6 h-6" />
              ) : (
                <BsList className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search - Only visible when toggled */}
        {isSearchOpen && (
          <div className="md:hidden mt-3 pb-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Procurar produtos..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                aria-label="Search products"
              />
              <button 
                className="absolute right-0 top-0 bottom-0 bg-brand hover:bg-brand-600 text-primary-900 px-4 rounded-r-md transition-colors"
                aria-label="Search"
              >
                <BsSearch className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu - Only visible when toggled */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-300">
          <div className="container mx-auto">
            <nav className="py-4 px-4 space-y-4">
              {/* Category Navigation */}
              <div>
                <p className="px-3 py-1 text-sm font-semibold text-neutral-500">Categorias</p>
                <Link to="/categorias/ferramentas-manuais" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Ferramentas Manuais
                </Link>
                <Link to="/categorias/ferramentas-eletricas" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Ferramentas Elétricas
                </Link>
                <Link to="/categorias/abrasivos" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Abrasivos
                </Link>
                <Link to="/categorias/jardim" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Jardim
                </Link>
                <Link to="/categorias/protecao" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Proteção
                </Link>
                <Link to="/todas-categorias" className="block px-3 py-2 font-medium text-brand hover:bg-neutral-100 rounded-md">
                  Todas as Categorias
                </Link>
              </div>
              
              {/* Account Navigation */}
              <div className="pt-4 mt-3 border-t border-neutral-200">
                <p className="px-3 py-1 text-sm font-semibold text-neutral-500">Conta</p>
                <Link to="/auth/login" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Entrar
                </Link>
                <Link to="/auth/register" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Registar
                </Link>
                <Link to="/cart" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Carrinho
                </Link>
              </div>
              
              <div className="pt-4 mt-3 border-t border-neutral-200">
                <p className="px-3 py-1 text-sm font-semibold text-neutral-500">Empresa</p>
                <Link to="/about" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Sobre Nós
                </Link>
                <Link to="/contactos" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Contactos
                </Link>
                <Link to="/ajuda" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md">
                  Ajuda
                </Link>
                <div className="flex items-center px-3 py-2 text-neutral-800">
                  <BsTelephone className="mr-2 text-brand" />
                  <span>(+351) 96 396 59 03</span>
                </div>
                <div className="flex items-center px-3 py-2 text-neutral-800">
                  <BsEnvelope className="mr-2 text-brand" />
                  <span>alimamedetools@gmail.com</span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  isAdmin: PropTypes.bool
};

export default Header; 