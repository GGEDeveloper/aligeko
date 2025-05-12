import React, { useState, useEffect, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApi';
import ProductsList from '../components/products/ProductsList';
import BatchAddToCart from '../components/cart/BatchAddToCart';
import { BsTools, BsLightningFill, BsGear, BsTree, BsShield, BsGrid, BsList } from 'react-icons/bs';
import CategoryCard from '../components/products/CategoryCard';
import Pagination from '../components/ui/Pagination';
import FiltersPanel from '../components/products/FiltersPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { categories } from '../utils/categoryData';
import ProductCard from '../components/products/ProductCard';

// Simple error tracking utility (fallback if modules aren't available)
const trackErrors = (error, context = {}, source = 'unknown') => {
  console.error(`[${source}] Error:`, error, context);
  // In a real app, this would send errors to a tracking service
};

// Simple debounce utility (fallback if modules aren't available)
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Make utilities available globally as fallback
if (typeof window !== 'undefined') {
  window.trackErrors = window.trackErrors || trackErrors;
  window.debounce = window.debounce || debounce;
}

/**
 * ProductsPage component for displaying and filtering products
 * 
 * @returns {JSX.Element}
 */
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filter params
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit')) || 12);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get('minPrice')) || 0,
    max: parseInt(searchParams.get('maxPrice')) || 1000
  });
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'name_asc');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');

  // Get query params for API request
  const getQueryParams = () => {
    const params = {
      page: currentPage,
      limit: pageSize,
      view: viewMode
    };
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (priceRange.min > 0) params.minPrice = priceRange.min;
    if (priceRange.max < 1000) params.maxPrice = priceRange.max;
    if (sortOption) {
      // Parse sort option to match server format (field and direction)
      const [field, direction] = sortOption.split('_');
      params.sort = field;
      params.order = direction?.toUpperCase() || 'ASC';
    }
    
    return params;
  };

  // Update search params when filters change
  useEffect(() => {
    const params = getQueryParams();
    setSearchParams(params, { replace: true });
  }, [currentPage, pageSize, searchQuery, selectedCategory, priceRange, sortOption, viewMode]);
  
  // Fetch products data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetProductsQuery(getQueryParams());
  
  // Products and pagination data from API response
  const products = data?.data?.items || [];
  const meta = data?.data?.meta || {};
  const totalProducts = meta.totalItems || 0;
  const totalPages = meta.totalPages || 1;
  
  console.log("API Response Meta:", meta);  // Debug the meta object
  console.log("Total Products:", totalProducts);  // Debug total products
  console.log("Current Products:", products.length);  // Debug current page products count

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle items per page change
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  // Handle search with debounce
  const handleSearchChange = (value) => {
    // Use the debounce utility (either imported or fallback)
    const debouncedSearch = window.debounce 
      ? window.debounce((v) => {
          setSearchQuery(v);
          setCurrentPage(1); // Reset to first page on new search
        }, 500)
      : (v) => {
          // Simple inline debounce if utility not available
          if (window.searchTimeout) {
            clearTimeout(window.searchTimeout);
          }
          
          window.searchTimeout = setTimeout(() => {
            setSearchQuery(v);
            setCurrentPage(1); // Reset to first page on new search
          }, 500);
        };
        
    debouncedSearch(value);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters) => {
    try {
      if (filters.category !== undefined) setSelectedCategory(filters.category);
      if (filters.priceRange) setPriceRange(filters.priceRange);
      if (filters.sort) setSortOption(filters.sort);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error('[ProductsPage-FilterChange] Error:', err);
      // Use error tracking utility (either imported or fallback)
      if (window.trackErrors) {
        window.trackErrors(err, { filters }, 'ProductsPage-FilterChange');
      }
    }
  };
  
  // Handle category click from featured categories
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };
  
  // Default filters for filter panel
  const currentFilters = {
    search: searchQuery,
    category: selectedCategory,
    priceRange: priceRange,
    sort: sortOption
  };
  
  // Products count message
  const productCountMessage = () => {
    if (isLoading) return 'Carregando produtos...';
    if (products.length === 0) return 'Nenhum produto encontrado';
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalProducts);
    
    // Ensure totalProducts is a number
    const displayTotal = typeof totalProducts === 'number' ? totalProducts : parseInt(totalProducts) || 0;
    
    return `Exibindo ${products.length > 0 ? start : 0}-${products.length > 0 ? end : 0} de ${displayTotal} produtos`;
  };

  // Toggle view mode between grid and list
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  };

  // Render product list in grid mode
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-view">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  // Render product list in list mode
  const renderListView = () => {
    return (
      <div className="flex flex-col space-y-4 list-view">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex product-card">
            <div className="w-48 relative product-image-container">
              <Link to={`/products/${product.id}`}>
                <img 
                  src={product.images && product.images.length > 0
                    ? product.images.find(img => img.is_main)?.url || product.images[0].url
                    : '/placeholder-product.png'} 
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                />
              </Link>
            </div>
            <div className="p-4 flex-grow flex flex-col">
              {product.producer && (
                <span className="text-xs text-gray-600 mb-1">
                  {product.producer.name}
                </span>
              )}
              <Link to={`/products/${product.id}`} className="text-gray-900 hover:text-yellow-600">
                <h3 className="font-medium text-lg mb-1 product-name">{product.name}</h3>
              </Link>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                {product.short_description || product.description?.substring(0, 100) || 'Descrição não disponível'}
              </p>
              
              <div className="mt-auto flex justify-between items-end">
                <div>
                  {product.retail_price && product.retail_price > product.price && (
                    <span className="text-sm text-gray-500 line-through block">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(product.retail_price)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-yellow-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'EUR' }).format(product.price || 0)}
                  </span>
                </div>
                
                <Link to={`/products/${product.id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors">
                  Ver Detalhes
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 product-page">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      
      {/* Category Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>
      
      {/* Search and filter section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full lg:w-3/4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar produtos..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Exibir:</span>
              <div className="relative">
                <select 
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none"
                >
                  <option value="6">6</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <span className="text-gray-600 ml-4 mr-2">Ordenar por:</span>
              <div className="relative">
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none"
                >
                  <option value="name_asc">Nome (A-Z)</option>
                  <option value="name_desc">Nome (Z-A)</option>
                  <option value="price_asc">Preço (menor-maior)</option>
                  <option value="price_desc">Preço (maior-menor)</option>
                  <option value="newest">Mais recentes</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="ml-4 flex border border-gray-300 rounded-lg overflow-hidden">
                <button 
                  className={`px-3 py-2 flex items-center view-toggle-button ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Visualização em Grade"
                >
                  <BsGrid className="h-4 w-4" />
                </button>
                <button 
                  className={`px-3 py-2 flex items-center view-toggle-button ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Visualização em Lista"
                >
                  <BsList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Products count display */}
          <div className="text-sm text-gray-600 mb-4">
            {productCountMessage()}
        </div>
        
        {/* Products display */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : isError ? (
            <ErrorMessage 
              title="Erro ao carregar produtos"
              message={(error?.data?.error || error?.error || 'Erro ao carregar produtos.') + 
                (error?.data?.details ? `: ${error.data.details}` : '')} 
              action={refetch}
            />
          ) : products.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou buscar outro termo.</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? renderGridView() : renderListView()}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 