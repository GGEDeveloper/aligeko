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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              registre-se para uma nova conta
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}
          
          {/* Formulário de login normal (2FA disabled for MVP) */}
          <>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Senha</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>
            </>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 