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
    
    frame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  
  // Calcula o valor do box-shadow com base na intensidade do brilho
  const glowSize = Math.floor(10 + glowIntensity * 15);
  const glowOpacity = 0.4 + glowIntensity * 0.6;
  
  return (
    <div style={{
      width: '100%',
      height: '500px',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #222222 100%)',
      overflow: 'hidden',
      position: 'relative',
      borderBottom: '4px solid #FFCC00'
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle, rgba(255, 204, 0, 0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0',
        zIndex: 1
      }} />
      
      {/* Logo flutuante com animação de brilho */}
      <div style={{
        position: 'absolute',
        left: '15%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <img 
          src={logoImage} 
          alt="AliTools Logo" 
          style={{
            width: '220px',
            height: '220px',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 ${glowSize}px rgba(255, 204, 0, ${glowOpacity}))`,
            transition: 'filter 0.2s ease'
          }}
        />
      </div>
      
      {/* Conteúdo/texto */}
      <div style={{
        position: 'absolute',
        right: '10%',
        top: '50%',
        transform: 'translateY(-50%)',
        maxWidth: '500px',
        zIndex: 3,
        textAlign: 'left',
        padding: '2rem',
        borderRadius: '12px',
        background: 'rgba(0, 0, 0, 0.75)', // Dark overlay for text contrast
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #FFCC00, #FFAA00)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          Ferramentas Profissionais
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '1.5rem',
          color: '#FFFFFF', // Changed to white for better contrast
          maxWidth: '90%',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
        }}>
          As melhores ferramentas para profissionais exigentes. 
          Qualidade, durabilidade e eficiência para o seu trabalho.
        </p>
        
        <Link 
          to="/products" 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#FFCC00',
            color: '#000000',
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(255, 204, 0, 0.3)',
            transition: 'all 0.3s ease',
            border: '2px solid #FFCC00'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.color = '#FFCC00';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 204, 0, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FFCC00';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 204, 0, 0.3)';
          }}
        >
          Ver Produtos
          <BsArrowRight style={{ marginLeft: '0.5rem' }} />
        </Link>
      </div>
      
      {/* Partículas decorativas */}
      <div className="particles" style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2
      }} />
      
      {/* Estilos para a animação flutuante */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translate(-50%, -50%);
            }
            50% {
              transform: translate(-50%, -60%);
            }
            100% {
              transform: translate(-50%, -50%);
            }
          }
          
          .particles::before,
          .particles::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(255, 204, 0, 0.3);
            animation-duration: 10s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            box-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
          }
          
          .particles::before {
            top: 20%;
            left: 30%;
            animation-name: particle1;
          }
          
          .particles::after {
            bottom: 30%;
            right: 25%;
            animation-name: particle2;
          }
          
          @keyframes particle1 {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(100px, 50px);
            }
            50% {
              transform: translate(0, 100px);
            }
            75% {
              transform: translate(-100px, 50px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes particle2 {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(-70px, -30px);
            }
            50% {
              transform: translate(0, -60px);
            }
            75% {
              transform: translate(70px, -30px);
            }
            100% {
              transform: translate(0, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

// Componente Hero3DLogo que agora apenas exibe o fallback 2D mais seguro e estável
const Hero3DLogo = () => {
  return <Hero2DFallback />;
};

export default Hero3DLogo; 