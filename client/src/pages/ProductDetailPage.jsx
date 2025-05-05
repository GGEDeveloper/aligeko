import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Tabs,
  Tab,
  Table,
  Form,
  Modal
} from 'react-bootstrap';
import { 
  useGetProductByIdQuery, 
  useDeleteProductMutation 
} from '../store/api/productApi';
import { toast } from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Fetch product data
  const {
    data: product,
    isLoading,
    isError,
    error
  } = useGetProductByIdQuery(id);
  
  // Delete product mutation
  const [deleteProduct, {
    isLoading: isDeleting,
    isError: isDeleteError,
    error: deleteError
  }] = useDeleteProductMutation();
  
  // Handle delete product
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete product');
    }
    setShowDeleteModal(false);
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
          Error loading product: {error?.data?.message || 'Unknown error occurred'}
        </Alert>
      </Container>
    );
  }
  
  // Calculate stock status
  const getTotalStock = () => {
    if (!product.Variants || product.Variants.length === 0) {
      return 0;
    }
    
    return product.Variants.reduce((total, variant) => {
      if (variant.Stock && variant.Stock.quantity) {
        return total + variant.Stock.quantity;
      }
      return total;
    }, 0);
  };
  
  // Get stock status badge
  const getStockStatusBadge = () => {
    const totalStock = getTotalStock();
    
    if (totalStock <= 0) {
      return <Badge bg="danger">Out of Stock</Badge>;
    } else if (totalStock < 10) {
      return <Badge bg="warning">Low Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };
  
  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link to="/products" className="text-decoration-none">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Products
        </Link>
      </div>
      
      {/* Product Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">{product.name}</h1>
          <div className="d-flex align-items-center mb-2">
            {product.Category && (
              <Badge bg="info" className="me-2">{product.Category.name}</Badge>
            )}
            {product.Producer && (
              <Badge bg="secondary" className="me-2">{product.Producer.name}</Badge>
            )}
            {getStockStatusBadge()}
          </div>
          <p className="text-muted">Product ID: {product.id}</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2 align-items-start">
          <Link to={`/products/${id}/edit`}>
            <Button variant="outline-primary">
              <i className="bi bi-pencil me-1"></i> Edit
            </Button>
          </Link>
          <Button 
            variant="outline-danger" 
            onClick={() => setShowDeleteModal(true)}
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
                  className="me-1"
                />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-1"></i> Delete
              </>
            )}
          </Button>
        </Col>
      </Row>
      
      {/* Product Content */}
      <Row>
        {/* Product Image */}
        <Col md={4} className="mb-4">
          <Card>
            {product.Images && product.Images.length > 0 ? (
              <Card.Img
                variant="top"
                src={product.Images[0].url}
                alt={product.name}
                className="img-fluid rounded"
              />
            ) : (
              <div className="text-center bg-light p-5">
                <i className="bi bi-image text-muted" style={{ fontSize: '5rem' }}></i>
                <p className="mt-3">No image available</p>
              </div>
            )}
            {product.Images && product.Images.length > 1 && (
              <Card.Body>
                <Row className="g-2">
                  {product.Images.slice(1).map((image, index) => (
                    <Col xs={4} key={image.id || index}>
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 2}`}
                        className="img-thumbnail"
                        style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            )}
          </Card>
        </Col>
        
        {/* Product Details Tabs */}
        <Col md={8}>
          <Card>
            <Card.Header>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0"
              >
                <Tab eventKey="details" title="Details">
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Description:</Col>
                      <Col md={9}>{product.description}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">SKU:</Col>
                      <Col md={9}>{product.sku}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Base Price:</Col>
                      <Col md={9}>${parseFloat(product.base_price).toFixed(2)}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Producer:</Col>
                      <Col md={9}>{product.Producer?.name || 'N/A'}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Category:</Col>
                      <Col md={9}>{product.Category?.name || 'N/A'}</Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3} className="fw-bold">Unit:</Col>
                      <Col md={9}>
                        {product.Unit?.name || 'N/A'} 
                        {product.Unit?.moq && (
                          <span className="text-muted ms-2">
                            (Min Order: {product.Unit.moq})
                          </span>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3} className="fw-bold">Created At:</Col>
                      <Col md={9}>
                        {new Date(product.created_at).toLocaleDateString()}
                      </Col>
                    </Row>
                  </Card.Body>
                </Tab>
                <Tab eventKey="variants" title="Variants">
                  <Card.Body>
                    {!product.Variants || product.Variants.length === 0 ? (
                      <Alert variant="info">No variants available for this product.</Alert>
                    ) : (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.Variants.map(variant => (
                            <tr key={variant.id}>
                              <td>{variant.id}</td>
                              <td>{variant.name}</td>
                              <td>{variant.sku}</td>
                              <td>
                                ${parseFloat(variant.Price?.amount || 0).toFixed(2)}
                              </td>
                              <td>
                                {variant.Stock?.quantity || 0}
                                {variant.Stock?.quantity <= 10 && (
                                  <Badge 
                                    bg={variant.Stock?.quantity <= 0 ? "danger" : "warning"}
                                    className="ms-2"
                                  >
                                    {variant.Stock?.quantity <= 0 ? "Out of Stock" : "Low Stock"}
                                  </Badge>
                                )}
                              </td>
                              <td>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  as={Link}
                                  to={`/products/${id}/variants/${variant.id}/edit`}
                                >
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                    <div className="text-end mt-3">
                      <Button 
                        variant="primary" 
                        size="sm"
                        as={Link}
                        to={`/products/${id}/variants/add`}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Add Variant
                      </Button>
                    </div>
                  </Card.Body>
                </Tab>
                <Tab eventKey="pricing" title="Pricing">
                  <Card.Body>
                    <Form>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Base Price</Form.Label>
                            <Form.Control
                              type="number"
                              value={product.base_price}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Discount</Form.Label>
                            <Form.Control
                              type="number"
                              value={product.discount || 0}
                              readOnly
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {product.Prices && product.Prices.length > 0 ? (
                        <Table responsive className="mt-4">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Price Type</th>
                              <th>Amount</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.Prices.map(price => (
                              <tr key={price.id}>
                                <td>{price.id}</td>
                                <td>{price.type}</td>
                                <td>${parseFloat(price.amount).toFixed(2)}</td>
                                <td>
                                  {price.start_date ? new Date(price.start_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                  {price.end_date ? new Date(price.end_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    as={Link}
                                    to={`/products/${id}/prices/${price.id}/edit`}
                                  >
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info" className="mt-4">No special pricing available for this product.</Alert>
                      )}
                      <div className="text-end mt-3">
                        <Button 
                          variant="primary" 
                          size="sm"
                          as={Link}
                          to={`/products/${id}/prices/add`}
                        >
                          <i className="bi bi-plus-circle me-1"></i>
                          Add Special Price
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product <strong>{product.name}</strong>? This action cannot be undone.
          
          {isDeleteError && (
            <Alert variant="danger" className="mt-3">
              {deleteError?.data?.message || 'Error deleting product'}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage; 