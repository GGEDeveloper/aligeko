import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight } from 'react-icons/bs';
import logoImage from '../../assets/logos/png/primary/alitools_primary_fullcolor_500px.png';

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
      // Cria uma oscilação suave entre 0 e 1 para o brilho, ainda mais intensa
      const newIntensity = (Math.sin(elapsed / 400) + 1) / 1.5; // Even faster animation & more intensity
      setGlowIntensity(newIntensity);
      
      frame = requestAnimationFrame(animate);
    };
    
    frame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  
  // Calcula o valor do box-shadow com base na intensidade do brilho - aumentada ainda mais
  const glowSize = Math.floor(30 + glowIntensity * 55); // Even larger glow size
  const glowOpacity = 0.75 + glowIntensity * 0.35; // Even more intense glow opacity
  
  return (
    <div style={{
      width: '100%',
      height: '800px', // Even taller hero section
      background: 'linear-gradient(135deg, #0A0A0A 0%, #222222 100%)',
      overflow: 'hidden',
      position: 'relative',
      borderBottom: '4px solid #FFCC00'
    }}>
      {/* Elementos decorativos de fundo - aumentada densidade ainda mais */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle, rgba(255, 204, 0, 0.05) 1px, transparent 1px)',
        backgroundSize: '10px 10px', // Even smaller grid for more particles
        backgroundPosition: '0 0',
        zIndex: 1
      }} />
      
      {/* Logo flutuante com animação de brilho - aumentado tamanho e movimento ainda mais */}
      <div style={{
        position: 'absolute',
        left: '20%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'float 2.5s ease-in-out infinite' // Even faster animation
      }}>
        <img 
          src={logoImage} 
          alt="AliTools Logo" 
          style={{
            width: '500px', // Drastically larger logo
            height: '500px', // Drastically larger logo
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
          fontSize: '3.2rem', // Even larger size
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
          fontSize: '1.4rem', // Even larger size
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
            padding: '1rem 2.2rem',
            backgroundColor: '#FFD700',
            color: '#374151', // Cinza escuro
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease-in-out',
            border: '2px solid #FFC107',
            fontSize: '1.3rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#FFC107';
            e.currentTarget.style.color = '#000000'; // Preto no hover
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 200, 0, 0.4)';
            e.currentTarget.style.borderColor = '#FFB300';
            // Atualiza a cor da seta para preto também
            const arrow = e.currentTarget.querySelector('svg');
            if (arrow) arrow.style.color = '#000000';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FFD700';
            e.currentTarget.style.color = '#374151'; // Volta para cinza escuro
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            e.currentTarget.style.borderColor = '#FFC107';
            // Volta a cor da seta para cinza escuro
            const arrow = e.currentTarget.querySelector('svg');
            if (arrow) arrow.style.color = '#374151';
          }}
        >
          <span style={{
            color: '#374151',
            transition: 'color 0.3s ease-in-out'
          }}>Ver Produtos</span>
          <BsArrowRight style={{ 
            marginLeft: '0.75rem', 
            fontSize: '1.4rem',
            color: '#374151',
            transition: 'color 0.3s ease-in-out'
          }} />
        </Link>
      </div>
      
      {/* Partículas decorativas - aumentado número e variação ainda mais */}
      <div className="particles" style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2
      }} />
      
      {/* Additional particles overlays for even more density */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: 'radial-gradient(circle at 30% 20%, rgba(255, 204, 0, 0.12) 0%, transparent 10%), radial-gradient(circle at 70% 60%, rgba(255, 204, 0, 0.09) 0%, transparent 15%)'
      }} />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: 'radial-gradient(circle at 75% 25%, rgba(255, 204, 0, 0.1) 0%, transparent 12%), radial-gradient(circle at 40% 80%, rgba(255, 204, 0, 0.09) 0%, transparent 18%)'
      }} />
      
      {/* Even more particle layers */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: 'radial-gradient(circle at 25% 60%, rgba(255, 204, 0, 0.08) 0%, transparent 14%), radial-gradient(circle at 85% 40%, rgba(255, 204, 0, 0.09) 0%, transparent 16%)'
      }} />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: 'radial-gradient(circle at 55% 15%, rgba(255, 204, 0, 0.07) 0%, transparent 12%), radial-gradient(circle at 15% 35%, rgba(255, 204, 0, 0.08) 0%, transparent 14%)'
      }} />
      
      {/* Estilos para a animação flutuante - movimento ainda mais extremo */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translate(-50%, -50%);
            }
            25% {
              transform: translate(-40%, -75%); /* Even more extreme movement */
            }
            50% {
              transform: translate(-50%, -85%); /* Even more extreme movement */
            }
            75% {
              transform: translate(-60%, -75%); /* Even more extreme movement */
            }
            100% {
              transform: translate(-50%, -50%);
            }
          }
          
          .particles::before,
          .particles::after,
          .particles::before::before,
          .particles::after::after,
          .particles::before::after,
          .particles::after::before {
            content: '';
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 204, 0, 0.6); /* Increased opacity */
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            box-shadow: 0 0 25px rgba(255, 204, 0, 0.8); /* Increased glow */
          }
          
          .particles::before {
            width: 18px; /* Even larger particles */
            height: 18px;
            top: 20%;
            left: 30%;
            animation-name: particle1;
            animation-duration: 6s; /* Even faster animation */
          }
          
          .particles::after {
            width: 22px; /* Even larger particles */
            height: 22px;
            bottom: 30%;
            right: 25%;
            animation-name: particle2;
            animation-duration: 7s; /* Even faster animation */
          }
          
          /* Additional particles using pseudo-elements */
          .particles {
            position: relative;
          }
          
          .particles::before::before {
            width: 16px; /* Even larger particles */
            height: 16px;
            top: 55%;
            left: 15%;
            animation-name: particle3;
            animation-duration: 8s; /* Even faster animation */
          }
          
          .particles::after::after {
            width: 14px; /* Even larger particles */
            height: 14px;
            bottom: 20%;
            right: 40%;
            animation-name: particle4;
            animation-duration: 5s; /* Even faster animation */
          }
          
          /* Add more particles with raw HTML */
          .particles::before::after {
            width: 30px; /* Even larger particles */
            height: 30px;
            top: 70%;
            left: 70%;
            animation-name: particle5;
            animation-duration: 9s; /* Even faster animation */
          }
          
          .particles::after::before {
            width: 15px; /* Even larger particles */
            height: 15px;
            top: 10%;
            right: 15%;
            animation-name: particle6;
            animation-duration: 7s; /* Even faster animation */
          }
          
          /* Additional particle elements with greater density */
          .particles::before {
            box-shadow: 
              0 0 25px rgba(255, 204, 0, 0.8), /* More intense glow */
              -160px 110px 0 rgba(255, 204, 0, 0.5), /* Increased opacity */
              160px -110px 0 rgba(255, 204, 0, 0.5), /* Increased opacity */
              110px 160px 0 rgba(255, 204, 0, 0.45), /* Increased opacity */
              -110px -160px 0 rgba(255, 204, 0, 0.45), /* Increased opacity */
              220px 60px 0 rgba(255, 204, 0, 0.4), /* Increased opacity */
              -220px -60px 0 rgba(255, 204, 0, 0.4), /* Increased opacity */
              190px 190px 0 rgba(255, 204, 0, 0.35), /* Additional particles */
              -190px -190px 0 rgba(255, 204, 0, 0.35), /* Additional particles */
              230px -80px 0 rgba(255, 204, 0, 0.3), /* Additional particles */
              -230px 80px 0 rgba(255, 204, 0, 0.3), /* Additional particles */
              -260px -130px 0 rgba(255, 204, 0, 0.25), /* New particles */
              260px 130px 0 rgba(255, 204, 0, 0.25), /* New particles */
              -180px -250px 0 rgba(255, 204, 0, 0.2), /* Extra particles */
              180px 250px 0 rgba(255, 204, 0, 0.2), /* Extra particles */
              300px 40px 0 rgba(255, 204, 0, 0.15), /* Extra particles */
              -300px -40px 0 rgba(255, 204, 0, 0.15); /* Extra particles */
          }

          @keyframes particle1 {
            0% {
              transform: translate(0, 0);
            }
            25% {
              transform: translate(200px, 100px); /* More extreme movement */
            }
            50% {
              transform: translate(0, 200px); /* More extreme movement */
            }
            75% {
              transform: translate(-200px, 100px); /* More extreme movement */
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
              transform: translate(-180px, -100px); /* More extreme movement */
            }
            50% {
              transform: translate(0, -200px); /* More extreme movement */
            }
            75% {
              transform: translate(180px, -100px); /* More extreme movement */
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes particle3 {
            0% {
              transform: translate(0, 0);
            }
            33% {
              transform: translate(180px, -100px); /* More extreme movement */
            }
            66% {
              transform: translate(-180px, -100px); /* More extreme movement */
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes particle4 {
            0% {
              transform: translate(0, 0);
            }
            33% {
              transform: translate(-150px, 180px); /* More extreme movement */
            }
            66% {
              transform: translate(150px, 180px); /* More extreme movement */
            }
            100% {
              transform: translate(0, 0);
            }
          }
          
          @keyframes particle5 {
            0% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(120px, -140px) scale(0.6); /* More extreme movement */
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }
          
          @keyframes particle6 {
            0% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-120px, 140px) scale(1.6); /* More extreme movement */
            }
            100% {
              transform: translate(0, 0) scale(1);
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