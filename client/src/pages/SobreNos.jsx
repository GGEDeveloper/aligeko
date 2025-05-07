import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SobreNos() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/company-info')
      .then(res => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sobre Nós</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg mb-4">
          Bem-vindo à AliTools! Somos especialistas em ferramentas e produtos de proteção para o setor B2B.
        </p>
        
        <p className="mb-4">
          Nossa empresa nasceu da paixão por fornecer soluções de qualidade para profissionais e empresas. 
          Com mais de 10 anos de experiência no mercado, nos especializamos em oferecer as melhores ferramentas 
          manuais, elétricas, abrasivos, equipamentos de jardim e proteção individual.
        </p>
        
        <p className="mb-4">
          Nossa missão é proporcionar produtos de alta qualidade que aumentem a produtividade e segurança 
          dos nossos clientes, sempre com o melhor custo-benefício e atendimento personalizado.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Nossa Missão</h2>
          <p>
            Fornecer ferramentas e equipamentos de alta qualidade que aumentem a eficiência, 
            produtividade e segurança dos nossos clientes, com atendimento personalizado e 
            suporte técnico especializado.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Nossa Visão</h2>
          <p>
            Ser referência nacional no fornecimento de soluções em ferramentas e equipamentos 
            para o setor B2B, reconhecidos pela qualidade, inovação e excelência no atendimento.
          </p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Informações da Empresa</h2>
        {info ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Endereço:</span>
                  <span>{info.address}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Telefone:</span>
                  <span>{info.phone}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Email:</span>
                  <span>{info.email}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">Horário:</span>
                  <span>{info.businessHours}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Redes Sociais</h3>
              <ul className="space-y-2">
                {info.facebook && (
                  <li>
                    <a href={info.facebook} className="text-blue-600 hover:underline flex items-center">
                      <i className="bi bi-facebook mr-2"></i> Facebook
                    </a>
                  </li>
                )}
                {info.instagram && (
                  <li>
                    <a href={info.instagram} className="text-pink-600 hover:underline flex items-center">
                      <i className="bi bi-instagram mr-2"></i> Instagram
                    </a>
                  </li>
                )}
                {info.linkedin && (
                  <li>
                    <a href={info.linkedin} className="text-blue-700 hover:underline flex items-center">
                      <i className="bi bi-linkedin mr-2"></i> LinkedIn
                    </a>
                  </li>
                )}
                {info.whatsapp && (
                  <li>
                    <a href={`https://wa.me/${info.whatsapp}`} className="text-green-600 hover:underline flex items-center">
                      <i className="bi bi-whatsapp mr-2"></i> WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">Informações não disponíveis no momento.</div>
        )}
      </div>
      
      <div className="text-center">
        <a 
          href="/contato" 
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-md transition duration-200"
        >
          Entre em Contato
        </a>
      </div>
    </div>
  );
} 