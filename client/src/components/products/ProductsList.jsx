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
  Modal,
  Image
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  useGetProductsQuery,
  useDeleteProductMutation
} from '../../store/api/productApi';
import PropTypes from 'prop-types';

const ProductsList = ({ 
  products = [], 
  isLoading = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  pagination
}) => {
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
    isLoading: apiLoading, 
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
  
  // Check if all products are selected
  const allSelected = products.length > 0 && selectedItems.length === products.length;
  
  // Check if product is selected
  const isSelected = (id) => selectedItems.includes(id);
  
  // Handle select all checkbox
  const handleSelectAllChange = (e) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };
  
  // Handle individual product selection
  const handleSelectItemChange = (id, e) => {
    if (onSelectItem) {
      onSelectItem(id, e.target.checked);
    }
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    if (!pagination) return null;
    
    const { currentPage, totalPages, onPageChange } = pagination;
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      />
    );
    
    // First page
    if (currentPage > 3) {
      items.push(
        <Pagination.Item key={1} onClick={() => onPageChange(1)}>
          1
        </Pagination.Item>
      );
      if (currentPage > 4) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    // Pages around current
    for (let page = Math.max(1, currentPage - 1); page <= Math.min(totalPages, currentPage + 1); page++) {
      items.push(
        <Pagination.Item 
          key={page} 
          active={page === currentPage}
          onClick={() => page !== currentPage && onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => onPageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      />
    );
    
    return items;
  };
  
  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'warning';
      case 'out_of_stock':
        return 'danger';
      default:
        return 'info';
    }
  };
  
  // Format status text
  const formatStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'draft':
        return 'Rascunho';
      case 'out_of_stock':
        return 'Fora de Estoque';
      default:
        return status;
    }
  };
  
  // Render loading state
  if (apiLoading && !productsData) {
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
  const { products: apiProducts, totalProducts, totalPages } = productsData || { products: [], totalProducts: 0, totalPages: 0 };
  
  // Calculate pagination info
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalProducts);
  
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
          <div className={`table-responsive${isLoading ? ' opacity-50' : ''}`}>
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th width="40">
                    <Form.Check
                      type="checkbox"
                      id="selectAll"
                      checked={allSelected}
                      onChange={handleSelectAllChange}
                      disabled={products.length === 0}
                    />
                  </th>
                  <th width="80">Imagem</th>
                  <th>Produto</th>
                  <th>Código</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th width="150">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className={isSelected(product.id) ? 'table-primary' : ''}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        id={`select-${product.id}`}
                        checked={isSelected(product.id)}
                        onChange={(e) => handleSelectItemChange(product.id, e)}
                      />
                    </td>
                    <td>
                      {product.thumbnail_url ? (
                        <Image 
                          src={product.thumbnail_url} 
                          alt={product.name}
                          width="50"
                          height="50"
                          className="object-fit-cover border rounded"
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ width: 50, height: 50 }}>
                          <i className="bi bi-image text-muted"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <Link to={`/admin/products/${product.id}`} className="fw-bold text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {product.name}
                      </Link>
                      {product.ean && <div className="small text-muted">EAN: {product.ean}</div>}
                    </td>
                    <td>
                      <span className="text-monospace">{product.code}</span>
                      {product.producer_code && (
                        <div className="small text-muted">Cód Fabricante: {product.producer_code}</div>
                      )}
                    </td>
                    <td>{product.category?.name || 'N/A'}</td>
                    <td>
                      {product.price ? (
                        <div className="fw-bold">
                          R$ {parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                      {product.price_discounted && (
                        <div className="small text-success">
                          R$ {parseFloat(product.price_discounted).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </td>
                    <td>
                      {product.stock_total !== undefined ? (
                        <Badge bg={product.stock_total > 0 ? 'success' : 'danger'} pill>
                          {product.stock_total}
                        </Badge>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(product.status)} pill>
                        {formatStatus(product.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex">
                        <Link to={`/admin/products/${product.id}`}>
                          <Button variant="outline-primary" size="sm" className="me-1">
                            <i className="bi bi-eye"></i>
                          </Button>
                        </Link>
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline-secondary" size="sm" className="me-1">
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </Link>
                        <Button variant="outline-danger" size="sm">
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {pagination && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Exibindo {products.length} de {pagination.totalItems || 0} produtos
              </div>
              <Pagination>
                {renderPaginationItems()}
              </Pagination>
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

ProductsList.propTypes = {
  products: PropTypes.array,
  isLoading: PropTypes.bool,
  selectedItems: PropTypes.array,
  onSelectItem: PropTypes.func,
  onSelectAll: PropTypes.func,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalItems: PropTypes.number,
    onPageChange: PropTypes.func.isRequired
  })
};

export default ProductsList; 