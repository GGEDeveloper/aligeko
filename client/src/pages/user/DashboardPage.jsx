import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
  };
  
  // Ensure user is loaded
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo, {user.firstName} {user.lastName}!
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card de Perfil */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Seu Perfil</h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Nome:</span> {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Empresa:</span> {user.companyName || 'Não informada'}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Autenticação 2FA:</span> {user.twoFactorEnabled ? 'Ativada' : 'Desativada'}
              </p>
            </div>
            <div className="mt-5">
              <Link
                to="/account/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Editar Perfil
              </Link>
            </div>
          </div>
        </div>
        
        {/* Card de Segurança */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Segurança da Conta</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Autenticação de dois fatores é {user.twoFactorEnabled ? 'ativada' : 'desativada'}.
                </p>
                <div className="mt-3">
                  <Link
                    to="/account/two-factor"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    {user.twoFactorEnabled ? 'Gerenciar 2FA' : 'Ativar 2FA'}
                  </Link>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Altere sua senha regularmente para aumentar a segurança da sua conta.
                </p>
                <div className="mt-3">
                  <Link
                    to="/account/change-password"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Alterar Senha
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card de Pedidos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Seus Pedidos</h3>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Acompanhe o status dos seus pedidos recentes.
              </p>
              <div className="mt-5">
                <Link
                  to="/orders"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Ver Pedidos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10">
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
};

export default DashboardPage; 