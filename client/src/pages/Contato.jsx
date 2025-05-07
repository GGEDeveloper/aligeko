import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Contato() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('/api/company-info')
      .then(res => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!form.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the form data to your API
      // For now, we'll simulate a successful submission
      setSent(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contato</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
            
            {info ? (
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <i className="bi bi-geo-alt text-yellow-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Endereço</h3>
                    <p className="text-gray-600">{info.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <i className="bi bi-telephone text-yellow-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Telefone</h3>
                    <p className="text-gray-600">
                      <a href={`tel:${info.phone}`} className="hover:text-yellow-600">{info.phone}</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <i className="bi bi-envelope text-yellow-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">
                      <a href={`mailto:${info.email}`} className="hover:text-yellow-600">{info.email}</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <i className="bi bi-clock text-yellow-600"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Horário de Funcionamento</h3>
                    <p className="text-gray-600">{info.businessHours}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">Informações não disponíveis no momento.</div>
            )}
          </div>
          
          {/* Social Media */}
          {info && (info.facebook || info.instagram || info.linkedin || info.whatsapp) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Redes Sociais</h2>
              
              <div className="flex flex-wrap gap-4">
                {info.facebook && (
                  <a 
                    href={info.facebook} 
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-200"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-facebook text-lg"></i>
                  </a>
                )}
                
                {info.instagram && (
                  <a 
                    href={info.instagram} 
                    className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition duration-200"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-instagram text-lg"></i>
                  </a>
                )}
                
                {info.linkedin && (
                  <a 
                    href={info.linkedin} 
                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition duration-200"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-linkedin text-lg"></i>
                  </a>
                )}
                
                {info.whatsapp && (
                  <a 
                    href={`https://wa.me/${info.whatsapp}`} 
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition duration-200"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-whatsapp text-lg"></i>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Envie uma Mensagem</h2>
          
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
              <i className="bi bi-check-circle text-green-600 text-3xl mb-2"></i>
              <h3 className="text-lg font-medium text-green-600 mb-2">Mensagem Enviada!</h3>
              <p className="text-green-700 mb-4">
                Muito obrigado pelo seu contato. Nossa equipe responderá o mais breve possível.
              </p>
              <button 
                onClick={() => {
                  setForm({ nome: '', email: '', mensagem: '' });
                  setSent(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-200"
              >
                Enviar Nova Mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className={`border ${errors.nome ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500`}
                  placeholder="Seu nome completo"
                />
                {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500`}
                  placeholder="seu.email@exemplo.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  value={form.mensagem}
                  onChange={handleChange}
                  rows="5"
                  className={`border ${errors.mensagem ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500`}
                  placeholder="Digite sua mensagem aqui..."
                ></textarea>
                {errors.mensagem && <p className="mt-1 text-sm text-red-600">{errors.mensagem}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 