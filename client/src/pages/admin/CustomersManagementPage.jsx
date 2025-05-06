import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Spinner,
  Alert,
  InputGroup,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layouts/AdminLayout';
import CustomersList from '../../components/customers/CustomersList';
import BatchOperations from '../../components/customers/BatchOperations';
import AdminBreadcrumbs from '../../components/layouts/AdminBreadcrumbs';
import { useGetCustomersQuery } from '../../store/api/customerApi';
import CustomersExport from '../../components/customers/CustomersExport';

const CustomersManagementPage = () => {
  // State for filtering and pagination
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });
  
  // State for selected customers (for batch operations)
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  
  // Custom breadcrumbs for this page
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Clientes', link: '/admin/customers', active: true }
  ];
  
  // Fetch customers with current filters
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetCustomersQuery(filters);
  
  // Update filter handlers
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1 // Reset to first page on new search
    });
  };
  
  const handleStatusChange = (e) => {
    setFilters({
      ...filters,
      status: e.target.value,
      page: 1 // Reset to first page on status filter change
    });
  };
  
  const handleSortChange = (field) => {
    setFilters({
      ...filters,
      sortBy: field,
      sortOrder: filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1
    });
  };
  
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };
  
  // Handle selected customers for batch operations
  const handleCustomerSelect = (customerId, isSelected) => {
    if (isSelected) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };
  
  const handleSelectAll = (isSelected) => {
    if (isSelected && data?.customers) {
      setSelectedCustomers(data.customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };
  
  // Batch operation success callback
  const handleBatchOperationSuccess = () => {
    setSelectedCustomers([]);
    refetch();
  };
  
  return (
    <AdminLayout>
      <Container fluid className="py-3">
        <AdminBreadcrumbs items={breadcrumbItems} />
        
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Gerenciamento de Clientes</h5>
            <Link to="/admin/customers/new">
              <Button variant="light" size="sm">
                <i className="bi bi-plus-circle me-1"></i>
                Novo Cliente
              </Button>
            </Link>
          </Card.Header>
          
          <Card.Body>
            {/* Filters */}
            <Row className="mb-4 g-3">
              <Col md={6} lg={4}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por nome, email ou empresa..."
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
              </Col>
              
              <Col md={6} lg={3}>
                <Form.Select
                  value={filters.status}
                  onChange={handleStatusChange}
                >
                  <option value="">Todos os Status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                  <option value="pending">Pendentes</option>
                </Form.Select>
              </Col>
              
              <Col md={6} lg={3}>
                <DropdownButton 
                  variant="outline-secondary" 
                  title={`Ordenar por: ${filters.sortBy === 'created_at' ? 'Data de Cadastro' : 
                           filters.sortBy === 'name' ? 'Nome' : 
                           filters.sortBy === 'orders_count' ? 'Número de Pedidos' : 
                           'Data de Cadastro'} (${filters.sortOrder === 'asc' ? '↑' : '↓'})`}
                  className="w-100"
                >
                  <Dropdown.Item onClick={() => handleSortChange('created_at')}>
                    Data de Cadastro {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange('name')}>
                    Nome {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleSortChange('orders_count')}>
                    Número de Pedidos {filters.sortBy === 'orders_count' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                  </Dropdown.Item>
                </DropdownButton>
              </Col>
              
              <Col md={6} lg={2}>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClearFilters}
                  className="w-100"
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Limpar Filtros
                </Button>
              </Col>
            </Row>
            
            {/* Batch Operations */}
            <Row className="mb-4">
              <Col md={8}>
                {selectedCustomers.length > 0 && (
                  <BatchOperations 
                    selectedCustomers={selectedCustomers} 
                    onSuccess={() => {
                      refetch();
                      setSelectedCustomers([]);
                    }} 
                  />
                )}
              </Col>
              <Col md={4}>
                <CustomersExport 
                  selectedCustomers={selectedCustomers}
                  filters={filters}
                />
              </Col>
            </Row>
            
            {/* Error Alert */}
            {isError && (
              <Alert variant="danger">
                Erro ao carregar clientes: {error?.data?.message || 'Erro desconhecido'}
              </Alert>
            )}
            
            {/* Customers List */}
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </Spinner>
              </div>
            ) : data?.customers && data.customers.length > 0 ? (
              <CustomersList 
                customers={data.customers}
                totalPages={data.totalPages}
                currentPage={filters.page}
                onPageChange={handlePageChange}
                onCustomerSelect={handleCustomerSelect}
                onSelectAll={handleSelectAll}
                selectedCustomers={selectedCustomers}
                sortInfo={{
                  field: filters.sortBy,
                  order: filters.sortOrder
                }}
                onSortChange={handleSortChange}
              />
            ) : (
              <Alert variant="info">
                Nenhum cliente encontrado {filters.search || filters.status ? 'com os filtros aplicados' : ''}.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default CustomersManagementPage; 