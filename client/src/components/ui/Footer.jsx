import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { BsFacebook, BsInstagram, BsTwitter, BsLinkedin, BsEnvelope, BsTelephone, BsGeoAlt, BsMoonFill, BsSunFill } from 'react-icons/bs';

/**
 * Footer component that follows the AliTools design system
 * Includes theme toggle with night mode as default
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.simplified - Whether to show a simplified version of the footer
 * @param {string} props.className - Additional CSS classes
 */
const Footer = ({
  simplified = false,
  className = '',
  ...props
}) => {
  // Set night mode as default
  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentYear = new Date().getFullYear();
  
  const toggleTheme = () => {
    // In a real implementation, this would update a global theme context
    // or dispatch a Redux action to update the app's theme
    setIsDarkMode(!isDarkMode);
    
    // Example of how this would work with a global theme
    // document.documentElement.classList.toggle('dark-theme');
    console.log(`Theme switched to ${!isDarkMode ? 'dark' : 'light'} mode`);
  };
  
  // Simplified version for checkout or specific pages
  if (simplified) {
    return (
      <footer style={{
        backgroundColor: isDarkMode ? '#121212' : 'white',
        borderTop: `1px solid ${isDarkMode ? '#333' : '#e5e5e5'}`,
        padding: '1rem 0',
        fontSize: '0.875rem',
        color: isDarkMode ? '#e0e0e0' : '#666',
        transition: 'background-color 0.3s ease, color 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <Logo variant={isDarkMode ? "light" : "primary"} size="small" />
          </div>
          <div>
            &copy; {currentYear} AliTools. Todos os direitos reservados.
          </div>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: isDarkMode ? '#FFCC00' : '#1A1A1A',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'color 0.3s ease, background-color 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 204, 0, 0.1)' : 'rgba(26, 26, 26, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
          </button>
        </div>
      </footer>
    );
  }
  
  // Full footer for main pages
  return (
    <footer style={{
      backgroundColor: isDarkMode ? '#121212' : 'white',
      borderTop: `1px solid ${isDarkMode ? '#333' : '#e5e5e5'}`,
      paddingTop: '3rem',
      paddingBottom: '1rem',
      color: isDarkMode ? '#e0e0e0' : '#666',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Main Footer */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Brand & About */}
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <Logo variant={isDarkMode ? "light" : "primary"} size="medium" />
            </div>
            <p style={{
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              AliTools é uma empresa de distribuição B2B de ferramentas profissionais sediada em Lisboa, Portugal. Fornecemos produtos de qualidade premium para distribuidores e revendedores.
            </p>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#1A1A1A',
                  color: 'white',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#1A1A1A'}
              >
                <BsFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#1A1A1A',
                  color: 'white',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#1A1A1A'}
              >
                <BsInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#1A1A1A',
                  color: 'white',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#1A1A1A'}
              >
                <BsTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#1A1A1A',
                  color: 'white',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#1A1A1A'}
              >
                <BsLinkedin />
              </a>
              
              {/* Theme toggle button */}
              <button
                onClick={toggleTheme}
                style={{
                  backgroundColor: isDarkMode ? '#2A2A2A' : '#1A1A1A',
                  color: 'white',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2A2A2A' : '#1A1A1A'}
              >
                {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
              </button>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: isDarkMode ? '#FFFFFF' : '#1A1A1A'
            }}>
              Links Rápidos
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <li>
                <Link
                  to="/sobre-nos"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/todas-categorias"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/contactos"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Contactos
                </Link>
              </li>
              <li>
                <Link
                  to="/ajuda"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Ajuda e FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/termos-condicoes"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-privacidade"
                  style={{
                    color: isDarkMode ? '#CCCCCC' : '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: isDarkMode ? '#FFFFFF' : '#1A1A1A'
            }}>
              Contacte-nos
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div style={{
                  color: '#FFCC00',
                  marginTop: '0.25rem'
                }}>
                  <BsGeoAlt />
                </div>
                <div>
                  AlimamedeTools Lda.<br />
                  Lisboa, Portugal
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div style={{
                  color: '#FFCC00'
                }}>
                  <BsTelephone />
                </div>
                <div>
                  (+351) 96 396 59 03
                </div>
              </li>
              <li style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div style={{
                  color: '#FFCC00'
                }}>
                  <BsEnvelope />
                </div>
                <div>
                  alimamedetools@gmail.com
                </div>
              </li>
              <li style={{
                fontSize: '0.875rem'
              }}>
                <strong>Horário:</strong><br />
                Segunda a Sexta: 9:00-12:30, 14:00-18:30
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div style={{
        borderTop: `1px solid ${isDarkMode ? '#333' : '#e5e5e5'}`,
        paddingTop: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div>
            &copy; {currentYear} AliTools. Todos os direitos reservados.
          </div>
          <div style={{
            display: 'flex',
            gap: '1.5rem'
          }}>
            <Link
              to="/termos-condicoes"
              style={{
                color: isDarkMode ? '#CCCCCC' : '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
            >
              Termos
            </Link>
            <Link
              to="/politica-privacidade"
              style={{
                color: isDarkMode ? '#CCCCCC' : '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
            >
              Privacidade
            </Link>
            <Link
              to="/cookies"
              style={{
                color: isDarkMode ? '#CCCCCC' : '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = isDarkMode ? '#CCCCCC' : '#666'}
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  simplified: PropTypes.bool,
  className: PropTypes.string
};

export default Footer; 