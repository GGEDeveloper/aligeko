import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { 
  BsFacebook, 
  BsInstagram, 
  BsTwitter, 
  BsLinkedin, 
  BsEnvelope, 
  BsTelephone, 
  BsMoon, 
  BsSun, 
  BsGeoAlt, 
  BsSend 
} from 'react-icons/bs';

/**
 * Modern footer section with responsive layout and dark mode toggle
 */
function FooterSection() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentYear = new Date().getFullYear();

  // Apply dark mode class when state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300"
      style={{
        backgroundColor: '#0F0F0F',
        color: '#E5E5E5',
        borderTopColor: '#222222'
      }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '3rem 1.5rem'
      }}>
        <div style={{
          display: 'grid',
          gap: '3rem',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
          },
          '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
          }
        }}>
          <div style={{ position: 'relative' }}>
            <h2 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              letterSpacing: '-0.025em' 
            }}>Conecte-se</h2>
            <p style={{ 
              marginBottom: '1.5rem', 
              color: '#9CA3AF' 
            }}>
              Inscreva-se em nossa newsletter para receber atualizações e ofertas exclusivas.
            </p>
            <form style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Digite seu email"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingRight: '3rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.375rem',
                  color: '#E5E5E5',
                  backdropFilter: 'blur(4px)'
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '0.25rem',
                  top: '0.25rem',
                  height: '2rem',
                  width: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFCC00',
                  color: '#000000',
                  borderRadius: '9999px',
                  transition: 'transform 150ms ease-in-out',
                  ':hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <BsSend style={{ height: '1rem', width: '1rem' }} />
                <span style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>Inscrever-se</span>
              </button>
            </form>
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              right: '-1rem', 
              height: '6rem', 
              width: '6rem', 
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 204, 0, 0.1)',
              filter: 'blur(2rem)'
            }} />
          </div>
          
          <div>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.25rem', 
              fontWeight: '600' 
            }}>Links Rápidos</h3>
            <nav style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <Link to="/" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Home
              </Link>
              <Link to="/products" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Produtos
              </Link>
              <Link to="/sobre-nos" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Sobre Nós
              </Link>
              <Link to="/contato" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Contato
              </Link>
              <Link to="/ajuda" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Ajuda
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.25rem', 
              fontWeight: '600' 
            }}>Categorias</h3>
            <nav style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <Link to="/products?category=handtools" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Ferramentas Manuais
              </Link>
              <Link to="/products?category=electrical" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Ferramentas Elétricas
              </Link>
              <Link to="/products?category=construction" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Construção
              </Link>
              <Link to="/products?category=abrasives" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Abrasivos
              </Link>
              <Link to="/products?category=protection" style={{ 
                display: 'block', 
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                Proteção
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.25rem', 
              fontWeight: '600' 
            }}>Contato</h3>
            <address style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              fontStyle: 'normal' 
            }}>
              <a href="mailto:alimamedetools@gmail.com" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#E5E5E5',
                textDecoration: 'none',
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                <BsEnvelope />
                <span>alimamedetools@gmail.com</span>
              </a>
              <a href="tel:+351963965903" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#E5E5E5',
                textDecoration: 'none',
                transition: 'colors 150ms ease-in-out',
                ':hover': { color: '#FFCC00' } 
              }}>
                <BsTelephone />
                <span>(+351) 96 396 59 03</span>
              </a>
              <p style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <BsGeoAlt />
                <span>Lisboa, Portugal</span>
              </p>
            </address>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1.5rem' 
            }}>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '2.5rem', 
                width: '2.5rem', 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E5E5E5',
                transition: 'all 150ms ease-in-out',
                ':hover': { 
                  backgroundColor: '#FFCC00',
                  color: '#000000',
                  transform: 'translateY(-0.25rem)'
                } 
              }}>
                <BsFacebook />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '2.5rem', 
                width: '2.5rem', 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E5E5E5',
                transition: 'all 150ms ease-in-out',
                ':hover': { 
                  backgroundColor: '#FFCC00',
                  color: '#000000',
                  transform: 'translateY(-0.25rem)'
                } 
              }}>
                <BsInstagram />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '2.5rem', 
                width: '2.5rem', 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E5E5E5',
                transition: 'all 150ms ease-in-out',
                ':hover': { 
                  backgroundColor: '#FFCC00',
                  color: '#000000',
                  transform: 'translateY(-0.25rem)'
                } 
              }}>
                <BsTwitter />
              </a>
              <a href="#" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '2.5rem', 
                width: '2.5rem', 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E5E5E5',
                transition: 'all 150ms ease-in-out',
                ':hover': { 
                  backgroundColor: '#FFCC00',
                  color: '#000000',
                  transform: 'translateY(-0.25rem)'
                } 
              }}>
                <BsLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
          marginTop: '3rem', 
          paddingTop: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem',
          '@media (min-width: 768px)': {
            flexDirection: 'row',
            justifyContent: 'space-between'
          } 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem' 
          }}>
            <Logo variant="light" size="small" />
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#9CA3AF' 
            }}>
              © {currentYear} AliTools. Todos os direitos reservados.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            fontSize: '0.875rem', 
            color: '#9CA3AF' 
          }}>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: '#9CA3AF',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 150ms ease-in-out',
                ':hover': { color: '#FFCC00' }
              }}
            >
              {isDarkMode ? <BsMoon /> : <BsSun />}
              <span>{isDarkMode ? 'Modo Escuro' : 'Modo Claro'}</span>
            </button>
            <Link to="/politica-privacidade" style={{ 
              transition: 'colors 150ms ease-in-out',
              ':hover': { color: '#FFCC00' } 
            }}>
              Privacidade
            </Link>
            <Link to="/termos-servico" style={{ 
              transition: 'colors 150ms ease-in-out',
              ':hover': { color: '#FFCC00' } 
            }}>
              Termos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection; 