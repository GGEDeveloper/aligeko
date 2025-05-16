import React from 'react';
import HeroGeometric from '../components/ui/HeroGeometric';

export default function SobreNos() {
  return (
    <>      <HeroGeometric
        badge="Sobre a AliTools"
        title1="Ferramentas e Proteção"
        title2="para Profissionais B2B"
        description="Somos especialistas em soluções para empresas. Há mais de 10 anos, conectando produtividade, qualidade e segurança."
        buttonText="Fale Conosco"
        buttonLink="/contato"
        secondaryText="Ver Produtos"
        secondaryLink="/products"
        darkMode={false}
      />
      <section className="container mx-auto px-4 pt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 text-yellow-600">Nossa Missão</h2>
            <p className="text-lg text-gray-700">
              Fornecer ferramentas e equipamentos de alta qualidade que aumentem a produtividade, segurança e eficiência dos nossos clientes, com atendimento personalizado e suporte especializado.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl shadow-xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4 text-yellow-700">Nossa Visão</h2>
            <p className="text-lg text-gray-700">
              Ser referência nacional em soluções para o setor B2B, reconhecidos pela inovação, qualidade e excelência no atendimento.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">Nossa História</h2>
          <p className="text-lg text-gray-700 mb-2">
            Nascemos da paixão por servir empresas e profissionais. Com uma década de experiência, evoluímos para ser o parceiro estratégico de negócios em todo o país.
          </p>
          <p className="text-lg text-gray-700">
            Oferecemos as melhores marcas em ferramentas manuais, elétricas, abrasivos, jardinagem e EPI, sempre com foco em confiança, agilidade e resultado.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="bg-yellow-500/10 border border-yellow-300 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-2 text-yellow-700">Endereço</h3>
            <p className="text-gray-700">Rua Exemplo, 123<br/>Lisboa, Portugal<br/>1000-100</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-300 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-2 text-yellow-700">Contato</h3>
            <ul className="text-gray-700 space-y-1">
              <li><span className="font-medium">Telefone:</span> (+351) 96 396 59 03</li>
              <li><span className="font-medium">Email:</span> alimamedetools@gmail.com</li>
              <li><span className="font-medium">Horário:</span> Seg-Sex: 9h-18h</li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <a href="/contato" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-200 text-lg">Entre em Contato</a>
        </div>
      </section>
    
    </>
  );
}