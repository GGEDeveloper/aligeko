import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

// Icons
import { BsSearch, BsCart3, BsPersonCircle, BsList, BsX } from 'react-icons/bs';

/**
 * ShrinkingHeader component for the AliTools B2B site
 * Includes navigation, logo, and user controls with shrinking effect on scroll
 */
const ShrinkingHeader = ({ isAdmin = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useSelector(selectCurrentUser);
  
  // Track scroll position to determine if header should shrink
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
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
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      transition: 'all 0.3s ease-in-out',
      willChange: 'transform' // This helps with GPU acceleration
    }}>
      {/* Main Navigation - Shrinks when scrolled */}
      <div style={{ 
        background: 'linear-gradient(90deg, #000000 0%, #111111 100%)',
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: scrolled ? '0.4rem 1.5rem' : '0.6rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        transition: 'all 0.3s ease-in-out',
        willChange: 'padding'
      }}>
        {/* Logo - Gets smaller when scrolled */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginRight: '1rem',
          transform: scrolled ? 'scale(0.85)' : 'scale(1)',
          transformOrigin: 'left center',
          transition: 'all 0.3s ease-in-out'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo variant="light" size={scrolled ? "small" : "medium"} />
          </Link>
        </div>
        
        {/* Search Bar - Desktop */}
        <div style={{ 
          flex: '1',
          maxWidth: '550px',
          margin: '0 0.75rem',
          display: 'flex',
          position: 'relative'
        }}>
          <input 
            type="text" 
            placeholder="Procurar produtos..." 
            style={{
              width: '100%',
              padding: scrolled ? '0.35rem 1rem' : '0.45rem 1rem',
              paddingRight: '3.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
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
              width: '3rem',
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
            <BsSearch style={{ color: '#1A1A1A', fontSize: '1.2rem' }} />
          </button>
        </div>
        
        {/* Account and Cart */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: scrolled ? '0.75rem' : '1rem',
          transition: 'all 0.3s ease-in-out'
        }}>
          <Link 
            to="/carrinho"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'white',
              textDecoration: 'none',
              padding: '0.3rem 0.5rem',
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
            <BsCart3 style={{ fontSize: '1.65rem' }} />
            <span style={{ 
              display: scrolled ? 'none' : 'inline',
              fontSize: '0.9rem'
            }}>Carrinho</span>
          </Link>
          
          <Link 
            to={accountInfo.link}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'white',
              textDecoration: 'none',
              padding: '0.3rem 0.5rem',
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
            <BsPersonCircle style={{ fontSize: '1.65rem' }} />
            <span style={{ 
              display: scrolled ? 'none' : 'inline',
              fontSize: '0.9rem'
            }}>{accountInfo.text}</span>
          </Link>
          
          {/* Mobile Menu Trigger - Only visible on small screens */}
          <button 
            style={{
              display: 'none',
              alignItems: 'center',
              marginLeft: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.65rem',
              padding: '0.25rem',
              '@media (max-width: 768px)': {
                display: 'flex'
              }
            }}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <BsX /> : <BsList />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu - Only visible when menu is open on small screens */}
      <div 
        style={{
          display: isMenuOpen ? 'block' : 'none',
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: '#0A0A0A',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          maxHeight: '60vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Mobile Search */}
          <div style={{ 
            display: 'flex',
            position: 'relative',
            marginBottom: '1rem'
          }}>
            <input 
              type="text" 
              placeholder="Procurar produtos..." 
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                paddingRight: '3rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                backgroundColor: '#1A1A1A',
                color: 'white'
              }}
            />
            <button 
              type="submit"
              style={{
                position: 'absolute',
                right: '4px',
                top: '4px',
                height: 'calc(100% - 8px)',
                width: '2.8rem',
                backgroundColor: '#FFCC00',
                border: 'none',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <BsSearch style={{ color: '#1A1A1A', fontSize: '1.2rem' }} />
            </button>
          </div>
          
          {/* Mobile Nav Links */}
          <Link 
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Home
          </Link>
          
          <Link 
            to="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Produtos
          </Link>
          
          <Link 
            to="/sobre-nos"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Sobre Nós
          </Link>
          
          <Link 
            to="/contato"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Contato
          </Link>
          
          <Link 
            to="/ajuda"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Ajuda
          </Link>
          
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '0.5rem 0' }} />
          
          <Link 
            to="/carrinho"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            <BsCart3 style={{ fontSize: '1.5rem' }} />
            Carrinho
          </Link>
          
          <Link 
            to={accountInfo.link}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            <BsPersonCircle style={{ fontSize: '1.5rem' }} />
            {accountInfo.text}
          </Link>
        </div>
      </div>
    </header>
  );
};

ShrinkingHeader.propTypes = {
  isAdmin: PropTypes.bool
};

export default ShrinkingHeader; 