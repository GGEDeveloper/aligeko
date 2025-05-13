import React, { useState } from 'react';
import { BsCheck2Circle, BsExclamationTriangle, BsSend } from 'react-icons/bs';
import { cn } from '../../utils/cn';

/**
 * Modern contact form with validation and animated feedback
 * @returns {JSX.Element} Contact form component
 */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      // For demonstration - in production, replace with actual API call
      const success = Math.random() > 0.1; // 90% chance of success
      
      if (success) {
        setFormStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: ''
        });
      } else {
        setFormStatus('error');
      }
    }, 1500);
  };
  
  return (
    <div 
      className="w-full max-w-xl mx-auto rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm p-1"
      id="contact-form"
    >
      <div className="p-6 sm:p-8 bg-white/10 rounded-xl border border-white/10 shadow-xl">
        <h3 className="text-2xl font-bold mb-2">Entre em Contato</h3>
        <p className="text-gray-300 mb-6">Preencha o formulário e entraremos em contato em breve.</p>
        
        {formStatus === 'success' && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center">
            <BsCheck2Circle className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-green-100">Mensagem enviada com sucesso! Entraremos em contato em breve.</p>
          </div>
        )}
        
        {formStatus === 'error' && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center">
            <BsExclamationTriangle className="text-red-500 w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-red-100">Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nome*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50",
                  "transition-colors",
                  errors.name && "border-red-500 focus:ring-red-500/50 focus:border-red-500/50"
                )}
                disabled={formStatus === 'submitting'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50",
                  "transition-colors",
                  errors.email && "border-red-500 focus:ring-red-500/50 focus:border-red-500/50"
                )}
                disabled={formStatus === 'submitting'}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50",
                  "transition-colors"
                )}
                disabled={formStatus === 'submitting'}
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Empresa
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                  "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50",
                  "transition-colors"
                )}
                disabled={formStatus === 'submitting'}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Mensagem*
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={cn(
                "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
                "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50",
                "transition-colors",
                errors.message && "border-red-500 focus:ring-red-500/50 focus:border-red-500/50"
              )}
              disabled={formStatus === 'submitting'}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-400">{errors.message}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className={cn(
                "w-full py-3 px-6 flex items-center justify-center gap-2 rounded-lg text-black font-medium",
                "bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md shadow-yellow-500/20",
                "hover:from-yellow-500 hover:to-yellow-600 transition-colors duration-300",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                "transform hover:translate-y-[-2px] active:translate-y-0 transition-transform"
              )}
            >
              {formStatus === 'submitting' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <BsSend className="h-4 w-4" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm; 