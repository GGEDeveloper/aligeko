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
    <header className="sticky top-0 z-50 w-full shadow-md bg-white">
      {/* Top Bar - Contact Info and Account Links */}
      <div className="bg-[#1A1A1A] text-white py-1.5 px-4 text-xs md:text-sm">
        <div className="container mx-auto flex justify-between">
          <div className="flex items-center space-x-4">
            <a href="tel:+351963965903" className="flex items-center hover:text-[#FFCC00] transition-colors">
              <BsTelephone className="mr-1 text-[#FFCC00]" />
              <span>(+351) 96 396 59 03</span>
            </a>
            <span className="hidden md:inline">|</span>
            <a href="mailto:alimamedetools@gmail.com" className="hidden md:flex items-center hover:text-[#FFCC00] transition-colors">
              <BsEnvelope className="mr-1 text-[#FFCC00]" />
              <span>alimamedetools@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-[#FFCC00] transition-colors">Sobre Nós</Link>
            <span className="hidden md:inline">|</span>
            <Link to="/contactos" className="hidden md:inline hover:text-[#FFCC00] transition-colors">Contactos</Link>
            <span className="hidden md:inline">|</span>
            <Link to="/ajuda" className="hidden md:inline hover:text-[#FFCC00] transition-colors">Ajuda</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="block" aria-label="AliTools Home">
                <Logo variant="primary" size="small" />
              </Link>
            </div>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Procurar produtos..."
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCC00] focus:border-[#FFCC00]"
                  aria-label="Procurar produtos"
                />
                <button 
                  className="absolute right-0 top-0 h-full bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] px-4 rounded-r-md transition-colors"
                  aria-label="Pesquisar"
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
                className="hidden md:flex items-center text-gray-700 hover:text-[#FFCC00] transition-colors"
                aria-label="Ver Carrinho"
              >
                <BsCart3 className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline-block">Carrinho</span>
              </Link>
              
              {/* Account Link */}
              <Link 
                to="/auth/login" 
                className="hidden md:flex items-center text-gray-700 hover:text-[#FFCC00] transition-colors ml-4"
                aria-label="Conta"
              >
                <BsPersonCircle className="w-5 h-5 mr-1" />
                <span className="hidden lg:inline-block">Conta</span>
              </Link>
              
              {/* Mobile Search Toggle */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 text-gray-700 hover:text-[#FFCC00] transition-colors"
                aria-label="Pesquisar"
              >
                <BsSearch className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={toggleMenu}
                className="md:hidden p-2 text-gray-700 hover:text-[#FFCC00] transition-colors"
                aria-label={isMenuOpen ? "Fechar Menu" : "Abrir Menu"}
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
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFCC00] focus:border-[#FFCC00]"
                  aria-label="Procurar produtos"
                />
                <button 
                  className="absolute right-0 top-0 h-full bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] px-4 rounded-r-md transition-colors"
                  aria-label="Pesquisar"
                >
                  <BsSearch className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation - Desktop */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-6">
            <Link to="/categorias/ferramentas-manuais" className="py-3 text-gray-700 hover:text-[#FFCC00] hover:border-b-2 hover:border-[#FFCC00] -mb-px transition-colors">
              Ferramentas Manuais
            </Link>
            <Link to="/categorias/ferramentas-eletricas" className="py-3 text-gray-700 hover:text-[#FFCC00] hover:border-b-2 hover:border-[#FFCC00] -mb-px transition-colors">
              Ferramentas Elétricas
            </Link>
            <Link to="/categorias/abrasivos" className="py-3 text-gray-700 hover:text-[#FFCC00] hover:border-b-2 hover:border-[#FFCC00] -mb-px transition-colors">
              Abrasivos
            </Link>
            <Link to="/categorias/jardim" className="py-3 text-gray-700 hover:text-[#FFCC00] hover:border-b-2 hover:border-[#FFCC00] -mb-px transition-colors">
              Jardim
            </Link>
            <Link to="/categorias/protecao" className="py-3 text-gray-700 hover:text-[#FFCC00] hover:border-b-2 hover:border-[#FFCC00] -mb-px transition-colors">
              Proteção
            </Link>
            <Link to="/todas-categorias" className="py-3 font-medium text-[#1A1A1A] hover:text-[#FFCC00] transition-colors">
              Todas as Categorias
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Menu - Only visible when toggled */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full left-0">
          <div className="container mx-auto">
            <nav className="py-4 px-4 space-y-2">
              {/* Category Navigation */}
              <div>
                <p className="px-3 py-1 text-sm font-semibold text-gray-500">Categorias</p>
                <Link to="/categorias/ferramentas-manuais" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Ferramentas Manuais
                </Link>
                <Link to="/categorias/ferramentas-eletricas" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Ferramentas Elétricas
                </Link>
                <Link to="/categorias/abrasivos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Abrasivos
                </Link>
                <Link to="/categorias/jardim" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Jardim
                </Link>
                <Link to="/categorias/protecao" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Proteção
                </Link>
                <Link to="/todas-categorias" className="block px-3 py-2 font-medium text-[#FFCC00] hover:bg-gray-100 rounded-md">
                  Todas as Categorias
                </Link>
              </div>
              
              {/* Account Navigation */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="px-3 py-1 text-sm font-semibold text-gray-500">Conta</p>
                <Link to="/auth/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Entrar
                </Link>
                <Link to="/auth/register" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Registar
                </Link>
                <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Carrinho
                </Link>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <p className="px-3 py-1 text-sm font-semibold text-gray-500">Empresa</p>
                <Link to="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Sobre Nós
                </Link>
                <Link to="/contactos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Contactos
                </Link>
                <Link to="/ajuda" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#FFCC00] rounded-md">
                  Ajuda
                </Link>
                <div className="flex items-center px-3 py-2 text-gray-700">
                  <BsTelephone className="mr-2 text-[#FFCC00]" />
                  <span>(+351) 96 396 59 03</span>
                </div>
                <div className="flex items-center px-3 py-2 text-gray-700">
                  <BsEnvelope className="mr-2 text-[#FFCC00]" />
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