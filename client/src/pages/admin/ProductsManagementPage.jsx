import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup,
  Spinner,
  Alert,
  Accordion
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/api/productApi';
import ProductsList from '../../components/products/ProductsList';
import BatchOperations from '../../components/products/BatchOperations';
import { toast } from 'react-hot-toast';
import AdminBreadcrumbs from '../../components/layouts/AdminBreadcrumbs';

const ProductsManagementPage = () => {
  // State for filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  // State for API query params
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Custom breadcrumbs for this page
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Produtos', link: '/admin/products', active: true }
  ];
  
  // Fetch products
  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useGetProductsQuery(queryParams);
  
  // Update query params when filters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryParams(prev => ({
        ...prev,
        page: 1, // Reset to first page on filter change
        search: filters.search,
        category: filters.category,
        status: filters.status,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      }));
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [filters]);
  
  // Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortDirection: 'asc'
    });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
  };
  
  // Handle check/uncheck product
  const handleSelectItem = (id, isSelected) => {
    if (isSelected) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  // Handle select all/none
  const handleSelectAll = (isSelected) => {
    if (isSelected && productsData?.products) {
      setSelectedItems(productsData.products.map(product => product.id));
    } else {
      setSelectedItems([]);
    }
  };
  
  // Handle batch operation complete
  const handleBatchOperationComplete = (operation, count) => {
    let message = '';
    
    switch (operation) {
      case 'status_updated':
        message = `Status atualizado para ${count} produto${count !== 1 ? 's' : ''} com sucesso!`;
        break;
      case 'deleted':
        message = `${count} produto${count !== 1 ? 's' : ''} excluído${count !== 1 ? 's' : ''} com sucesso!`;
        break;
      default:
        message = 'Operação concluída com sucesso!';
    }
    
    toast.success(message);
    refetch(); // Refresh the product list
  };
  
  return (
    <Container className="py-4">
      <AdminBreadcrumbs items={breadcrumbItems} />
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gerenciamento de Produtos</h4>
          <div>
            <Link to="/admin/products/categories-attributes" className="me-2">
              <Button variant="light">
                <i className="bi bi-folder me-2"></i>
                Categorias e Atributos
              </Button>
            </Link>
            <Link to="/admin/products/new">
              <Button variant="light">
                <i className="bi bi-plus-circle me-2"></i>
                Novo Produto
              </Button>
            </Link>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Batch Operations */}
          <BatchOperations 
            selectedItems={selectedItems}
            onOperationComplete={handleBatchOperationComplete}
            onClearSelection={() => setSelectedItems([])}
          />
          
          {/* Search & Quick Filters */}
          <Row className="g-3 mb-4">
            <Col md={6} lg={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="search"
                  placeholder="Buscar por nome, código ou EAN..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </InputGroup>
            </Col>
            
            <Col md={3} lg={2}>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="draft">Rascunhos</option>
                <option value="out_of_stock">Fora de Estoque</option>
              </Form.Select>
            </Col>
            
            <Col md={3} lg={2}>
              <Form.Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="name">Nome</option>
                <option value="code">Código</option>
                <option value="price">Preço</option>
                <option value="created_at">Data de Criação</option>
                <option value="updated_at">Última Atualização</option>
              </Form.Select>
            </Col>
            
            <Col md={3} lg={2}>
              <Form.Select
                name="sortDirection"
                value={filters.sortDirection}
                onChange={handleFilterChange}
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </Form.Select>
            </Col>
            
            <Col md={3} lg={2}>
              <Button 
                variant="outline-secondary" 
                onClick={handleResetFilters}
                className="w-100"
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpar Filtros
              </Button>
            </Col>
          </Row>
          
          {/* Advanced Filters Accordion */}
          <Accordion className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Filtros Avançados</Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group controlId="category">
                      <Form.Label>Categoria</Form.Label>
                      <Form.Select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                      >
                        <option value="">Todas as Categorias</option>
                        <option value="1">Eletrônicos</option>
                        <option value="2">Vestuário</option>
                        <option value="3">Alimentos</option>
                        <option value="4">Móveis</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="minPrice">
                      <Form.Label>Preço Mínimo</Form.Label>
                      <Form.Control
                        type="number"
                        name="minPrice"
                        placeholder="R$"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="maxPrice">
                      <Form.Label>Preço Máximo</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxPrice"
                        placeholder="R$"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          
          {/* Error State */}
          {isError && (
            <Alert variant="danger">
              Erro ao carregar produtos: {error?.data?.message || 'Erro desconhecido'}
            </Alert>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          )}
          
          {/* Product List */}
          {!isLoading && productsData && (
            <ProductsList 
              products={productsData.products}
              isLoading={isFetching}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onSelectAll={handleSelectAll}
              pagination={{
                currentPage: queryParams.page,
                totalPages: productsData.totalPages || 1,
                onPageChange: handlePageChange
              }}
            />
          )}
          
          {/* Empty State */}
          {!isLoading && productsData?.products?.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-box fs-1 text-muted mb-3"></i>
              <h5>Nenhum produto encontrado</h5>
              <p className="text-muted">
                Tente ajustar seus filtros ou cadastre um novo produto.
              </p>
              <Link to="/admin/products/new">
                <Button variant="primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Adicionar Novo Produto
                </Button>
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductsManagementPage; 