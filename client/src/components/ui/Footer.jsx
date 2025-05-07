import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { BsFacebook, BsInstagram, BsTwitter, BsLinkedin, BsEnvelope, BsTelephone, BsGeoAlt } from 'react-icons/bs';

/**
 * Footer component that follows the AliTools design system
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
  const currentYear = new Date().getFullYear();
  
  // Simplified version for checkout or specific pages
  if (simplified) {
    return (
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e5e5',
        padding: '1rem 0',
        fontSize: '0.875rem'
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
            <Logo variant="primary" size="small" />
          </div>
          <div style={{ color: '#666' }}>
            &copy; {currentYear} AliTools. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    );
  }
  
  // Full footer for main pages
  return (
    <footer style={{
      backgroundColor: 'white',
      borderTop: '1px solid #e5e5e5',
      paddingTop: '3rem',
      paddingBottom: '1rem'
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
              <Logo variant="primary" size="medium" />
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: '#666',
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
                  backgroundColor: '#1A1A1A',
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
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
              >
                <BsFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1A1A1A',
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
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
              >
                <BsInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1A1A1A',
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
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
              >
                <BsTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1A1A1A',
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
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
              >
                <BsLinkedin />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: '#1A1A1A'
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
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/todas-categorias"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/contactos"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Contactos
                </Link>
              </li>
              <li>
                <Link
                  to="/ajuda"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Ajuda e FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/termos-condicoes"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Termos e Condições
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-privacidade"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.25rem',
              color: '#1A1A1A'
            }}>
              Categorias
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
                  to="/categorias/ferramentas-manuais"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Ferramentas Manuais
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias/ferramentas-electricas"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Ferramentas Elétricas
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias/abrasivos"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Abrasivos
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias/jardim"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Jardim
                </Link>
              </li>
              <li>
                <Link
                  to="/categorias/protecao"
                  style={{
                    color: '#666',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'inline-block',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                >
                  Proteção
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
              color: '#1A1A1A'
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
                fontSize: '0.875rem',
                color: '#666'
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
                fontSize: '0.875rem',
                color: '#666'
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
                fontSize: '0.875rem',
                color: '#666'
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
                fontSize: '0.875rem',
                color: '#666'
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
        borderTop: '1px solid #e5e5e5',
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
          fontSize: '0.875rem',
          color: '#666'
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
                color: '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = '#666'}
            >
              Termos
            </Link>
            <Link
              to="/politica-privacidade"
              style={{
                color: '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = '#666'}
            >
              Privacidade
            </Link>
            <Link
              to="/cookies"
              style={{
                color: '#666',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#FFCC00'}
              onMouseOut={(e) => e.currentTarget.style.color = '#666'}
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