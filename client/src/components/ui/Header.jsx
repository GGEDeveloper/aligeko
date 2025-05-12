import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

// Icons
import { BsSearch, BsCart3, BsPersonCircle, BsList, BsX, BsTelephone, BsEnvelope } from 'react-icons/bs';

/**
 * Header component for the AliTools B2B site
 * Includes navigation, logo, and user controls
 */
const Header = ({ isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // Get the appropriate account link and text based on user state
  const getAccountLinkInfo = () => {
    if (isAdmin) {
      return { link: "/admin", text: "Painel Admin" };
    } else if (user) {
      return { link: "/account", text: "Minha Conta" };
    } else {
      return { link: "/auth/login", text: "Entrar" };
    }
  };

  const accountInfo = getAccountLinkInfo();

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 50,
      width: '100%',
      backgroundColor: '#000000',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Top Bar - Contact Info and Account Links */}
      <div style={{ 
        background: 'linear-gradient(90deg, #000000 0%, #1A1A1A 100%)',
        color: 'white',
        padding: '0.6rem 0',
        fontSize: '0.875rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          {/* Contact Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a 
              href="tel:+351963965903"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#EEEEEE',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#FFCC00';
                e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#EEEEEE';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <BsTelephone style={{ marginRight: '0.5rem' }} />
              (+351) 96 396 59 03
            </a>
            <a 
              href="mailto:alimamedetools@gmail.com"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#EEEEEE',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#FFCC00';
                e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#EEEEEE';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <BsEnvelope style={{ marginRight: '0.5rem' }} />
              alimamedetools@gmail.com
            </a>
          </div>
          
          {/* This div is now empty but we'll keep it for layout consistency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <div style={{ 
        background: 'linear-gradient(90deg, #000000 0%, #111111 100%)',
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem', 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        {/* Logo */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginRight: '2.5rem'
        }}>
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
              padding: '0.75rem 1.25rem',
              paddingRight: '3.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              backgroundColor: '#222222',
              color: 'white',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
            onBlur={(e) => e.currentTarget.style.backgroundColor = '#222222'}
          />
          <button 
            type="submit"
            style={{
              position: 'absolute',
              right: '4px',
              top: '4px',
              height: 'calc(100% - 8px)',
              width: '3.2rem',
              backgroundColor: '#FFCC00',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#E5B800';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FFCC00';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <BsSearch style={{ color: '#1A1A1A', fontSize: '0.8rem' }} />
          </button>
        </div>
        
        {/* Account and Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link 
            to="/carrinho"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <BsCart3 size={22} />
            <span>Carrinho</span>
          </Link>
          
          <Link 
            to={accountInfo.link}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <BsPersonCircle size={22} />
            <span>{accountInfo.text}</span>
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
        background: 'linear-gradient(to right, #1A1A1A, #2A2A2A)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderTop: '1px solid #333',
        borderBottom: '1px solid #333',
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center' // Centralizar as categorias
        }}>
          <Link 
            to="/products"
            style={{ 
              padding: '0.9rem 1.25rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              borderBottom: '2px solid transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.borderBottomColor = '#FFCC00';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Produtos
          </Link>
          
          {/* Added navigation links here */}
          <Link 
            to="/sobre-nos"
            style={{
              padding: '0.9rem 1.25rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              borderBottom: '2px solid transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.borderBottomColor = '#FFCC00';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Sobre Nós
          </Link>
          <Link 
            to="/contato"
            style={{
              padding: '0.9rem 1.25rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              borderBottom: '2px solid transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.borderBottomColor = '#FFCC00';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Contactos
          </Link>
          <Link 
            to="/ajuda"
            style={{
              padding: '0.9rem 1.25rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              borderBottom: '2px solid transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#FFCC00';
              e.currentTarget.style.borderBottomColor = '#FFCC00';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderBottomColor = 'transparent';
            }}
          >
            Ajuda
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
          
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Procurar produtos..." 
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                paddingLeft: '2rem',
                borderRadius: '0.25rem',
                border: '1px solid #e5e5e5',
                fontSize: '0.875rem'
              }}
            />
            <div style={{ 
              position: 'absolute', 
              left: '0.5rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <BsSearch style={{ fontSize: '0.8rem', color: '#666' }} />
            </div>
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
                  to="/products" 
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
                  Produtos
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre-nos" 
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
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link 
                  to="/contato"
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
                  Contactos
                </Link>
              </li>
              <li>
                <Link 
                  to="/ajuda"
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
                  Ajuda
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
              to={accountInfo.link}
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
              <span>{accountInfo.text}</span>
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