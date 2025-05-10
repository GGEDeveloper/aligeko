import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaExclamationCircle, 
  FaTrashAlt, 
  FaEye, 
  FaCartPlus,
  FaEdit
} from 'react-icons/fa';

const SavedCartsPage = () => {
  const [savedCarts, setSavedCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [currentCartId, setCurrentCartId] = useState(null);
  const [cartName, setCartName] = useState('');
  
  // For demo purposes - in a real application, these would come from API calls
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setSavedCarts([
        {
          id: 1,
          name: 'Materiais de Construção',
          createdAt: '2023-08-10T14:30:00Z',
          items: [
            { id: 101, name: 'Martelo Tramontina', price: 45.90, quantity: 2 },
            { id: 203, name: 'Serra Elétrica 110V', price: 399.90, quantity: 1 },
            { id: 304, name: 'Conjunto de Chaves', price: 89.90, quantity: 1 }
          ],
          totalItems: 4,
          totalValue: 581.60
        },
        {
          id: 2,
          name: 'Equipamentos de Proteção',
          createdAt: '2023-07-25T10:15:00Z',
          items: [
            { id: 405, name: 'Capacete de Segurança', price: 36.50, quantity: 5 },
            { id: 506, name: 'Luvas de Proteção', price: 18.90, quantity: 10 },
            { id: 607, name: 'Óculos de Segurança', price: 25.90, quantity: 5 }
          ],
          totalItems: 20,
          totalValue: 462.50
        }
      ]);
      setIsLoading(false);
    }, 800);
    
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
  
  const openRenameModal = (cartId, cartName) => {
    setCurrentCartId(cartId);
    setCartName(cartName);
    setIsRenameModalOpen(true);
  };
  
  const closeRenameModal = () => {
    setCurrentCartId(null);
    setCartName('');
    setIsRenameModalOpen(false);
  };
  
  const handleRename = (e) => {
    e.preventDefault();
    
    if (!cartName.trim()) {
      alert('Por favor, insira um nome válido para o carrinho.');
      return;
    }
    
    // Update cart name
    setSavedCarts(savedCarts.map(cart => 
      cart.id === currentCartId ? { ...cart, name: cartName } : cart
    ));
    
    closeRenameModal();
  };
  
  const handleDeleteCart = (cartId) => {
    if (window.confirm('Tem certeza que deseja excluir este carrinho salvo?')) {
      setSavedCarts(savedCarts.filter(cart => cart.id !== cartId));
    }
  };
  
  const handleRestoreCart = (cartId) => {
    // In a real application, this would restore the cart items to the active cart
    alert(`O carrinho ${cartId} foi restaurado ao seu carrinho de compras atual.`);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrinhos Salvos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus carrinhos salvos para compras futuras.
        </p>
      </div>
      
      {/* Saved carts list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : savedCarts.length > 0 ? (
        <div className="space-y-6">
          {savedCarts.map((cart) => (
            <div key={cart.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <FaShoppingCart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{cart.name}</h3>
                    <p className="text-sm text-gray-500">
                      Criado em {formatDate(cart.createdAt)} • {cart.totalItems} items
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openRenameModal(cart.id, cart.name)}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    title="Renomear carrinho"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRestoreCart(cart.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <FaCartPlus className="mr-1.5 h-4 w-4" />
                    Restaurar
                  </button>
                  <button
                    onClick={() => handleDeleteCart(cart.id)}
                    className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    title="Excluir carrinho"
                  >
                    <FaTrashAlt className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço unitário
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cart.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(cart.totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-amber-100 p-6 rounded-full mb-4">
            <FaShoppingCart className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum carrinho salvo</h3>
          <p className="mt-1 text-gray-500">
            Você não possui carrinhos salvos. Adicione produtos ao carrinho e salve-o para compras futuras.
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
      
      {/* Rename Cart Modal */}
      {isRenameModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleRename}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaEdit className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Renomear Carrinho
                      </h3>
                      <div className="mt-4">
                        <label htmlFor="cartName" className="block text-sm font-medium text-gray-700">
                          Nome do Carrinho
                        </label>
                        <input
                          type="text"
                          name="cartName"
                          id="cartName"
                          value={cartName}
                          onChange={(e) => setCartName(e.target.value)}
                          className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Ex: Materiais para obra"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={closeRenameModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedCartsPage; 