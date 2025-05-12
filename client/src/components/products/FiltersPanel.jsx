import React, { useState, useEffect } from 'react';
import { Accordion } from 'react-bootstrap';

/**
 * Componente aprimorado para filtragem de produtos
 * 
 * @param {Object} props
 * @param {Object} props.currentFilters - Valores atuais dos filtros
 * @param {Function} props.onFilterChange - Callback quando os filtros são alterados
 * @returns {JSX.Element}
 */
const FiltersPanel = ({ currentFilters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [expanded, setExpanded] = useState({
    search: true,
    price: true,
    producer: true,
    stock: false,
    category: false,
    sort: true
  });

  // Atualiza os filtros locais quando os filtros atuais mudam
  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      producer: '',
      inStock: false,
      onSale: false,
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      limit: currentFilters.limit || 12
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const toggleSection = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-medium">Filtrar Produtos</h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
          type="button"
        >
          Limpar Filtros
        </button>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Seções de filtro em cartões independentes */}
            {/* Seção de pesquisa */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Pesquisar
              </div>
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar produtos..."
                    name="search"
                    value={localFilters.search || ''}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Seção de preço */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Faixa de Preço
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    name="minPrice"
                    value={localFilters.minPrice || ''}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    name="maxPrice"
                    value={localFilters.maxPrice || ''}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Seção de fabricante */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Fabricante
              </div>
              <div className="p-4">
                <select
                  name="producer"
                  value={localFilters.producer || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Todos os Fabricantes</option>
                  <option value="GEKO">GEKO</option>
                  <option value="DeWalt">DeWalt</option>
                  <option value="Bosch">Bosch</option>
                  <option value="Makita">Makita</option>
                  <option value="Stanley">Stanley</option>
                  <option value="3M">3M</option>
                </select>
              </div>
            </div>

            {/* Seção de disponibilidade */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Disponibilidade
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      name="inStock"
                      checked={localFilters.inStock || false}
                      onChange={handleCheckboxChange}
                      className="h-3 w-3 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                      Em estoque
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="onSale"
                      name="onSale"
                      checked={localFilters.onSale || false}
                      onChange={handleCheckboxChange}
                      className="h-3 w-3 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                    />
                    <label htmlFor="onSale" className="ml-2 block text-sm text-gray-700">
                      Promoção
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção de categorias */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Categorias
              </div>
              <div className="p-4">
                <select
                  name="category"
                  value={localFilters.category || ''}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Todas as Categorias</option>
                  <option value="ferramentas-manuais">Ferramentas Manuais</option>
                  <option value="ferramentas-electricas">Ferramentas Elétricas</option>
                  <option value="abrasivos">Abrasivos</option>
                  <option value="jardim">Jardim</option>
                  <option value="protecao">Proteção</option>
                </select>
              </div>
            </div>

            {/* Seção de ordenação */}
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium">
                Ordenação
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar Por</label>
                    <select
                      name="sortBy"
                      value={localFilters.sortBy || 'created_at'}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="name">Nome</option>
                      <option value="price">Preço</option>
                      <option value="created_at">Data de Adição</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                    <select
                      name="sortOrder"
                      value={localFilters.sortOrder || 'desc'}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="asc">Crescente</option>
                      <option value="desc">Decrescente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Apply Filters Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 w-full"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FiltersPanel; 