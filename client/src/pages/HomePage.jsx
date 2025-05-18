import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight, BsTruck, BsShield, BsHeadset, BsTools } from 'react-icons/bs';
import Hero3DLogo from '../components/ui/Hero3DLogo';

const HomePage = () => {
  // Sample featured products (would come from an API in production)
  const featuredProducts = [
    {
      id: 1,
      name: 'Professional Drill Set',
      price: 199.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Drill+Set',
      category: 'Power Tools',
    },
    {
      id: 2,
      name: 'Precision Screwdriver Kit',
      price: 49.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Screwdriver+Kit',
      category: 'Hand Tools',
    },
    {
      id: 3,
      name: 'Industrial Safety Glasses',
      price: 29.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Safety+Glasses',
      category: 'Safety Equipment',
    },
    {
      id: 4,
      name: 'Heavy Duty Work Gloves',
      price: 24.99,
      image: 'https://placehold.co/300x300/EEE/31343C?text=Work+Gloves',
      category: 'Safety Equipment',
    },
  ];

  // Sample product categories
  const categories = [
    {
      id: 1,
      name: 'Ferramentas Manuais',
      icon: <BsTools />,
      image: 'https://placehold.co/400x300/EEE/31343C?text=Ferramentas+Manuais',
      description: 'Chaves, martelos, alicates e mais',
      slug: 'ferramentas-manuais',
    },
    {
      id: 2,
      name: 'Ferramentas Elétricas',
      icon: <BsTools />,
      image: 'https://placehold.co/400x300/EEE/31343C?text=Ferramentas+Elétricas',
      description: 'Furadeiras, serras, lixadeiras e mais',
      slug: 'ferramentas-eletricas',
    },
    {
      id: 3,
      name: 'Abrasivos',
      icon: <BsTools />,
      image: 'https://placehold.co/400x300/EEE/31343C?text=Abrasivos',
      description: 'Lixas, discos de corte e polimento',
      slug: 'abrasivos',
    },
    {
      id: 4,
      name: 'Equipamentos de Proteção',
      icon: <BsShield />,
      image: 'https://placehold.co/400x300/EEE/31343C?text=Equipamentos+de+Proteção',
      description: 'Luvas, óculos, capacetes e mais',
      slug: 'protecao',
    },
  ];

  return (
    <div className="space-y-12" style={{ maxWidth: '100%', margin: '0 auto', padding: '0 1rem' }}>
      {/* Hero Section - Using the new 3D Hero */}
      <Hero3DLogo />

      {/* Value Propositions */}
      <section style={{ 
        backgroundColor: 'white', 
        padding: '2rem 1rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 204, 0, 0.1)', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              color: '#1A1A1A', 
              marginRight: '1rem' 
            }}>
              <BsTruck size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Fast Delivery</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>24-48 hour shipping throughout Portugal</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 204, 0, 0.1)', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              color: '#1A1A1A', 
              marginRight: '1rem' 
            }}>
              <BsShield size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Quality Guarantee</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Products from recognized brands in the market</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 204, 0, 0.1)', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              color: '#1A1A1A', 
              marginRight: '1rem' 
            }}>
              <BsHeadset size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Dedicated Support</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Personalized service for resellers</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', padding: '1rem' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 204, 0, 0.1)', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              color: '#1A1A1A', 
              marginRight: '1rem' 
            }}>
              <BsTools size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>Product Variety</h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Extensive catalog of tools and equipment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1A1A1A' }}>Main Categories</h2>
            <p style={{ color: '#666' }}>Explore our selection of professional tools</p>
          </div>
          <Link 
            to="/todas-categorias" 
            style={{ 
              color: '#FFCC00', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            View All <BsArrowRight style={{ marginLeft: '0.25rem' }} />
          </Link>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/categorias/${category.slug}`}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.75rem', 
                overflow: 'hidden', 
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                textDecoration: 'none',
                display: 'block'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ 
                position: 'relative',
                aspectRatio: '4/3',
                backgroundColor: '#f3f4f6',
                overflow: 'hidden'
              }}>
                <img 
                  src={category.image} 
                  alt={category.name}
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'linear-gradient(to top, rgba(26, 26, 26, 0.7), transparent)'
                }}></div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  padding: '1rem', 
                  color: 'white'
                }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1.125rem' }}>{category.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        backgroundColor: '#1A1A1A', 
        borderRadius: '0.75rem', 
        overflow: 'hidden', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '3rem 1rem',
        margin: '2rem 0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: '700',
            color: 'white',
            marginBottom: '1rem'
          }}>
            Become an AliTools Reseller
          </h2>
          <p style={{ 
            color: '#e0e0e0',
            marginBottom: '2rem',
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join our network of distributors and get access to special prices, dedicated support, and the best tools on the market.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <Link 
              to="/auth/register" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#FFD700',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: 'bold',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease-in-out',
                border: '2px solid #FFC107',
                fontSize: '1rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FFC107';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 200, 0, 0.4)';
                e.currentTarget.style.borderColor = '#FFB300';
                const text = e.currentTarget.querySelector('span');
                if (text) text.style.color = '#000000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#FFC107';
                const text = e.currentTarget.querySelector('span');
                if (text) text.style.color = '#374151';
              }}
            >
              <span style={{
                color: '#374151',
                transition: 'color 0.3s ease-in-out'
              }}>Register Now</span>
            </Link>
            <Link 
              to="/contactos" 
              style={{ 
                backgroundColor: 'transparent', 
                border: '2px solid white', 
                color: 'white', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '0.375rem', 
                fontWeight: '500', 
                transition: 'background-color 0.3s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 