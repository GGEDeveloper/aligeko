import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGet2FAStatusQuery, 
  useSetup2FAMutation,
  useVerify2FAMutation,
  useDisable2FAMutation 
} from '../../store/api/authApi';

const TwoFactorSettingsPage = () => {
  const [setupStep, setSetupStep] = useState('initial'); // initial, setup, verify, complete
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // Queries e Mutations
  const { data: statusData, isLoading: isStatusLoading, refetch: refetchStatus } = useGet2FAStatusQuery();
  const [setup2FA, { isLoading: isSettingUp }] = useSetup2FAMutation();
  const [verify2FA, { isLoading: isVerifying }] = useVerify2FAMutation();
  const [disable2FA, { isLoading: isDisabling }] = useDisable2FAMutation();
  
  // Verificar o status atual do 2FA
  useEffect(() => {
    if (statusData && statusData.data) {
      const { twoFactorEnabled } = statusData.data;
      setSetupStep(twoFactorEnabled ? 'complete' : 'initial');
    }
  }, [statusData]);
  
  // Iniciar o processo de configuração
  const handleSetup = async () => {
    try {
      const result = await setup2FA().unwrap();
      setSecret(result.data.secret);
      setQrCodeUrl(result.data.qrCodeUrl);
      setBackupCodes(result.data.backupCodes);
      setSetupStep('setup');
    } catch (err) {
      setError(err.data?.error?.message || 'Erro ao configurar 2FA. Tente novamente.');
      console.error('Erro ao configurar 2FA:', err);
    }
  };
  
  // Verificar o token e ativar o 2FA
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!token || token.length !== 6) {
      setError('Por favor, insira um código de 6 dígitos válido.');
      return;
    }
    
    try {
      await verify2FA({ token }).unwrap();
      setSetupStep('complete');
      refetchStatus(); // Atualizar o status do 2FA
    } catch (err) {
      setError(err.data?.error?.message || 'Código inválido. Tente novamente.');
      console.error('Erro na verificação 2FA:', err);
    }
  };
  
  // Desativar o 2FA
  const handleDisable = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('Por favor, insira o código do seu aplicativo autenticador.');
      return;
    }
    
    if (!password) {
      setError('Por favor, insira sua senha para confirmar.');
      return;
    }
    
    try {
      await disable2FA({ token, password }).unwrap();
      setSetupStep('initial');
      setPassword('');
      setToken('');
      refetchStatus(); // Atualizar o status do 2FA
    } catch (err) {
      setError(err.data?.error?.message || 'Erro ao desativar 2FA. Verifique o código e senha.');
      console.error('Erro ao desativar 2FA:', err);
    }
  };
  
  // Copiar códigos de backup para a área de transferência
  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Códigos de backup copiados para a área de transferência!');
  };
  
  if (isStatusLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações de Autenticação de Dois Fatores</h1>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {setupStep === 'initial' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Autenticação de Dois Fatores</h2>
          <p className="mb-4 text-gray-600">
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
            Quando ativada, além da sua senha, você precisará informar um código de verificação
            gerado pelo seu aplicativo autenticador a cada login.
          </p>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={handleSetup}
              disabled={isSettingUp}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSettingUp ? 'Configurando...' : 'Ativar Autenticação de Dois Fatores'}
            </button>
          </div>
        </div>
      )}
      
      {setupStep === 'setup' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Configure seu Aplicativo Autenticador</h2>
          
          <div className="mb-6">
            <p className="mb-4 text-gray-600">
              Escaneie o código QR abaixo com seu aplicativo autenticador 
              (Google Authenticator, Microsoft Authenticator, Authy, etc.)
            </p>
            
            <div className="flex flex-col items-center mb-4">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code para Autenticação de Dois Fatores" 
                  className="mb-4 border border-gray-300 p-2 rounded"
                />
              )}
              
              <p className="text-sm text-gray-500 mb-2">Ou digite manualmente o código secreto:</p>
              <div className="bg-gray-100 px-4 py-2 rounded font-mono text-center mb-4 break-all">
                {secret}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Códigos de Backup</h3>
              <p className="mb-2 text-gray-600">
                Guarde estes códigos em um lugar seguro. Você poderá utilizá-los para acessar sua conta
                caso perca acesso ao seu aplicativo autenticador.
              </p>
              
              <div className="bg-gray-100 p-4 rounded mb-2 grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleCopyBackupCodes}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                Copiar códigos
              </button>
            </div>
            
            <form onSubmit={handleVerify} className="mt-6 border-t border-gray-200 pt-6">
              <div className="mb-4">
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificação
                </label>
                <input
                  id="token"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Digite o código de 6 dígitos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Digite o código de 6 dígitos exibido no seu aplicativo autenticador
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSetupStep('initial')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar e Ativar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {setupStep === 'complete' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3">Autenticação de Dois Fatores Ativada</h2>
          </div>
          
          <p className="mb-6 text-gray-600">
            Sua conta está protegida com autenticação de dois fatores. A partir de agora,
            você precisará fornecer um código de verificação cada vez que fizer login.
          </p>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Desativar Autenticação de Dois Fatores</h3>
            
            <form onSubmit={handleDisable}>
              <div className="mb-4">
                <label htmlFor="disableToken" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Verificação
                </label>
                <input
                  id="disableToken"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Digite o código de 6 dígitos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Sua Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha para confirmar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isDisabling}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {isDisabling ? 'Desativando...' : 'Desativar Autenticação de Dois Fatores'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
};

export default TwoFactorSettingsPage; 