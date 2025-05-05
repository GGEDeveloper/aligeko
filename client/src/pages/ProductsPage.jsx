import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup,
  Pagination,
  Spinner,
  Alert,
  Badge
} from 'react-bootstrap';
import { useGetProductsQuery } from '../store/api/productApi';

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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Error loading products: {error?.data?.message || 'Unknown error occurred'}
        </Alert>
      </Container>
    );
  }
  
  // Destructure data
  const { products, totalItems, totalPages } = data || { products: [], totalItems: 0, totalPages: 0 };
  
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Products</h1>
          <p className="text-muted">
            Browse and manage products in your inventory
          </p>
        </Col>
        <Col xs="auto" className="align-self-center">
          <Link to="/products/add">
            <Button variant="primary">
              <i className="bi bi-plus"></i> Add New Product
            </Button>
          </Link>
        </Col>
      </Row>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Filter Products</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row className="g-3">
              {/* Search */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search products..."
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              {/* Category Filter */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    <option value="1">Electronics</option>
                    <option value="2">Clothing</option>
                    <option value="3">Home & Garden</option>
                    {/* Add more categories here */}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Producer Filter */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Producer</Form.Label>
                  <Form.Select
                    name="producer"
                    value={filters.producer}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Producers</option>
                    <option value="1">Samsung</option>
                    <option value="2">Apple</option>
                    <option value="3">Sony</option>
                    {/* Add more producers here */}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Price Range */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col xs="auto" className="align-self-center">
                      -
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              
              {/* Sort By */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="created_at">Date Added</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Sort Order */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Order</Form.Label>
                  <Form.Select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleFilterChange}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Action Buttons */}
              <Col xs={12} className="d-flex mt-4">
                <Button variant="primary" type="submit" className="me-2">
                  Apply Filters
                </Button>
                <Button variant="outline-secondary" onClick={handleResetFilters} type="button">
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Results */}
      <Row className="mb-2">
        <Col>
          <p className="text-muted">
            Showing {products.length} of {totalItems} products
          </p>
        </Col>
        <Col xs="auto">
          <Form.Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            size="sm"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Form.Select>
        </Col>
      </Row>
      
      {/* Product Grid */}
      {products.length === 0 ? (
        <Alert variant="info">
          No products found. Try adjusting your filters.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {products.map(product => (
            <Col key={product.id}>
              <Card className="h-100 product-card">
                {product.Images && product.Images[0] ? (
                  <Card.Img 
                    variant="top" 
                    src={product.Images[0].url} 
                    alt={product.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="text-center bg-light" style={{ height: '180px', paddingTop: '75px' }}>
                    <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                  </div>
                )}
                <Card.Body>
                  <Card.Title className="text-truncate">{product.name}</Card.Title>
                  <Card.Text className="mb-1 text-truncate">
                    {product.description}
                  </Card.Text>
                  <div className="mb-2">
                    {product.Category && (
                      <Badge bg="info" className="me-1">{product.Category.name}</Badge>
                    )}
                    {product.Producer && (
                      <Badge bg="secondary">{product.Producer.name}</Badge>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-bold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </div>
                    <Link to={`/products/${product.id}`}>
                      <Button variant="outline-primary" size="sm">View</Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
            />
            
            {[...Array(totalPages).keys()].map(page => {
              const pageNumber = page + 1;
              // Only show 5 pages with current page in the middle
              if (pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)) {
                return (
                  <Pagination.Item 
                    key={page} 
                    active={pageNumber === currentPage}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Pagination.Item>
                );
              } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                return <Pagination.Ellipsis key={page} />;
              }
              return null;
            })}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default ProductsPage; 