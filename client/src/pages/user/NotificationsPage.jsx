import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBell, 
  FaShoppingBag, 
  FaTag, 
  FaPercent, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaCheck,
  FaTrashAlt,
  FaEye,
  FaBellSlash
} from 'react-icons/fa';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    productAlerts: false,
    newsletter: true
  });
  const [showPreferences, setShowPreferences] = useState(false);
  
  // For demo purposes - in a real application, these would come from API calls
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'order',
          status: 'unread',
          title: 'Pedido enviado',
          message: 'Seu pedido #ORD-2023-456 foi enviado e está a caminho.',
          date: new Date(Date.now() - 3600000).toISOString(),
          link: '/account/orders/ORD-2023-456'
        },
        {
          id: 2,
          type: 'promo',
          status: 'unread',
          title: 'Oferta exclusiva',
          message: 'Aproveite 15% de desconto em ferramentas elétricas até domingo!',
          date: new Date(Date.now() - 86400000).toISOString(),
          link: '/products/category/power-tools'
        },
        {
          id: 3,
          type: 'product',
          status: 'read',
          title: 'Produto disponível',
          message: 'O produto "Serra Circular Profissional" que você estava interessado já está disponível em estoque!',
          date: new Date(Date.now() - 172800000).toISOString(),
          link: '/products/serra-circular-prof-123'
        },
        {
          id: 4,
          type: 'order',
          status: 'read',
          title: 'Pedido entregue',
          message: 'Seu pedido #ORD-2023-440 foi entregue com sucesso. Agradecemos pela preferência!',
          date: new Date(Date.now() - 604800000).toISOString(),
          link: '/account/orders/ORD-2023-440'
        },
        {
          id: 5,
          type: 'info',
          status: 'read',
          title: 'Atualização dos Termos de Serviço',
          message: 'Nossos Termos de Serviço foram atualizados. Por favor, verifique as alterações em sua próxima visita.',
          date: new Date(Date.now() - 1209600000).toISOString(),
          link: '/terms'
        }
      ]);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
      case 'order':
        return <FaShoppingBag className="text-blue-500" />;
      case 'promo':
        return <FaPercent className="text-purple-500" />;
      case 'product':
        return <FaTag className="text-green-500" />;
      case 'info':
        return <FaInfoCircle className="text-amber-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };
  
  // Filter notifications based on selected tab
  const filteredNotifications = selectedTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === selectedTab);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, status: 'read' } 
        : notification
    ));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ 
      ...notification, 
      status: 'read' 
    })));
  };
  
  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  // Save notification preferences
  const savePreferences = (e) => {
    e.preventDefault();
    // In a real app, this would make an API call to save preferences
    setShowPreferences(false);
    // Notify user that preferences were saved
    alert('Preferências de notificação salvas com sucesso!');
  };
  
  // Handle preference toggle
  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPreferences({
      ...notificationPreferences,
      [name]: checked
    });
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas notificações e preferências.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 space-x-2 flex">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FaCheck className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <FaBellSlash className="mr-2 h-4 w-4" />
            Preferências
          </button>
        </div>
      </div>
      
      {/* Notification filters */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setSelectedTab('all')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setSelectedTab('order')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'order'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pedidos ({notifications.filter(n => n.type === 'order').length})
            </button>
            <button
              onClick={() => setSelectedTab('promo')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'promo'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Promoções ({notifications.filter(n => n.type === 'promo').length})
            </button>
            <button
              onClick={() => setSelectedTab('product')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'product'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos ({notifications.filter(n => n.type === 'product').length})
            </button>
            <button
              onClick={() => setSelectedTab('info')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'info'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações ({notifications.filter(n => n.type === 'info').length})
            </button>
          </nav>
        </div>
      </div>
      
      {/* Notification preferences */}
      {showPreferences && (
        <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Preferências de Notificação
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Escolha quais tipos de notificações deseja receber.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={savePreferences}>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="orderUpdates"
                      name="orderUpdates"
                      type="checkbox"
                      checked={notificationPreferences.orderUpdates}
                      onChange={handlePreferenceChange}
                      className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="orderUpdates" className="font-medium text-gray-700">Atualizações de Pedidos</label>
                    <p className="text-gray-500">Receba notificações sobre atualizações de status, envio e entrega dos seus pedidos.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="promotions"
                      name="promotions"
                      type="checkbox"
                      checked={notificationPreferences.promotions}
                      onChange={handlePreferenceChange}
                      className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="promotions" className="font-medium text-gray-700">Promoções e Descontos</label>
                    <p className="text-gray-500">Receba ofertas exclusivas, cupons de desconto e informações sobre promoções.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="productAlerts"
                      name="productAlerts"
                      type="checkbox"
                      checked={notificationPreferences.productAlerts}
                      onChange={handlePreferenceChange}
                      className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="productAlerts" className="font-medium text-gray-700">Alertas de Produto</label>
                    <p className="text-gray-500">Receba notificações quando produtos da sua lista de desejos voltarem ao estoque ou tiverem o preço reduzido.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      checked={notificationPreferences.newsletter}
                      onChange={handlePreferenceChange}
                      className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="newsletter" className="font-medium text-gray-700">Newsletter</label>
                    <p className="text-gray-500">Receba nossas newsletters com dicas, novidades e tendências do setor.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPreferences(false)}
                    className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Salvar Preferências
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Notifications list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <li key={notification.id} className={`${notification.status === 'unread' ? 'bg-amber-50' : ''}`}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                            {notification.status === 'unread' && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Nova
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatNotificationDate(notification.date)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <div className="mt-2 flex">
                          {notification.link && (
                            <Link 
                              to={notification.link}
                              className="text-xs font-medium text-amber-600 hover:text-amber-500 mr-4"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <FaEye className="inline mr-1" /> Ver detalhes
                            </Link>
                          )}
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-medium text-gray-600 hover:text-gray-500 mr-4"
                            >
                              <FaCheck className="inline mr-1" /> Marcar como lida
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-500"
                          >
                            <FaTrashAlt className="inline mr-1" /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-amber-100 p-6 rounded-full mb-4">
            <FaBell className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhuma notificação encontrada</h3>
          <p className="mt-1 text-gray-500">
            {selectedTab === 'all' 
              ? 'Você não possui notificações no momento.' 
              : `Você não possui notificações do tipo "${selectedTab}" no momento.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 