import React, { useState } from 'react';
import { Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useGetProductsQuery } from '../../store/api/productApi';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

/**
 * BatchAddToCart component for B2B users to add multiple products at once
 * 
 * @returns {JSX.Element}
 */
const BatchAddToCart = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [processingBatch, setProcessingBatch] = useState(false);
  
  const { addToCart } = useCart();
  
  // Fetch products data with a higher limit for batch add
  const { data, isLoading, isError } = useGetProductsQuery({ 
    limit: 50,
    search: searchTerm
  });
  
  const products = data?.products || [];
  
  // Handle product selection
  const handleProductSelect = (product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
      // Remove from quantities
      const newQuantities = { ...quantities };
      delete newQuantities[product.id];
      setQuantities(newQuantities);
    } else {
      setSelectedProducts([...selectedProducts, product]);
      // Initialize quantity to 1
      setQuantities({ ...quantities, [product.id]: 1 });
    }
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      setQuantities({ ...quantities, [productId]: quantity });
    }
  };
  
  // Handle batch add to cart
  const handleBatchAddToCart = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    setProcessingBatch(true);
    
    try {
      // Add each selected product to cart
      selectedProducts.forEach(product => {
        const quantity = quantities[product.id] || 1;
        addToCart(product, quantity);
      });
      
      toast.success(`${selectedProducts.length} products added to cart`);
      setShowModal(false);
      setSelectedProducts([]);
      setQuantities({});
    } catch (error) {
      toast.error('Failed to add products to cart');
      console.error('Batch add to cart error:', error);
    } finally {
      setProcessingBatch(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline-primary" 
        className="d-flex align-items-center"
        onClick={() => setShowModal(true)}
      >
        <i className="bi bi-cart-plus me-2"></i> Batch Add to Cart
      </Button>
      
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Batch Add Products to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="mb-4">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Search products by name or code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Form>
          
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : isError ? (
            <div className="alert alert-danger">
              Error loading products. Please try again.
            </div>
          ) : products.length === 0 ? (
            <div className="alert alert-info">
              No products found. Try another search term.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    const price = product.Prices && product.Prices.length > 0
                      ? product.Prices[0].amount
                      : product.price || 0;
                    
                    const stock = product.Variants && product.Variants.length > 0 && product.Variants[0].Stock
                      ? product.Variants[0].Stock.quantity
                      : 0;
                    
                    const isOutOfStock = stock <= 0;
                    
                    return (
                      <tr key={product.id} className={isSelected ? 'table-primary' : ''}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductSelect(product)}
                            disabled={isOutOfStock}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.Images && product.Images.length > 0 ? (
                              <img 
                                src={product.Images[0].url} 
                                alt={product.name}
                                width="40"
                                height="40"
                                className="me-2"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div 
                                className="bg-light d-flex align-items-center justify-content-center me-2"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            )}
                            <div>
                              <div className="fw-medium">{product.name}</div>
                              <small className="text-muted">{product.code}</small>
                            </div>
                          </div>
                        </td>
                        <td>{formatCurrency(price)}</td>
                        <td>
                          {isOutOfStock ? (
                            <span className="badge bg-danger">Out of Stock</span>
                          ) : (
                            <span className={`badge ${stock < 10 ? 'bg-warning' : 'bg-success'}`}>
                              {stock}
                            </span>
                          )}
                        </td>
                        <td style={{ width: '120px' }}>
                          <Form.Control
                            type="number"
                            min="1"
                            value={quantities[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            disabled={!isSelected || isOutOfStock}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
          
          <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between">
              <span>{selectedProducts.length} products selected</span>
              <div>
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={() => {
                    setSelectedProducts([]);
                    setQuantities({});
                  }}
                  disabled={selectedProducts.length === 0}
                >
                  Clear Selection
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleBatchAddToCart}
                  disabled={selectedProducts.length === 0 || processingBatch}
                >
                  {processingBatch ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Adding...
                    </>
                  ) : (
                    <>Add Selected to Cart</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BatchAddToCart; 