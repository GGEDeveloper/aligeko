import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../store/api/productApi';
import ProductCard from '../components/products/ProductCard';
import BatchAddToCart from '../components/cart/BatchAddToCart';

const ProductsPage = () => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error?.data?.message || 'Unknown error occurred'}</span>
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
          <h1>Products</h1>
          <p className="text-neutral-600">
            Browse and manage products in your inventory
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
      
      {/* Filters */}
      <div className="card mb-6">
        <div className="border-b border-neutral-300 px-4 py-3">
          <h3 className="mb-0">Filter Products</h3>
        </div>
        <div className="p-4">
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="bi bi-search text-neutral-500"></i>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="border border-neutral-300 rounded-md pl-10 pr-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="1">Electronics</option>
                  <option value="2">Clothing</option>
                  <option value="3">Home & Garden</option>
                  {/* Add more categories here */}
                </select>
              </div>
              
              {/* Producer Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Producer</label>
                <select
                  name="producer"
                  value={filters.producer}
                  onChange={handleFilterChange}
                  className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Producers</option>
                  <option value="1">Samsung</option>
                  <option value="2">Apple</option>
                  <option value="3">Sony</option>
                  {/* Add more producers here */}
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price Range</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Sort By</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="created_at">Date Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                </select>
              </div>
              
              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Order</label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="border border-neutral-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex mt-6">
              <button type="submit" className="btn-primary mr-2">
                Apply Filters
              </button>
              <button type="button" onClick={handleResetFilters} className="btn-outline">
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Results */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <p className="text-sm text-neutral-600 mb-2 sm:mb-0">
          Showing {products.length} of {totalItems} products
        </p>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="border border-neutral-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <i className="bi bi-search text-6xl text-neutral-300"></i>
            <h3 className="mt-4">No products found</h3>
            <p className="text-neutral-500">
              Try adjusting your filters or search terms
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
                  ? 'text-neutral-400 cursor-not-allowed' 
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              <i className="bi bi-chevron-double-left"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === 1 
                  ? 'text-neutral-400 cursor-not-allowed' 
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            
            {[...Array(totalPages).keys()].map(page => {
              const pageNumber = page + 1;
              // Only show 5 pages with current page in the middle
              if (pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)) {
                return (
                  <button 
                    key={page} 
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`mx-1 min-w-[2rem] h-8 flex items-center justify-center rounded ${
                      pageNumber === currentPage 
                        ? 'bg-primary-500 text-white' 
                        : 'text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                return <span key={page} className="mx-1">...</span>;
              }
              return null;
            })}
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === totalPages 
                  ? 'text-neutral-400 cursor-not-allowed' 
                  : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
            
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className={`mx-1 px-2 py-1 rounded ${
                currentPage === totalPages 
                  ? 'text-neutral-400 cursor-not-allowed' 
                  : 'text-primary-700 hover:bg-primary-50'
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