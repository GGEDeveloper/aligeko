import React, { useState } from 'react';
import { 
  Container, 
  Table, 
  Button, 
  Spinner, 
  Alert, 
  Pagination, 
  Form, 
  Row, 
  Col, 
  Card,
  Badge,
  Modal
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  useGetProductsQuery,
  useDeleteProductMutation
} from '../../store/api/productApi';

const ProductsList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [producer, setProducer] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // RTK Query hooks
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetProductsQuery({ 
    page, 
    limit, 
    search, 
    category, 
    producer,
    sortBy,
    sortOrder
  });
  
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  
  // Handle pagination change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  // Handle search submissions
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refetch();
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Handle product deletion
  const handleDeleteClick = (product) => {
    setConfirmDelete(product);
  };
  
  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteProduct(confirmDelete.id).unwrap();
        setConfirmDelete(null);
        refetch();
      } catch (err) {
        console.error('Failed to delete the product:', err);
      }
    }
  };
  
  // Render loading state
  if (isLoading && !productsData) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Erro ao carregar produtos: {error?.data?.message || 'Erro desconhecido'}
        </Alert>
      </Container>
    );
  }
  
  // Destructure data
  const { products, totalProducts, totalPages } = productsData || { products: [], totalProducts: 0, totalPages: 0 };
  
  // Calculate pagination info
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalProducts);
  
  // Render pagination controls
  const renderPagination = () => {
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );
    
    // Page items
    for (let num = 1; num <= totalPages; num++) {
      items.push(
        <Pagination.Item
          key={num}
          active={num === page}
          onClick={() => handlePageChange(num)}
        >
          {num}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };
  
  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Gerenciar Produtos</h4>
          <Link to="/admin/products/new">
            <Button variant="light">
              <i className="bi bi-plus-circle me-2"></i>
              Novo Produto
            </Button>
          </Link>
        </Card.Header>
        <Card.Body>
          {/* Search and filter controls */}
          <Form onSubmit={handleSearchSubmit} className="mb-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por nome ou código do produto"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Todas Categorias</option>
                    {/* Adicionar categorias dinâmicas */}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Select
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                  >
                    <option value="">Todos Produtores</option>
                    {/* Adicionar produtores dinâmicos */}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary" className="w-100">
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
          
          {/* Products count summary */}
          <div className="mb-3 text-muted">
            Mostrando {startItem}-{endItem} de {totalProducts} produtos
          </div>
          
          {/* Products table */}
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSortChange('code')}
                  >
                    Código
                    {sortBy === 'code' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSortChange('name')}
                  >
                    Nome
                    {sortBy === 'name' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th>Categoria</th>
                  <th>Produtor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.code}</td>
                      <td>{product.name}</td>
                      <td>
                        {product.category?.name || (
                          <Badge bg="secondary">Sem categoria</Badge>
                        )}
                      </td>
                      <td>
                        {product.producer?.name || (
                          <Badge bg="secondary">Sem produtor</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/admin/products/${product.id}`}>
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-eye"></i>
                            </Button>
                          </Link>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline-secondary" size="sm">
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </Link>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              {renderPagination()}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Delete confirmation modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmDelete && (
            <p>
              Tem certeza que deseja excluir o produto <strong>{confirmDelete.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductsList; 