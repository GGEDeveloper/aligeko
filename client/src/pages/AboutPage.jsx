import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="w-full bg-primary-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Sobre Nós</h1>
          <p className="text-xl md:text-2xl font-medium">A MARCA DAS MARCAS</p>
          <p className="text-lg mt-2">Ferramentas e Produtos de Proteção</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-700 mb-6">Nossa História</h2>
          <p className="text-neutral-800 mb-4">
            A AlimamedeTools Lda. está situada em Lisboa, Portugal, e tem se destacado na 
            distribuição de ferramentas e produtos de proteção. Com a evolução para a marca AliTools, 
            mantemos nosso compromisso com qualidade e serviço, enquanto modernizamos nossa identidade visual 
            e presença digital para melhor atender ao mercado B2B.
          </p>
          <p className="text-neutral-800 mb-6">
            Nossa empresa é dedicada exclusivamente ao comércio por grosso, atendendo distribuidores 
            nacionais e locais, retalhistas e o comércio local de ferragens, ferramentas e drogarias.
          </p>
          
          <h3 className="text-xl font-semibold text-primary-600 mt-8 mb-4">Missão e Valores</h3>
          <p className="text-neutral-800 mb-4">
            Nossa missão é oferecer aos nossos clientes uma solução global de fornecimento 
            com o intuito de sermos o principal fornecedor. Esta posição nos permite apresentar:
          </p>
          <ul className="list-disc pl-6 mb-6 text-neutral-800">
            <li className="mb-2">Elevada qualidade de serviço</li>
            <li className="mb-2">Preços competitivos</li>
            <li className="mb-2">Desenvolvimento de relações sólidas com clientes</li>
          </ul>
          <p className="text-neutral-800 mb-6">
            Os clientes AlimamedeTools sabem que cada cliente é tratado de uma forma especial. 
            Isto não seria possível se não tivéssemos uma equipa forte e profissional, 
            que abraça os valores familiares da nossa empresa e que compreende que cada cliente é único.
          </p>
        </div>

        {/* Expertise */}
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-700 mb-6">Nossa Especialização</h2>
          <p className="text-neutral-800 mb-6">
            Através do nosso departamento comercial e de produção, fornecemos ferramentas de qualidade 
            com bons materiais a preços competitivos. Nossa especialização inclui:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="border border-neutral-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">Ferramentas para Construção</h3>
              <ul className="list-disc pl-5 text-neutral-700">
                <li>Materiais e equipamentos para obras</li>
                <li>Ferramentas especializadas para construção civil</li>
              </ul>
            </div>
            
            <div className="border border-neutral-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">Ferramentas Manuais</h3>
              <ul className="list-disc pl-5 text-neutral-700">
                <li>Alicates</li>
                <li>Martelos</li>
                <li>Chaves e conjuntos de ferramentas</li>
              </ul>
            </div>
            
            <div className="border border-neutral-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">Ferramentas para Mecânica e Eletricidade</h3>
              <ul className="list-disc pl-5 text-neutral-700">
                <li>Equipamentos para instalações elétricas</li>
                <li>Ferramentas para trabalhos mecânicos</li>
              </ul>
            </div>
            
            <div className="border border-neutral-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">Ferramentas para Jardim</h3>
              <ul className="list-disc pl-5 text-neutral-700">
                <li>Equipamentos para manutenção de espaços verdes</li>
                <li>Ferramentas para jardinagem e paisagismo</li>
              </ul>
            </div>
            
            <div className="border border-neutral-300 rounded-lg p-5 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-3 text-primary-600">Produtos de Proteção e Segurança</h3>
              <ul className="list-disc pl-5 text-neutral-700">
                <li>Luvas de proteção</li>
                <li>Equipamentos de segurança individual</li>
                <li>Proteção para ambientes de trabalho</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Business Model */}
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-700 mb-6">Modelo de Negócio</h2>
          <p className="text-neutral-800 mb-4">
            A AliTools é uma empresa vocacionada para o comércio por grosso, oferecendo:
          </p>
          <ul className="list-disc pl-6 mb-6 text-neutral-800">
            <li className="mb-2">Distribuição exclusiva dos nossos produtos e marcas próprias</li>
            <li className="mb-2">Distribuição de várias marcas nacionais e estrangeiras do mercado europeu</li>
            <li className="mb-2">Fornecimento completo dos artigos necessários ao cliente</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-primary-600 mt-8 mb-4">Clientes Principais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-neutral-100 p-4 rounded-lg text-center">
              <p className="font-medium">Distribuidores Nacionais</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg text-center">
              <p className="font-medium">Distribuidores Locais</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg text-center">
              <p className="font-medium">Retalhistas</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-lg text-center">
              <p className="font-medium">Comércio Local de Ferragens</p>
            </div>
          </div>
          
          <div className="mt-8 bg-secondary-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-secondary-700 mb-3">Interessado em fazer negócios?</h3>
            <p className="text-neutral-800 mb-4">
              Se você é um distribuidor ou revendedor e deseja conhecer nossas ofertas, 
              entre em contato conosco ou registre-se como parceiro.
            </p>
            <Link to="/register" className="inline-block bg-secondary-500 text-white px-6 py-2 rounded hover:bg-secondary-600 transition-colors">
              Registrar como Parceiro
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-primary-700 mb-6">Contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start mb-4">
                <FaMapMarkerAlt className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Localização</h3>
                  <p className="text-neutral-700">Lisboa, Portugal</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <FaPhoneAlt className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Telefone</h3>
                  <p className="text-neutral-700">(+351) 96 396 59 03</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <FaEnvelope className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-neutral-700">alimamedetools@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <FaClock className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Horário de Funcionamento</h3>
                  <p className="text-neutral-700">Segunda a Sexta: 9:00 às 12:30 - 14:00 às 18:30</p>
                </div>
              </div>
            </div>
            
            <div className="h-64 bg-neutral-200 rounded-lg flex items-center justify-center">
              <p className="text-neutral-500">Mapa será carregado aqui</p>
              {/* Google Maps ou outro provedor de mapas será integrado aqui */}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage; 