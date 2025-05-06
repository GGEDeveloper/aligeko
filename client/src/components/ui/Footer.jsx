import React from 'react';
import PropTypes from 'prop-types';
import Logo from './Logo';

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
      <footer className={`bg-white border-t border-neutral-200 py-4 ${className}`} {...props}>
        <div className="container mx-auto px-6 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 p-2">
              <Logo 
                variant="primary" 
                size="medium" 
                withLink={true}
                className="m-1"
              />
            </div>
            <div className="text-sm text-neutral-500">
              &copy; {currentYear} AliTools B2B. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  // Full footer for main pages
  return (
    <footer className={`bg-primary text-white ${className}`} {...props}>
      <div className="container mx-auto px-6 sm:px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="col-span-1">
            <div className="mb-6 p-3">
              <Logo 
                variant="mono" 
                size="large" 
                withLink={true}
                className="m-1"
              />
            </div>
            <p className="text-neutral-300 mb-4">
              Sua plataforma completa para compras B2B de ferramentas profissionais de alta qualidade.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-neutral-300 hover:text-brand transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" className="text-neutral-300 hover:text-brand transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465.668.25 1.235.585 1.8 1.15.565.565.9 1.132 1.15 1.8.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.15 1.8c-.565.565-1.132.9-1.8 1.15-.636.247-1.363.416-2.427.465-1.02.047-1.374.06-3.808.06-2.43 0-2.784-.013-3.808-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.8-1.15 4.902 4.902 0 01-1.15-1.8c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427.25-.668.585-1.235 1.15-1.8a4.902 4.902 0 011.8-1.15c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.9 2 12.315 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" className="text-neutral-300 hover:text-brand transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-neutral-300 hover:text-brand transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Products */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Produtos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products/handtools" className="text-neutral-300 hover:text-brand transition-colors">Ferramentas Manuais</a>
              </li>
              <li>
                <a href="/products/electrical" className="text-neutral-300 hover:text-brand transition-colors">Ferramentas Elétricas</a>
              </li>
              <li>
                <a href="/products/abrasives" className="text-neutral-300 hover:text-brand transition-colors">Abrasivos</a>
              </li>
              <li>
                <a href="/products/protection" className="text-neutral-300 hover:text-brand transition-colors">Equipamentos de Proteção</a>
              </li>
              <li>
                <a href="/products/construction" className="text-neutral-300 hover:text-brand transition-colors">Materiais de Construção</a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-neutral-300 hover:text-brand transition-colors">Sobre Nós</a>
              </li>
              <li>
                <a href="/careers" className="text-neutral-300 hover:text-brand transition-colors">Carreiras</a>
              </li>
              <li>
                <a href="/blog" className="text-neutral-300 hover:text-brand transition-colors">Blog</a>
              </li>
              <li>
                <a href="/contact" className="text-neutral-300 hover:text-brand transition-colors">Contato</a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-neutral-300 hover:text-brand transition-colors">Central de Ajuda</a>
              </li>
              <li>
                <a href="/terms" className="text-neutral-300 hover:text-brand transition-colors">Termos de Serviço</a>
              </li>
              <li>
                <a href="/privacy" className="text-neutral-300 hover:text-brand transition-colors">Política de Privacidade</a>
              </li>
              <li>
                <a href="/shipping" className="text-neutral-300 hover:text-brand transition-colors">Frete e Envio</a>
              </li>
              <li>
                <a href="/returns" className="text-neutral-300 hover:text-brand transition-colors">Devoluções</a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-neutral-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-neutral-400 mb-4 md:mb-0">
              &copy; {currentYear} AliTools B2B. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4">
              <a href="/terms" className="text-xs text-neutral-400 hover:text-brand transition-colors">Termos</a>
              <a href="/privacy" className="text-xs text-neutral-400 hover:text-brand transition-colors">Privacidade</a>
              <a href="/cookies" className="text-xs text-neutral-400 hover:text-brand transition-colors">Cookies</a>
            </div>
          </div>
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