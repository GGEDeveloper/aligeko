import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApi';
import ProductCard from '../components/products/ProductCard';
import BatchAddToCart from '../components/cart/BatchAddToCart';
import { BsTools, BsLightningFill, BsGear, BsTree, BsShield } from 'react-icons/bs';

const ProductsPage = () => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    producer: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  // Query params for API call
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...filters
  };
  
  // Fetch products data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetProductsQuery(queryParams);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters when form is submitted
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    refetch();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      producer: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Category data
  const categories = [
    { 
      id: 'ferramentas-manuais', 
      name: 'Ferramentas Manuais', 
      icon: <BsTools size={32} />, 
      description: 'Chaves, martelos, alicates e mais'
    },
    { 
      id: 'ferramentas-electricas', 
      name: 'Ferramentas Elétricas', 
      icon: <BsLightningFill size={32} />, 
      description: 'Furadeiras, serras, lixadeiras e mais' 
    },
    { 
      id: 'abrasivos', 
      name: 'Abrasivos', 
      icon: <BsGear size={32} />, 
      description: 'Lixas, discos de corte, rebolos e mais' 
    },
    { 
      id: 'jardim', 
      name: 'Jardim', 
      icon: <BsTree size={32} />, 
      description: 'Ferramentas e equipamentos para jardim' 
    },
    { 
      id: 'protecao', 
      name: 'Proteção', 
      icon: <BsShield size={32} />, 
      description: 'Equipamentos de proteção individual' 
    }
  ];
  
  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId }));
    refetch();
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <div className="py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error?.data?.message || 'Ocorreu um erro desconhecido'}</span>
        </div>
      </div>
    );
  }
  
  // Destructure data
  const { products, totalItems, totalPages } = data || { products: [], totalItems: 0, totalPages: 0 };
  
  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">
            Encontre as melhores ferramentas e equipamentos para seu negócio
          </p>
        </div>
        <div className="mt-4 md:mt-0 md:self-center">
          <div className="flex space-x-3">
            <BatchAddToCart />
            <Link to="/products/add">
              <button className="btn-primary flex items-center">
                <i className="bi bi-plus mr-2"></i> Add New Product
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {categories.map(category => (
          <div 
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`cursor-pointer rounded-lg p-4 flex flex-col items-center text-center transition-all ${
              filters.category === category.id 
                ? 'bg-yellow-100 border-2 border-yellow-400' 
                : 'bg-white border border-gray-200 hover:shadow-md hover:border-yellow-300'
            }`}
          >
            <div className={`p-3 rounded-full mb-3 ${
              filters.category === category.id 
                ? 'bg-yellow-400 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {category.icon}
            </div>
            <h3 className="font-semibold mb-1">{category.name}</h3>
            <p className="text-xs text-gray-500">{category.description}</p>
          </div>
        ))}
      </div>
      
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-lg font-medium">Filtrar Produtos</h3>
          <button 
            onClick={handleResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpar Filtros
          </button>
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-search text-gray-500"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar produtos..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              
              {/* Producer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
                <select
                  name="producer"
                  value={filters.producer}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="">Todos os Fabricantes</option>
                  <option value="1">DeWalt</option>
                  <option value="2">Bosch</option>
                  <option value="3">Makita</option>
                  <option value="4">Stanley</option>
                  <option value="5">3M</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faixa de Preço</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar Por</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="name">Nome</option>
                  <option value="price">Preço</option>
                  <option value="created_at">Data de Adição</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
              
              {/* Apply Filters Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Results info */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Mostrando {products.length} de {totalItems} produtos
        </p>
        <div className="flex items-center">
          <label className="text-sm text-gray-600 mr-2">Produtos por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>
      
      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <i className="bi bi-search text-6xl text-gray-300"></i>
            <h3 className="mt-4 text-xl font-semibold">Nenhum produto encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros ou termos de pesquisa
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            {/* Page numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNumber = currentPage <= 3 
                ? i + 1 
                : currentPage + i - 2;
                
              if (pageNumber > totalPages) return null;
              if (pageNumber < 1) return null;
              
              return (
                <button 
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`mx-1 w-8 h-8 flex items-center justify-center rounded ${
                    currentPage === pageNumber
                      ? 'bg-yellow-500 text-white font-semibold'
                      : 'text-gray-700 hover:bg-yellow-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <i className="bi bi-chevron-double-right"></i>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 