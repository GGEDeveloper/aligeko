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
  const [twoFactorData, setTwoFactorData] = useState({
    token: '',
    userId: '',
    useBackupCode: false,
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const redirectAfterLogin = useRedirectAfterLogin();
  
  const [login, { isLoading }] = useLoginMutation();
  const [validate2FA, { isLoading: isValidating }] = useValidate2FAMutation();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleTwoFactorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTwoFactorData({
      ...twoFactorData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
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
  
  const validateTwoFactorForm = () => {
    const newErrors = {};
    
    if (!twoFactorData.token) {
      newErrors.token = 'Código é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!showTwoFactor) {
      // Primeira etapa - login normal
      if (!validateForm()) return;
      
      try {
        const result = await login(formData).unwrap();
        
        if (result.data.requireTwoFactor) {
          // Usuário tem 2FA ativado
          setTwoFactorData({
            ...twoFactorData,
            userId: result.data.userId,
          });
          setShowTwoFactor(true);
        } else {
          // Login normal concluído
          dispatch(setCredentials({
            user: result.data.user,
            token: result.data.accessToken,
          }));
          // Usar o hook de redirecionamento
          redirectAfterLogin();
        }
      } catch (err) {
        if (err.data?.error?.message) {
          setErrors({ form: err.data.error.message });
        } else {
          setErrors({ form: 'Falha no login. Tente novamente.' });
        }
        console.error('Login falhou:', err);
      }
    } else {
      // Segunda etapa - validação 2FA
      if (!validateTwoFactorForm()) return;
      
      try {
        const result = await validate2FA(twoFactorData).unwrap();
        
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.accessToken,
        }));
        // Usar o hook de redirecionamento
        redirectAfterLogin();
      } catch (err) {
        if (err.data?.error?.message) {
          setErrors({ token: err.data.error.message });
        } else {
          setErrors({ token: 'Código inválido. Tente novamente.' });
        }
        console.error('Validação 2FA falhou:', err);
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showTwoFactor ? 'Verificação em Duas Etapas' : 'Entre na sua conta'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showTwoFactor 
              ? 'Digite o código do seu aplicativo autenticador' 
              : 'Ou '}
            {!showTwoFactor && (
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                registre-se para uma nova conta
              </Link>
            )}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.form}
            </div>
          )}
          
          {!showTwoFactor ? (
            // Formulário de login normal
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
          ) : (
            // Formulário 2FA
            <div className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Código de Verificação
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    name="token"
                    type="text"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.token ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Digite o código de 6 dígitos"
                    value={twoFactorData.token}
                    onChange={handleTwoFactorChange}
                  />
                  {errors.token && (
                    <p className="text-red-500 text-xs mt-1">{errors.token}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="useBackupCode"
                  name="useBackupCode"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={twoFactorData.useBackupCode}
                  onChange={handleTwoFactorChange}
                />
                <label htmlFor="useBackupCode" className="ml-2 block text-sm text-gray-900">
                  Usar código de backup
                </label>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isValidating}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (isLoading || isValidating) && 'opacity-70 cursor-not-allowed'
              }`}
            >
              {isLoading || isValidating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                showTwoFactor ? 'Verificar' : 'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 