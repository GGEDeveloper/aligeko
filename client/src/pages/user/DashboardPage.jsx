import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { 
  FaShoppingBag, 
  FaShoppingCart, 
  FaBell, 
  FaCreditCard,
  FaMapMarkerAlt,
  FaUser,
  FaLock,
  FaExclamationCircle,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, completed: 0 });
  
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
  
  // For demo purposes - in a real application, these would come from API calls
  useEffect(() => {
    // Simulated notification data
    setNotifications([
      { 
        id: 1, 
        type: 'info', 
        message: 'Bem-vindo à sua área de cliente. Veja suas informações aqui.', 
        date: new Date(Date.now() - 3600000).toISOString() 
      },
      { 
        id: 2, 
        type: 'success', 
        message: 'Seu último pedido (#ORD-2023-456) foi entregue.', 
        date: new Date(Date.now() - 86400000).toISOString() 
      },
      { 
        id: 3, 
        type: 'warning', 
        message: 'Há itens no seu carrinho aguardando checkout.', 
        date: new Date(Date.now() - 172800000).toISOString() 
      }
    ]);

    // Simulated order stats
    setOrderStats({
      total: 5,
      pending: 1,
      completed: 4
    });
  }, []);

  // Format date for notifications
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora';
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {user?.firstName || 'Cliente'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Bem-vindo à sua área de cliente. Aqui você pode gerenciar seus pedidos, perfil, endereços e muito mais.
        </p>
      </div>

      {/* Stats/Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <FaShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-800">{orderStats.total}</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm text-gray-500">
            <div>
              <span className="text-green-500 font-medium">{orderStats.completed}</span> Concluídos
            </div>
            <div>
              <span className="text-amber-500 font-medium">{orderStats.pending}</span> Pendentes
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Carrinhos Salvos</p>
              <p className="text-2xl font-bold text-gray-800">2</p>
            </div>
          </div>
          <div className="mt-3">
            <Link 
              to="/account/saved-carts" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Ver detalhes
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaBell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Notificações</p>
              <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
            </div>
          </div>
          <div className="mt-3">
            <Link 
              to="/account/notifications" 
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Ver todas
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/account/profile" 
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center text-center hover:bg-gray-50 transition"
          >
            <div className="p-3 rounded-full bg-green-100 text-green-600 mb-2">
              <FaUser className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Editar Perfil</span>
          </Link>
          
          <Link 
            to="/account/orders" 
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center text-center hover:bg-gray-50 transition"
          >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-2">
              <FaShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Ver Pedidos</span>
          </Link>
          
          <Link 
            to="/account/addresses" 
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center text-center hover:bg-gray-50 transition"
          >
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mb-2">
              <FaMapMarkerAlt className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Gerenciar Endereços</span>
          </Link>
          
          <Link 
            to="/account/security" 
            className="bg-white p-4 rounded-lg shadow flex flex-col items-center text-center hover:bg-gray-50 transition"
          >
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-2">
              <FaLock className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Segurança</span>
          </Link>
        </div>
      </div>

      {/* Recent Notifications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Notificações Recentes</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="p-4 flex items-start">
                <div className="mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatNotificationDate(notification.date)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação encontrada.
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center">
              <Link 
                to="/account/notifications" 
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                Ver todas as notificações
              </Link>
            </div>
          )}
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