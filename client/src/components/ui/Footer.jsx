import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { BsFacebook, BsInstagram, BsTwitter, BsLinkedin, BsEnvelope, BsTelephone, BsGeoAlt, BsArrowRight } from 'react-icons/bs';

/**
 * Footer component that follows the AliTools design system
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.simplified - Whether to show a simplified version of the footer
 * @param {string} props.className - Additional CSS classes
 */
const Footer = ({
  simplified = false,
  className = '',
  ...props
}) => {
  const currentYear = new Date().getFullYear();
  
  // Simplified version for checkout or specific pages
  if (simplified) {
    return (
      <footer className={`bg-white border-t border-gray-200 py-4 ${className}`} {...props}>
        <div className="container mx-auto px-6 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo 
                variant="primary" 
                size="small" 
                withLink={true}
              />
            </div>
            <div className="text-sm text-gray-500">
              &copy; {currentYear} AliTools B2B. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  // Full footer for main pages
  return (
    <footer className="bg-[#1A1A1A] text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        {/* Footer Top - Main sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Logo variant="mono" size="small" />
            </div>
            <p className="text-gray-300 mb-5 text-sm">
              Ferramentas e produtos de proteção de alta qualidade para profissionais e empresas há mais de 25 anos.
            </p>
            <div className="space-y-3">
              <div className="flex items-center">
                <BsGeoAlt className="mr-3 text-[#FFCC00] flex-shrink-0" />
                <span className="text-sm text-gray-300">Rua das Ferramentas, 123, Lisboa, Portugal</span>
              </div>
              <div className="flex items-center">
                <BsTelephone className="mr-3 text-[#FFCC00] flex-shrink-0" />
                <span className="text-sm text-gray-300">(+351) 96 396 59 03</span>
              </div>
              <div className="flex items-center">
                <BsEnvelope className="mr-3 text-[#FFCC00] flex-shrink-0" />
                <span className="text-sm text-gray-300">alimamedetools@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/categorias/ferramentas-manuais" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Ferramentas Manuais</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/categorias/ferramentas-eletricas" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Ferramentas Elétricas</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/categorias/abrasivos" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Abrasivos</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/categorias/jardim" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Jardim</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/categorias/protecao" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Proteção</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/todas-categorias" className="text-[#FFCC00] text-sm font-medium hover:pl-1 transition-all flex items-center">
                  <span>Ver todas categorias</span>
                  <BsArrowRight className="ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Sobre Nós</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/contactos" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Contactos</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/termos-condicoes" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Termos e Condições</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>Política de Privacidade</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/perguntas-frequentes" className="text-gray-300 hover:text-[#FFCC00] text-sm hover:pl-1 transition-all flex items-center group">
                  <span>FAQ</span>
                  <BsArrowRight className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">Newsletter</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Subscreva a nossa newsletter para receber as últimas novidades e ofertas especiais.
            </p>
            <form className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="px-4 py-2 w-full rounded-l-md border-0 text-sm focus:outline-none focus:ring-0 text-gray-800"
                  aria-label="Email para newsletter"
                />
                <button
                  type="submit"
                  className="bg-[#FFCC00] hover:bg-[#E5B800] text-[#1A1A1A] font-medium px-4 rounded-r-md transition-colors text-sm"
                  aria-label="Subscrever newsletter"
                >
                  Enviar
                </button>
              </div>
            </form>
            <h4 className="text-sm font-semibold mb-3 text-white">Siga-nos</h4>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-[#FFCC00] hover:text-[#1A1A1A] transition-colors w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Facebook"
              >
                <BsFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-[#FFCC00] hover:text-[#1A1A1A] transition-colors w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Instagram"
              >
                <BsInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-[#FFCC00] hover:text-[#1A1A1A] transition-colors w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Twitter"
              >
                <BsTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-[#FFCC00] hover:text-[#1A1A1A] transition-colors w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <BsLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-6 pb-4">
          <p className="text-center text-gray-400 text-xs mb-4">Métodos de pagamento aceites</p>
          <div className="flex flex-wrap justify-center gap-6">
            <img 
              src="/assets/payment-visa.svg" 
              alt="Visa" 
              width="40"
              height="25"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/assets/payment-mastercard.svg" 
              alt="Mastercard" 
              width="40"
              height="25"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/assets/payment-paypal.svg" 
              alt="PayPal" 
              width="40"
              height="25"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/assets/payment-multibanco.svg" 
              alt="Multibanco" 
              width="40"
              height="25"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-gray-800 text-gray-500 text-xs">
          <p>© {currentYear} AliTools. Todos os direitos reservados.</p>
          <p className="mt-2">
            <span className="text-[#FFCC00] font-medium">AliTools</span> é uma marca registada de Alimamede Ferramentas e Equipamentos Lda.
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  simplified: PropTypes.bool,
  className: PropTypes.string,
};

export default Footer; 