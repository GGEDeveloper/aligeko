import React from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight, BsTruck, BsShield, BsHeadset, BsTools } from 'react-icons/bs';

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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-[#1A1A1A] text-white rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://placehold.co/1200x600/333/444?text=')] bg-cover bg-center opacity-40"></div>
        
        <div className="container mx-auto relative z-20 py-12 md:py-16 lg:py-20 px-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              Ferramentas Profissionais para o seu Negócio
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              AliTools fornece ferramentas de qualidade premium para distribuidores e revendedores a preços competitivos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/todas-categorias" 
                className="bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] px-6 py-3 rounded-md font-medium transition-colors shadow-md flex items-center"
              >
                Ver Produtos <BsArrowRight className="ml-2" />
              </Link>
              <Link 
                to="/auth/register" 
                className="bg-transparent border-2 border-[#FFCC00] text-[#FFCC00] hover:bg-[#FFCC00]/10 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Registar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-white py-8 px-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start p-4 border-b md:border-b-0 md:border-r border-gray-200 last:border-0">
            <div className="bg-[#FFCC00]/10 p-3 rounded-lg text-[#1A1A1A] mr-4">
              <BsTruck size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Entrega Rápida</h3>
              <p className="text-gray-600 text-sm">Envio em 24-48 horas para todo o Portugal</p>
            </div>
          </div>
          <div className="flex items-start p-4 border-b md:border-b-0 md:border-r border-gray-200 last:border-0">
            <div className="bg-[#FFCC00]/10 p-3 rounded-lg text-[#1A1A1A] mr-4">
              <BsShield size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Qualidade Garantida</h3>
              <p className="text-gray-600 text-sm">Produtos de marcas reconhecidas no mercado</p>
            </div>
          </div>
          <div className="flex items-start p-4 border-b md:border-b-0 md:border-r border-gray-200 last:border-0">
            <div className="bg-[#FFCC00]/10 p-3 rounded-lg text-[#1A1A1A] mr-4">
              <BsHeadset size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Suporte Dedicado</h3>
              <p className="text-gray-600 text-sm">Atendimento personalizado para revendedores</p>
            </div>
          </div>
          <div className="flex items-start p-4">
            <div className="bg-[#FFCC00]/10 p-3 rounded-lg text-[#1A1A1A] mr-4">
              <BsTools size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Variedade de Produtos</h3>
              <p className="text-gray-600 text-sm">Amplo catálogo de ferramentas e equipamentos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Categorias Principais</h2>
            <p className="text-gray-600">Explore nossa seleção de ferramentas profissionais</p>
          </div>
          <Link to="/todas-categorias" className="text-[#FFCC00] font-medium hover:underline flex items-center">
            Ver Todas <BsArrowRight className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/categorias/${category.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-200">{category.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Produtos em Destaque</h2>
            <p className="text-gray-600">Ferramentas de alta qualidade selecionadas para profissionais</p>
          </div>
          <Link to="/produtos" className="text-[#FFCC00] font-medium hover:underline flex items-center">
            Ver Todos <BsArrowRight className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-gray-500 uppercase">{product.category}</span>
                <h3 className="font-semibold text-lg text-[#1A1A1A] mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xl text-[#1A1A1A]">€{product.price.toFixed(2)}</span>
                  <Link 
                    to={`/produto/${product.id}`} 
                    className="bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] py-2 px-3 rounded-md text-sm font-medium transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1A1A1A] rounded-xl overflow-hidden shadow-lg">
        <div className="container mx-auto py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Torne-se um Revendedor AliTools
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Junte-se à nossa rede de distribuidores e tenha acesso a preços especiais, suporte dedicado e as melhores ferramentas do mercado.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/auth/register" 
                className="bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] px-6 py-3 rounded-md font-medium transition-colors"
              >
                Registar Agora
              </Link>
              <Link 
                to="/contactos" 
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Contacte-nos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 