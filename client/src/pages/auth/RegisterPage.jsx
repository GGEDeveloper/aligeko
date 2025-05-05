import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../store/api/authApi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    taxId: '',
    businessPhone: '',
    businessAddress: '',
    termsAccepted: false,
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const [register, { isLoading }] = useRegisterMutation();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validação de campos básicos
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome é obrigatório';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Sobrenome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email é inválido';
    }
    
    // Validação de senha forte
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 10) {
      newErrors.password = 'Senha deve ter pelo menos 10 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Senha deve incluir letras maiúsculas, minúsculas, números e símbolos';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }
    
    // Validação de campos empresariais
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
    }
    
    if (!formData.taxId.trim()) {
      newErrors.taxId = 'CNPJ/CPF é obrigatório';
    }
    
    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = 'Telefone comercial é obrigatório';
    }
    
    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Endereço comercial é obrigatório';
    }
    
    // Aceite dos termos
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Você deve aceitar os termos de uso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Remover campos desnecessários para a API
      const { confirmPassword, termsAccepted, ...registerData } = formData;
      
      await register(registerData).unwrap();
      navigate('/register-success');
    } catch (err) {
      if (err.data?.error?.field) {
        setErrors({
          ...errors,
          [err.data.error.field]: err.data.error.message,
        });
      } else if (err.data?.error?.message) {
        setErrors({ form: err.data.error.message });
      } else {
        setErrors({ form: 'Falha no registro. Tente novamente.' });
      }
      console.error('Registro falhou:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Registre-se para uma conta B2B
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              faça login na sua conta existente
            </Link>
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.form && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Informações Pessoais */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Sobrenome
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              
              {/* Informações da Empresa */}
              <div className="sm:col-span-2 border-t border-gray-200 pt-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Informações da Empresa</h3>
                <p className="mt-1 text-sm text-gray-500">Estas informações são necessárias para verificarmos sua empresa.</p>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Nome da Empresa
                </label>
                <div className="mt-1">
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    autoComplete="organization"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                  CNPJ/CPF
                </label>
                <div className="mt-1">
                  <input
                    id="taxId"
                    name="taxId"
                    type="text"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.taxId ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.taxId}
                    onChange={handleChange}
                  />
                  {errors.taxId && (
                    <p className="mt-1 text-xs text-red-500">{errors.taxId}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                  Telefone Comercial
                </label>
                <div className="mt-1">
                  <input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.businessPhone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.businessPhone}
                    onChange={handleChange}
                  />
                  {errors.businessPhone && (
                    <p className="mt-1 text-xs text-red-500">{errors.businessPhone}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                  Endereço Comercial
                </label>
                <div className="mt-1">
                  <textarea
                    id="businessAddress"
                    name="businessAddress"
                    rows={3}
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.businessAddress ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    value={formData.businessAddress}
                    onChange={handleChange}
                  />
                  {errors.businessAddress && (
                    <p className="mt-1 text-xs text-red-500">{errors.businessAddress}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    required
                    className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded ${
                      errors.termsAccepted ? 'border-red-300' : ''
                    }`}
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="termsAccepted" className={`font-medium ${errors.termsAccepted ? 'text-red-500' : 'text-gray-700'}`}>
                    Aceito os termos de uso
                  </label>
                  <p className="text-gray-500">
                    Ao marcar esta caixa, você concorda com nossos <Link to="/terms" className="text-blue-600 hover:underline">Termos de Serviço</Link> e <Link to="/privacy" className="text-blue-600 hover:underline">Política de Privacidade</Link>.
                  </p>
                  {errors.termsAccepted && (
                    <p className="mt-1 text-xs text-red-500">{errors.termsAccepted}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading && 'opacity-70 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 