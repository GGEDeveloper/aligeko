import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaFileInvoiceDollar, 
  FaEye, 
  FaExclamationCircle,
  FaShoppingBag
} from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // For demo purposes - in a real application, these would come from API calls
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setOrders([
        {
          id: 'ORD-2023-456',
          date: '2023-08-15',
          total: 1245.99,
          status: 'delivered',
          items: 5,
          paymentMethod: 'Cartão de Crédito',
          trackingCode: 'BR9382742891BR'
        },
        {
          id: 'ORD-2023-440',
          date: '2023-08-01',
          total: 678.50,
          status: 'delivered',
          items: 3,
          paymentMethod: 'Boleto',
          trackingCode: 'BR9382312341BR'
        },
        {
          id: 'ORD-2023-432',
          date: '2023-07-22',
          total: 1899.90,
          status: 'delivered',
          items: 2,
          paymentMethod: 'Cartão de Crédito',
          trackingCode: 'BR9123742891BR'
        },
        {
          id: 'ORD-2023-419',
          date: '2023-07-10',
          total: 459.80,
          status: 'delivered',
          items: 4,
          paymentMethod: 'PIX',
          trackingCode: 'BR9334562891BR'
        },
        {
          id: 'ORD-2023-527',
          date: '2023-09-01',
          total: 2350.75,
          status: 'processing',
          items: 8,
          paymentMethod: 'Cartão de Crédito',
          trackingCode: null
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'processing':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Em Processamento
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Enviado
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Entregue
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  // Filter orders based on status and search query
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
        <p className="text-gray-600 mt-1">
          Visualize e acompanhe seus pedidos recentes.
        </p>
      </div>
      
      {/* Filters and search */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'all' 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'processing' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Em Processamento
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filter === 'delivered' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Entregues
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
            placeholder="Buscar pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Orders list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-1">
                          <FaShoppingBag className="h-6 w-6 text-amber-500" />
                        </div>
                        <p className="text-sm font-medium text-amber-600 truncate">
                          {order.id}
                        </p>
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          {order.items} {order.items === 1 ? 'item' : 'itens'}
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex space-x-2 text-sm text-gray-500">
                        {order.status === 'delivered' && (
                          <Link 
                            to={`/account/orders/${order.id}/invoice`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-amber-300 focus:ring focus:ring-amber-300 focus:ring-opacity-50"
                          >
                            <FaFileInvoiceDollar className="mr-1.5 h-4 w-4 text-gray-500" />
                            Nota Fiscal
                          </Link>
                        )}
                        <Link 
                          to={`/account/orders/${order.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:border-amber-700 focus:ring focus:ring-amber-300 focus:ring-opacity-50"
                        >
                          <FaEye className="mr-1.5 h-4 w-4 text-white" />
                          Detalhes
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Realizado em {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Pagamento via {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm font-medium sm:mt-0">
                        <p className="text-gray-900">
                          Total: {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                    
                    {order.trackingCode && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Código de rastreio:</span> {order.trackingCode}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <FaExclamationCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
          <p className="mt-1 text-gray-500">
            {filter !== 'all' 
              ? `Você não possui pedidos com o status "${filter}".`
              : searchQuery
                ? `Nenhum pedido encontrado para "${searchQuery}".`
                : 'Você ainda não realizou nenhum pedido.'}
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Explorar Produtos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 