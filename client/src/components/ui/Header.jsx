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
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 50,
      width: '100%',
      backgroundColor: '#000000',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Top Bar - Contact Info and Account Links */}
      <div style={{ 
        backgroundColor: '#1A1A1A',
        color: 'white',
        padding: '0.5rem 0',
        fontSize: '0.875rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          {/* Contact Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a 
              href="tel:+351963965903"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.2s ease' 
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              <BsTelephone style={{ marginRight: '0.25rem' }} />
              (+351) 96 396 59 03
            </a>
            <a 
              href="mailto:alimamedetools@gmail.com"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.2s ease' 
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              <BsEnvelope style={{ marginRight: '0.25rem' }} />
              alimamedetools@gmail.com
            </a>
          </div>
          
          {/* Quick Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link 
              to="/sobre-nos"
              style={{ 
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.2s ease' 
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              Sobre Nós
            </Link>
            <Link 
              to="/contactos"
              style={{ 
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.2s ease' 
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              Contactos
            </Link>
            <Link 
              to="/ajuda"
              style={{ 
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.2s ease' 
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}
            >
              Ajuda
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#000000',
        color: 'white'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo variant="light" size="medium" />
          </Link>
        </div>
        
        {/* Search Bar - Desktop */}
        <div style={{ 
          flex: '1',
          maxWidth: '600px',
          margin: '0 2rem',
          display: 'flex',
          position: 'relative'
        }}>
          <input 
            type="text" 
            placeholder="Procurar produtos..." 
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              paddingRight: '3rem',
              border: '1px solid #e5e5e5',
              borderRadius: '0.25rem',
              fontSize: '0.875rem'
            }}
          />
          <button 
            type="submit"
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              height: '100%',
              width: '3rem',
              backgroundColor: '#FFCC00',
              border: 'none',
              borderTopRightRadius: '0.25rem',
              borderBottomRightRadius: '0.25rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5B800'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
          >
            <BsSearch style={{ color: '#1A1A1A' }} />
          </button>
        </div>
        
        {/* Account and Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link 
            to="/carrinho"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            <BsCart3 size={20} />
            <span>Carrinho</span>
          </Link>
          
          <Link 
            to={isAdmin ? "/admin" : "/auth/login"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            <BsPersonCircle size={20} />
            <span>{isAdmin ? "Painel Admin" : "Conta"}</span>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={toggleMenu}
            style={{
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block'
              },
              backgroundColor: 'transparent',
              border: 'none',
              color: '#1A1A1A',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {isMenuOpen ? <BsX size={24} /> : <BsList size={24} />}
          </button>
        </div>
      </div>
      
      {/* Categories Navigation */}
      <nav style={{ 
        borderTop: '1px solid #333',
        borderBottom: '1px solid #333',
        backgroundColor: '#000000'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/categorias/ferramentas-manuais"
            style={{ 
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Ferramentas Manuais
          </Link>
          <Link 
            to="/categorias/ferramentas-electricas" 
            style={{
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Ferramentas Elétricas
          </Link>
          <Link 
            to="/categorias/abrasivos" 
            style={{
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Abrasivos
          </Link>
          <Link 
            to="/categorias/jardim" 
            style={{
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Jardim
          </Link>
          <Link 
            to="/categorias/protecao" 
            style={{
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Proteção
          </Link>
          <Link 
            to="/todas-categorias" 
            style={{
              padding: '0.75rem 1rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Todas as Categorias
          </Link>
        </div>
      </nav>
      
      {/* Mobile Menu - Shown when isMenuOpen is true */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '300px',
          backgroundColor: 'white',
          boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
          zIndex: 100,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <Logo variant="primary" size="small" />
            <button 
              onClick={toggleMenu}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#1A1A1A',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <BsX size={24} />
            </button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Procurar produtos..." 
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: '1px solid #e5e5e5',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <nav style={{ flex: 1 }}>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <li>
                <Link 
                  to="/categorias/ferramentas-manuais" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Ferramentas Manuais
                </Link>
              </li>
              <li>
                <Link 
                  to="/categorias/ferramentas-electricas" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Ferramentas Elétricas
                </Link>
              </li>
              <li>
                <Link 
                  to="/categorias/abrasivos" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Abrasivos
                </Link>
              </li>
              <li>
                <Link 
                  to="/categorias/jardim" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Jardim
                </Link>
              </li>
              <li>
                <Link 
                  to="/categorias/protecao" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Proteção
                </Link>
              </li>
              <li>
                <Link 
                  to="/todas-categorias" 
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontWeight: '500',
                    borderLeft: '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={toggleMenu}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#FFCC00';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Todas as Categorias
                </Link>
              </li>
            </ul>
          </nav>
          
          <div style={{
            marginTop: 'auto',
            borderTop: '1px solid #e5e5e5',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <Link 
              to="/carrinho"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1A1A1A',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'background-color 0.2s ease'
              }}
              onClick={toggleMenu}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <BsCart3 size={20} />
              <span>Carrinho</span>
            </Link>
            
            <Link 
              to={isAdmin ? "/admin" : "/auth/login"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1A1A1A',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'background-color 0.2s ease'
              }}
              onClick={toggleMenu}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <BsPersonCircle size={20} />
              <span>{isAdmin ? "Painel Admin" : "Conta"}</span>
            </Link>
          </div>
        </div>
      )}
      
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 90
          }}
          onClick={toggleMenu}
        />
      )}
    </header>
  );
};

Header.propTypes = {
  isAdmin: PropTypes.bool
};

export default Header; 