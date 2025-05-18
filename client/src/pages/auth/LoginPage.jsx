import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useValidate2FAMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import useRedirectAfterLogin from '../../hooks/useRedirectAfterLogin';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  // 2FA code disabled for MVP (AliGeko MVP):
  // const [twoFactorData, setTwoFactorData] = useState({
  //   token: '',
  //   userId: '',
  //   useBackupCode: false,
  // });
  // const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const redirectAfterLogin = useRedirectAfterLogin();
  
  const [login, { isLoading }] = useLoginMutation();
  // const [validate2FA, { isLoading: isValidating }] = useValidate2FAMutation();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // 2FA code disabled for MVP (AliGeko MVP)
  // const handleTwoFactorChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setTwoFactorData({
  //     ...twoFactorData,
  //     [name]: type === 'checkbox' ? checked : value,
  //   });
  // };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email é inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 2FA code disabled for MVP (AliGeko MVP)
  // const validateTwoFactorForm = () => {
  //   const newErrors = {};
  //   if (!twoFactorData.token) {
  //     newErrors.token = 'Código é obrigatório';
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 2FA code disabled for MVP (AliGeko MVP): login is now single-step only
    if (!validateForm()) return;
    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.accessToken,
      }));
      // Redireciona para o dashboard correto baseado no papel do usuário
      redirectAfterLogin(result.data.user);
    } catch (err) {
      if (err.data?.error?.message) {
        setErrors({ form: err.data.error.message });
      } else {
        setErrors({ form: 'Falha no login. Tente novamente.' });
      }
      console.error('Login falhou:', err);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Card do Formulário com Efeito de Vidro */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8">
            {/* Logo e Título */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-sm flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Bem-vindo de volta</h1>
              <p className="text-gray-500">Faça login para continuar</p>
            </div>
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                <p className="text-sm text-red-700">{errors.form}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Grupo de Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`block w-full pl-10 pr-4 py-3 bg-white/50 border-2 ${
                        errors.email ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                      } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200`}
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Grupo de Senha */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className={`block w-full pl-10 pr-4 py-3 bg-white/50 border-2 ${
                        errors.password ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                      } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Lembrar-me */}
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded transition"
                    />
                  </div>
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-600">
                    Manter-me conectado
                  </label>
                </div>
              </div>

              {/* Botão de Login */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 shadow-md ${
                    isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Entrar na minha conta
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Divisor */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500 mb-6">
                Ainda não tem uma conta?{' '}
                <Link 
                  to="/register" 
                  className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
              
              {/* Botão de Cadastro */}
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white/50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-200 hover:shadow-sm"
              >
                <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Criar conta gratuita
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 