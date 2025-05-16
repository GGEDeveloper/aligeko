import React, { useState, useEffect } from 'react';

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
    <form className="filters-panel bg-white shadow-sm rounded-lg p-4 mb-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="search"
        id="search"
        value={localFilters.search || ''}
        onChange={handleChange}
        placeholder="Buscar produtos..."
        style={{ minWidth: '140px', marginRight: '0.75rem' }}
        className="pl-8 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
      />
      <input
        type="number"
        name="minPrice"
        value={localFilters.minPrice || ''}
        onChange={handleChange}
        placeholder="Preço mín."
        style={{ minWidth: '90px', marginRight: '0.5rem' }}
        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      />
      <span className="text-gray-400 mx-1">-</span>
      <input
        type="number"
        name="maxPrice"
        value={localFilters.maxPrice || ''}
        onChange={handleChange}
        placeholder="Preço máx."
        style={{ minWidth: '90px', marginRight: '0.75rem' }}
        className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      />
      <select
        name="producer"
        value={localFilters.producer || ''}
        onChange={handleChange}
        style={{ minWidth: '120px', marginRight: '0.75rem' }}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      >
        <option value="">Fabricante</option>
        <option value="GEKO">GEKO</option>
        <option value="DeWalt">DeWalt</option>
        <option value="Bosch">Bosch</option>
        <option value="Makita">Makita</option>
        <option value="Stanley">Stanley</option>
        <option value="3M">3M</option>
      </select>
      <select
        name="category"
        value={localFilters.category || ''}
        onChange={handleChange}
        style={{ minWidth: '120px', marginRight: '0.75rem' }}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      >
        <option value="">Categoria</option>
        <option value="ferramentas-manuais">Ferramentas Manuais</option>
        <option value="ferramentas-electricas">Ferramentas Elétricas</option>
        <option value="abrasivos">Abrasivos</option>
        <option value="jardim">Jardim</option>
        <option value="protecao">Proteção</option>
      </select>
      <select
        name="sortBy"
        value={localFilters.sortBy || 'created_at'}
        onChange={handleChange}
        style={{ minWidth: '120px', marginRight: '0.5rem' }}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      >
        <option value="name">Nome</option>
        <option value="price">Preço</option>
        <option value="created_at">Data de Adição</option>
      </select>
      <select
        name="sortOrder"
        value={localFilters.sortOrder || 'desc'}
        onChange={handleChange}
        style={{ minWidth: '100px', marginRight: '0.75rem' }}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
      >
        <option value="asc">Crescente</option>
        <option value="desc">Decrescente</option>
      </select>
      <label className="flex items-center text-sm text-gray-700 mr-2">
        <input
          type="checkbox"
          name="inStock"
          checked={localFilters.inStock || false}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded mr-1"
        />
        Em estoque
      </label>
      <label className="flex items-center text-sm text-gray-700 mr-2">
        <input
          type="checkbox"
          name="onSale"
          checked={localFilters.onSale || false}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded mr-1"
        />
        Promoção
      </label>
      <button
        type="submit"
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        style={{ minWidth: '120px', marginLeft: 'auto' }}
      >
        Aplicar Filtros
      </button>
    </form>
  );
// Todos os elementos do formulário estão corretamente aninhados e fechados.
};

export default FiltersPanel;