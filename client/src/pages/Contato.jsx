import React from 'react';
import HeroGeometric from '../components/ui/HeroGeometric';
import ContactForm from '../components/ui/ContactForm';
import { BsGeoAlt, BsEnvelope, BsTelephone, BsClock } from 'react-icons/bs';
import { cn } from '../utils/cn';

/**
 * Modern contact page with animated geometric hero section and styled contact form
 */
const ContatoPage = () => {
  return (
    <>      {/* Hero Section with Animated Geometric Elements */}
      <HeroGeometric 
        badge="Entre em Contato"
        title1="Estamos Aqui"
        title2="Para Ajudar Seu Negócio"
        description="Na AliTools, valorizamos cada interação. Nossa equipe dedicada está pronta para responder suas perguntas e fornecer o suporte que você precisa."
        buttonText="Enviar Mensagem"
        buttonLink="#contact-form"
        secondaryText="Ver Produtos"
        secondaryLink="/products"
        darkMode={true}
      />
      
      {/* Main Content Section with Form and Contact Info */}
      <section className="pt-8 pb-16 bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form Column */}
            <div>
              <ContactForm />
            </div>
            
            {/* Contact Info Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Informações de Contato</h3>
                <p className="text-gray-300 mb-8">
                  Estamos disponíveis para atender suas dúvidas, fornecer informações sobre nossos produtos e ajudar no que for preciso.
                </p>
              </div>
              
              {/* Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-transform hover:translate-y-[-4px]">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                    <BsGeoAlt className="text-yellow-500 w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Nosso Endereço</h4>
                  <p className="text-gray-300">
                    Rua Exemplo, 123<br />
                    Lisboa, Portugal<br />
                    1000-100
                  </p>
                </div>
                
                {/* Email Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-transform hover:translate-y-[-4px]">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                    <BsEnvelope className="text-yellow-500 w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Email</h4>
                  <p className="text-gray-300">
                    <a 
                      href="mailto:alimamedetools@gmail.com"
                      className="hover:text-yellow-400 transition-colors"
                    >
                      alimamedetools@gmail.com
                    </a>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Respondemos em até 24 horas
                  </p>
                </div>
                
                {/* Phone Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-transform hover:translate-y-[-4px]">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                    <BsTelephone className="text-yellow-500 w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Telefone</h4>
                  <p className="text-gray-300">
                    <a 
                      href="tel:+351963965903"
                      className="hover:text-yellow-400 transition-colors"
                    >
                      (+351) 96 396 59 03
                    </a>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Segunda-Sexta, 9h-18h
                  </p>
                </div>
                
                {/* Hours Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 transition-transform hover:translate-y-[-4px]">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                    <BsClock className="text-yellow-500 w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Horário</h4>
                  <p className="text-gray-300">
                    Segunda-Sexta: 9h-18h<br />
                    Sábado: 10h-15h<br />
                    Domingo: Fechado
                  </p>
                </div>
              </div>
              
              {/* Map or additional info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mt-8">
                <h4 className="text-lg font-semibold mb-4">Nossa Localização</h4>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  {/* Replace with actual map component in production */}
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                    Mapa interativo será carregado aqui
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section (Optional) */}
      <section className="py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
            <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre nossos produtos e serviços.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-3">Quais formas de pagamento são aceitas?</h3>
              <p className="text-gray-300">
                Aceitamos pagamentos via cartão de crédito, transferência bancária, PayPal e faturamento para empresas. Para pedidos empresariais, oferecemos condições especiais de pagamento.
              </p>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-3">Como são feitas as entregas?</h3>
              <p className="text-gray-300">
                Trabalhamos com transportadoras parceiras para garantir entregas eficientes em todo Portugal. O prazo de entrega varia de 2 a 5 dias úteis, dependendo da região.
              </p>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-3">Os produtos têm garantia?</h3>
              <p className="text-gray-300">
                Sim, todos os nossos produtos possuem garantia de fábrica. O período de garantia varia conforme o fabricante, mas geralmente é de 12 meses para ferramentas elétricas e 6 meses para ferramentas manuais.
              </p>
            </div>
          </div>
        </div>
      </section>
    
    </>
  );
};

export default ContatoPage; 