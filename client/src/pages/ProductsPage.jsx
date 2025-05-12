import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApi';
import ProductsList from '../components/products/ProductsList';
import BatchAddToCart from '../components/cart/BatchAddToCart';
import { BsTools, BsLightningFill, BsGear, BsTree, BsShield } from 'react-icons/bs';
import CategoryCard from '../components/products/CategoryCard';
import Pagination from '../components/ui/Pagination';
import FiltersPanel from '../components/products/FiltersPanel';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { categories } from '../utils/categoryData';

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
  
  // Get query params for API request
  const getQueryParams = () => {
    const params = {
      page: currentPage,
      limit: pageSize,
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
  }, [currentPage, pageSize, searchQuery, selectedCategory, priceRange, sortOption]);
  
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
    return `Exibindo ${start}-${end} de ${totalProducts} produtos`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page title and search */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Nossos Produtos</h1>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar produtos..."
              defaultValue={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Exibir:</span>
            <div className="relative">
              <select 
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {productCountMessage()}
        </div>
      </div>
      
      {/* Featured Categories */}
      {!selectedCategory && currentPage === 1 && !searchQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Categorias em Destaque</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map(category => (
              <CategoryCard 
                key={category.id}
                category={category}
                onSelect={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Main content with filters and products */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="lg:w-1/4">
          <FiltersPanel 
            currentFilters={currentFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {/* Products list */}
        <div className="lg:w-3/4">
          {isLoading ? (
            <LoadingSpinner />
          ) : isError ? (
            <ErrorMessage 
              title="Erro ao carregar produtos"
              message={(error?.data?.error || error?.error || 'Erro ao carregar produtos.') + 
                (error?.data?.details ? `: ${error.data.details}` : '')} 
              action={refetch}
            />
          ) : products.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou buscar outro termo.</p>
            </div>
          ) : (
            <>
              <ProductsList products={products} />
              
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