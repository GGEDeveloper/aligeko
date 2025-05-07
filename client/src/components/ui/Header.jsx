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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="block" aria-label="AliTools Home">
              <Logo variant="primary" size="small" />
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
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
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Search Toggle - Mobile */}
            <button 
              onClick={toggleSearch} 
              className="p-2 md:hidden text-neutral-700 hover:text-brand transition-colors"
              aria-label="Search"
            >
              <BsSearch className="w-5 h-5" />
            </button>
            
            {/* Cart */}
            <Link 
              to="/carrinho" 
              className="relative p-2 text-neutral-700 hover:text-brand transition-colors flex items-center"
              aria-label="Cart"
            >
              <BsCart3 className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-brand text-primary-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                0
              </span>
              <span className="hidden md:inline ml-1">Carrinho</span>
            </Link>
            
            {/* Account */}
            <Link 
              to="/login" 
              className="p-2 text-neutral-700 hover:text-brand transition-colors flex items-center"
              aria-label="Account"
            >
              <BsPersonCircle className="w-5 h-5" />
              <span className="hidden md:inline ml-1">Conta</span>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu} 
              className="p-2 ml-1 md:hidden text-neutral-700 hover:text-brand transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <BsX className="w-6 h-6" /> : <BsList className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Search - Conditional */}
        {isSearchOpen && (
          <div className="mt-3 px-4 pb-3 md:hidden">
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
      
      {/* Category Navigation Bar */}
      <nav className="bg-neutral-100 border-t border-neutral-200 hidden md:block">
        <div className="container mx-auto">
          <ul className="flex space-x-1 overflow-x-auto">
            <li>
              <Link to="/categorias/ferramentas-manuais" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Ferramentas Manuais
              </Link>
            </li>
            <li>
              <Link to="/categorias/ferramentas-eletricas" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Ferramentas Elétricas
              </Link>
            </li>
            <li>
              <Link to="/categorias/abrasivos" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Abrasivos
              </Link>
            </li>
            <li>
              <Link to="/categorias/jardim" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Jardim
              </Link>
            </li>
            <li>
              <Link to="/categorias/protecao" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Proteção
              </Link>
            </li>
            <li>
              <Link to="/todas-categorias" className="block px-4 py-3 text-sm font-medium text-neutral-800 hover:text-brand hover:bg-white transition-colors whitespace-nowrap">
                Todas as Categorias
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu - Conditional */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 absolute w-full shadow-lg z-50">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-1">
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
              <Link to="/todas-categorias" className="block px-3 py-2 text-neutral-800 hover:bg-neutral-100 hover:text-brand rounded-md font-medium">
                Todas as Categorias
              </Link>
              
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