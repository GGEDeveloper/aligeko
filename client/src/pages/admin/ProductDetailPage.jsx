import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Tab, 
  Nav, 
  Table, 
  Badge,
  Image,
  ListGroup,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import { 
  useGetProductQuery,
  useDeleteProductMutation,
  useGetProductVariantsQuery,
  useGetProductImagesQuery,
  useUpdateProductMutation
} from '../../store/api/productApi';
import AdminBreadcrumbs from '../../components/layouts/AdminBreadcrumbs';
import ProductImageManagement from '../../components/products/ProductImageManagement';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // RTK Query hooks
  const { 
    data: product, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetProductQuery(id);
  
  const { 
    data: variants, 
    isLoading: isLoadingVariants 
  } = useGetProductVariantsQuery(id);
  
  const { 
    data: images, 
    isLoading: isLoadingImages 
  } = useGetProductImagesQuery(id);
  
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  
  // Handle product deletion
  const handleDelete = async () => {
    try {
      await deleteProduct(id).unwrap();
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };
  
  // Custom breadcrumbs for this page
  const breadcrumbItems = [
    { text: 'Dashboard', link: '/admin' },
    { text: 'Produtos', link: '/admin/products' },
    { text: product?.name || `Produto #${id}`, link: `/admin/products/${id}`, active: true }
  ];
  
  // Loading state
  if (isLoading) {
    return (
      <Container className="py-4">
        <AdminBreadcrumbs items={breadcrumbItems} />
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Container className="py-4">
        <AdminBreadcrumbs items={breadcrumbItems} />
        <Alert variant="danger">
          Erro ao carregar produto: {error?.data?.message || 'Erro desconhecido'}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <AdminBreadcrumbs items={breadcrumbItems} />
      
      {/* Header */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Detalhes do Produto</h4>
          <div>
            <Link to={`/admin/products/${id}/edit`}>
              <Button variant="light" className="me-2">
                <i className="bi bi-pencil me-2"></i>
                Editar
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              <i className="bi bi-trash me-2"></i>
              Excluir
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2 className="mb-3">{product.name}</h2>
              <div className="mb-4">
                <Badge bg="secondary" className="me-2">Código: {product.code}</Badge>
                {product.ean && <Badge bg="info" className="me-2">EAN: {product.ean}</Badge>}
                {product.producer_code && <Badge bg="primary">Código do Fabricante: {product.producer_code}</Badge>}
              </div>
              {product.description_short && (
                <div className="mb-3">
                  <h5>Descrição Curta</h5>
                  <p>{product.description_short}</p>
                </div>
              )}
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <strong>Categoria:</strong>
                      <span>{product.category?.name || 'N/A'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <strong>Fabricante:</strong>
                      <span>{product.producer?.name || 'N/A'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <strong>Unidade:</strong>
                      <span>{product.unit?.name || 'N/A'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <strong>IVA:</strong>
                      <span>{product.vat ? `${product.vat}%` : 'N/A'}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <strong>Código no Catálogo:</strong>
                      <span>{product.code_on_card || 'N/A'}</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Detailed Tabs */}
      <Tab.Container id="product-tabs" defaultActiveKey="details">
        <Row className="mb-4">
          <Col>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="details">Detalhes</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="variants">Variantes</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="images">Imagens</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stock">Estoque</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pricing">Preços</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        <Row>
          <Col>
            <Tab.Content>
              {/* Details Tab */}
              <Tab.Pane eventKey="details">
                {product.description_long ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description_long }} />
                ) : (
                  <p className="text-muted">Descrição detalhada não disponível para este produto.</p>
                )}
                {product.description_html && (
                  <>
                    <h5 className="mt-4">Descrição HTML Adicional</h5>
                    <div dangerouslySetInnerHTML={{ __html: product.description_html }} />
                  </>
                )}
                {product.url && (
                  <div className="mt-4">
                    <h5>Link Externo</h5>
                    <a href={product.url} target="_blank" rel="noreferrer">
                      {product.url}
                    </a>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Variants Tab */}
              <Tab.Pane eventKey="variants">
                {isLoadingVariants ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Carregando variantes...</span>
                  </div>
                ) : variants && variants.length > 0 ? (
                  <Table responsive bordered hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tamanho/Cor</th>
                        <th>Peso (g)</th>
                        <th>Peso Bruto (g)</th>
                        <th>Estoque</th>
                        <th>Preço</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map(variant => (
                        <tr key={variant.id}>
                          <td>{variant.code}</td>
                          <td>{variant.attributes || 'N/A'}</td>
                          <td>{variant.weight || 'N/A'}</td>
                          <td>{variant.gross_weight || 'N/A'}</td>
                          <td>
                            {variant.stock_total !== undefined ? (
                              <Badge bg={variant.stock_total > 0 ? 'success' : 'danger'}>
                                {variant.stock_total}
                              </Badge>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {variant.price ? (
                              `R$ ${parseFloat(variant.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            ) : 'N/A'}
                          </td>
                          <td>
                            <Button size="sm" variant="outline-primary" className="me-1">
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button size="sm" variant="outline-danger">
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-3">
                    <p className="mb-3">Nenhuma variante cadastrada para este produto.</p>
                    <Button variant="primary" size="sm">
                      <i className="bi bi-plus-circle me-2"></i>
                      Adicionar Variante
                    </Button>
                  </div>
                )}
              </Tab.Pane>
              
              {/* Images Tab */}
              <Tab.Pane eventKey="images">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Imagens do Produto</h5>
                  </Card.Header>
                  <Card.Body>
                    <ProductImageManagement 
                      productId={product.id}
                      images={product.images || []}
                      onImagesUpdated={() => refetch()}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              {/* Stock Tab */}
              <Tab.Pane eventKey="stock">
                <Table responsive bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Variante</th>
                      <th>Armazém</th>
                      <th>Quantidade</th>
                      <th>Última Atualização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.stock ? (
                      product.stock.map(item => (
                        <tr key={item.id}>
                          <td>{item.variant?.code || 'N/A'}</td>
                          <td>{item.warehouse || 'Principal'}</td>
                          <td>
                            <Badge bg={item.quantity > 0 ? 'success' : 'danger'}>
                              {item.quantity}
                            </Badge>
                          </td>
                          <td>{new Date(item.updated_at).toLocaleString('pt-BR')}</td>
                          <td>
                            <Button size="sm" variant="outline-primary">
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Nenhuma informação de estoque disponível
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>
              
              {/* Pricing Tab */}
              <Tab.Pane eventKey="pricing">
                <Table responsive bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Variante</th>
                      <th>Preço Bruto</th>
                      <th>Preço Líquido</th>
                      <th>SRP Bruto</th>
                      <th>SRP Líquido</th>
                      <th>Última Atualização</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.prices ? (
                      product.prices.map(price => (
                        <tr key={price.id}>
                          <td>{price.variant?.code || 'Padrão'}</td>
                          <td>R$ {parseFloat(price.gross_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td>R$ {parseFloat(price.net_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td>
                            {price.srp_gross 
                              ? `R$ ${parseFloat(price.srp_gross).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : 'N/A'}
                          </td>
                          <td>
                            {price.srp_net
                              ? `R$ ${parseFloat(price.srp_net).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                              : 'N/A'}
                          </td>
                          <td>{new Date(price.updated_at).toLocaleString('pt-BR')}</td>
                          <td>
                            <Button size="sm" variant="outline-primary">
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Nenhuma informação de preço disponível
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir o produto <strong>{product.name}</strong>?</p>
          <p className="text-danger">Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Excluindo...
              </>
            ) : (
              'Excluir Produto'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage; 