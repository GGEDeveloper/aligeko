import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import logoImage from '../../assets/logos/png/symbol/alitools_symbol_fullcolor_256px.png';

// Componente 2D com visual moderno que serve como fallback seguro
const Hero2DFallback = () => {
  // Estado para animar o brilho do logo
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  // Efeito de animação simples com JavaScript puro, sem dependências externas
  useEffect(() => {
    let frame;
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      // Cria uma oscilação suave entre 0 e 1 para o brilho
      const newIntensity = (Math.sin(elapsed / 1000) + 1) / 2;
      setGlowIntensity(newIntensity);
      frame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Limpeza na desmontagem
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  
  // Calcula os valores de CSS para o efeito de brilho
  const glowRadius = Math.floor(20 + glowIntensity * 15);
  const glowOpacity = 0.5 + glowIntensity * 0.3;
  
  return (
    <section style={{ 
      backgroundColor: '#1A1A1A', 
      color: 'white', 
      borderRadius: '0.75rem', 
      overflow: 'hidden', 
      position: 'relative', 
      padding: '3rem 1rem',
      marginTop: '1rem',
      height: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Logo com efeito de brilho animado */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 204, 0, ${glowOpacity}) 0%, rgba(255, 204, 0, 0) 70%)`,
          filter: `blur(${glowRadius}px)`,
          opacity: 0.8,
          transition: 'all 0.3s ease'
        }} />
        <img 
          src={logoImage} 
          alt="Ali Tools Logo" 
          style={{
            width: '200px',
            height: '200px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Partículas decorativas simuladas */}
      {Array.from({ length: 20 }).map((_, index) => (
        <div 
          key={index}
          style={{
            position: 'absolute',
            width: Math.random() * 8 + 2 + 'px',
            height: Math.random() * 8 + 2 + 'px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 204, 0, 0.4)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.2,
            animation: `particle-float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Conteúdo de texto */}
      <div style={{ 
        maxWidth: '32rem',
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        padding: '2rem',
        borderRadius: '0.75rem',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{ 
          fontSize: 'clamp(1.875rem, 4vw, 3.5rem)',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          lineHeight: '1.2',
          color: 'white'
        }}>
          Ferramentas Profissionais para o Seu Negócio
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: '#e5e5e5',
          marginBottom: '2rem'
        }}>
          A Ali Tools fornece ferramentas de qualidade premium com preços competitivos para distribuidores e revendedores.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <Link 
            to="/products" 
            style={{ 
              backgroundColor: '#FFCC00', 
              color: '#1A1A1A', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.375rem', 
              fontWeight: '500', 
              transition: 'background-color 0.3s', 
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5B800'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FFCC00'}
          >
            Ver Produtos <BsArrowRight style={{ marginLeft: '0.5rem' }} />
          </Link>
          <Link 
            to="/auth/register" 
            style={{ 
              backgroundColor: 'transparent', 
              border: '2px solid #FFCC00', 
              color: '#FFCC00', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.375rem', 
              fontWeight: '500', 
              transition: 'background-color 0.3s', 
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 204, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Registrar Agora
          </Link>
        </div>
      </div>
      
      {/* CSS para animações */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          
          @keyframes particle-float {
            0%, 100% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(20px, 10px);
            }
            50% {
              transform: translate(10px, 20px);
            }
            75% {
              transform: translate(-10px, 10px);
            }
          }
        `}
      </style>
    </section>
  );
};

// O componente principal agora apenas retorna o fallback seguro
// Removemos completamente a dependência do Three.js para eliminar o erro
const Hero3DLogo = () => {
  // Aqui poderíamos até tentar carregar a versão 3D de forma dinâmica com React.lazy
  // mas por segurança, estamos usando apenas o fallback 2D confiável
  return <Hero2DFallback />;
};

export default Hero3DLogo; 