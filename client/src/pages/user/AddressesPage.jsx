import React, { useState, useEffect } from 'react';
import { FaHome, FaBuilding, FaPlus, FaPencilAlt, FaTrashAlt, FaCheck } from 'react-icons/fa';

const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
    type: 'residential'
  });
  
  // For demo purposes - in a real application, these would come from API calls
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setAddresses([
        {
          id: 1,
          name: 'Casa',
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Jardim Europa',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01449-001',
          isDefault: true,
          type: 'residential'
        },
        {
          id: 2,
          name: 'Escritório',
          street: 'Avenida Paulista',
          number: '1000',
          complement: 'Sala 1010',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01310-100',
          isDefault: false,
          type: 'commercial'
        }
      ]);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const openAddressModal = (address = null) => {
    if (address) {
      setCurrentAddress(address);
      setFormData({ ...address });
    } else {
      setCurrentAddress(null);
      setFormData({
        id: null,
        name: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        isDefault: false,
        type: 'residential'
      });
    }
    setIsModalOpen(true);
  };
  
  const closeAddressModal = () => {
    setIsModalOpen(false);
    setCurrentAddress(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If the address is set as default, update other addresses
    let updatedAddresses = [...addresses];
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }
    
    // If editing an existing address
    if (currentAddress) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === currentAddress.id ? formData : addr
      );
    } else {
      // If adding a new address
      const newAddress = {
        ...formData,
        id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1
      };
      updatedAddresses.push(newAddress);
    }
    
    setAddresses(updatedAddresses);
    closeAddressModal();
  };
  
  const handleDeleteAddress = (id) => {
    // Check if it's the default address
    const addressToDelete = addresses.find(addr => addr.id === id);
    if (addressToDelete && addressToDelete.isDefault) {
      alert('Não é possível excluir o endereço padrão.');
      return;
    }
    
    // Remove the address
    setAddresses(addresses.filter(addr => addr.id !== id));
  };
  
  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };
  
  const getAddressIcon = (type) => {
    return type === 'residential' ? 
      <FaHome className="h-5 w-5 text-amber-500" /> : 
      <FaBuilding className="h-5 w-5 text-amber-500" />;
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Endereços</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus endereços de entrega.
          </p>
        </div>
        <button
          onClick={() => openAddressModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          <FaPlus className="mr-2" /> Novo Endereço
        </button>
      </div>
      
      {/* Addresses list */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className={`bg-white shadow rounded-lg p-5 relative ${address.isDefault ? 'border-2 border-amber-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getAddressIcon(address.type)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {address.name}
                      {address.isDefault && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                          Padrão
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {address.type === 'residential' ? 'Residencial' : 'Comercial'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(address.id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      title="Definir como padrão"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => openAddressModal(address)}
                    className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    title="Editar"
                  >
                    <FaPencilAlt />
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Excluir"
                    >
                      <FaTrashAlt className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>{address.street}, {address.number}{address.complement ? `, ${address.complement}` : ''}</p>
                <p>{address.neighborhood}</p>
                <p>{address.city} - {address.state}</p>
                <p>CEP: {address.postalCode}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="bg-amber-100 p-6 rounded-full mb-4">
            <FaHome className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum endereço cadastrado</h3>
          <p className="mt-1 text-gray-500">
            Adicione seu primeiro endereço para agilizar suas compras.
          </p>
          <div className="mt-6">
            <button
              onClick={() => openAddressModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <FaPlus className="mr-2" /> Adicionar Endereço
            </button>
          </div>
        </div>
      )}
      
      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {currentAddress ? 'Editar Endereço' : 'Novo Endereço'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome do Endereço
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Casa, Trabalho"
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Endereço
                      </label>
                      <div className="mt-1 flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value="residential"
                            checked={formData.type === 'residential'}
                            onChange={handleInputChange}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Residencial</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value="commercial"
                            checked={formData.type === 'commercial'}
                            onChange={handleInputChange}
                            className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Comercial</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        CEP
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                        Rua/Avenida
                      </label>
                      <input
                        type="text"
                        name="street"
                        id="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                        Número
                      </label>
                      <input
                        type="text"
                        name="number"
                        id="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="complement" className="block text-sm font-medium text-gray-700">
                        Complemento
                      </label>
                      <input
                        type="text"
                        name="complement"
                        id="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto, Sala, etc."
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">
                        Bairro
                      </label>
                      <input
                        type="text"
                        name="neighborhood"
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        Cidade
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <select
                        name="state"
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center">
                        <input
                          id="isDefault"
                          name="isDefault"
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                          Definir como endereço padrão
                        </label>
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
                    onClick={closeAddressModal}
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

export default AddressesPage; 