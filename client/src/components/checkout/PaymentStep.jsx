import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

/**
 * PaymentStep component for selecting payment method
 * 
 * @param {Object} props
 * @param {Function} props.onNext - Function to move to next step
 * @param {Function} props.onPrev - Function to move to previous step
 * @param {Object} props.value - Current payment value
 * @param {Function} props.onChange - Function to update payment value
 * @returns {JSX.Element}
 */
const PaymentStep = ({ onNext, onPrev, value, onChange }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: ''
  });
  const [wireData, setWireData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [purchaseOrder, setPurchaseOrder] = useState({
    poNumber: '',
    companyName: '',
    contactName: '',
    contactEmail: ''
  });
  const [errors, setErrors] = useState({});
  
  // Initialize with existing data
  useEffect(() => {
    if (value) {
      setPaymentMethod(value.method);
      if (value.method === 'credit_card' && value.cardData) {
        setCardData(value.cardData);
      } else if (value.method === 'wire_transfer' && value.wireData) {
        setWireData(value.wireData);
      } else if (value.method === 'purchase_order' && value.purchaseOrder) {
        setPurchaseOrder(value.purchaseOrder);
      }
    }
  }, [value]);
  
  // Handle payment method change
  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    setErrors({});
  };
  
  // Handle credit card form changes
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle wire transfer form changes
  const handleWireChange = (e) => {
    const { name, value } = e.target;
    setWireData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle purchase order form changes
  const handlePOChange = (e) => {
    const { name, value } = e.target;
    setPurchaseOrder(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form based on payment method
  const validateForm = () => {
    const newErrors = {};
    
    if (paymentMethod === 'credit_card') {
      if (!cardData.cardNumber) newErrors.cardNumber = 'Card number is required';
      if (!cardData.nameOnCard) newErrors.nameOnCard = 'Name on card is required';
      if (!cardData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
      if (!cardData.cvv) newErrors.cvv = 'CVV is required';
    } else if (paymentMethod === 'wire_transfer') {
      if (!wireData.accountName) newErrors.accountName = 'Account name is required';
      if (!wireData.bankName) newErrors.bankName = 'Bank name is required';
      if (!wireData.accountNumber) newErrors.accountNumber = 'Account number is required';
      if (!wireData.routingNumber) newErrors.routingNumber = 'Routing number is required';
    } else if (paymentMethod === 'purchase_order') {
      if (!purchaseOrder.poNumber) newErrors.poNumber = 'PO number is required';
      if (!purchaseOrder.companyName) newErrors.companyName = 'Company name is required';
      if (!purchaseOrder.contactName) newErrors.contactName = 'Contact name is required';
      if (!purchaseOrder.contactEmail) newErrors.contactEmail = 'Contact email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle continue to next step
  const handleContinue = () => {
    if (validateForm()) {
      const paymentData = {
        method: paymentMethod,
        ...(paymentMethod === 'credit_card' && { cardData }),
        ...(paymentMethod === 'wire_transfer' && { wireData }),
        ...(paymentMethod === 'purchase_order' && { purchaseOrder })
      };
      
      onChange(paymentData);
      onNext();
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h4 className="mb-0">Payment Method</h4>
      </Card.Header>
      <Card.Body>
        <Form>
          <div className="mb-4">
            <Form.Group>
              <div className="mb-3">
                <Form.Check
                  type="radio"
                  id="payment-cc"
                  name="paymentMethod"
                  label="Credit Card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => handleMethodChange('credit_card')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="payment-wire"
                  name="paymentMethod"
                  label="Wire Transfer"
                  checked={paymentMethod === 'wire_transfer'}
                  onChange={() => handleMethodChange('wire_transfer')}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="payment-po"
                  name="paymentMethod"
                  label="Purchase Order"
                  checked={paymentMethod === 'purchase_order'}
                  onChange={() => handleMethodChange('purchase_order')}
                />
              </div>
            </Form.Group>
          </div>
          
          {paymentMethod === 'credit_card' && (
            <div className="payment-form">
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      placeholder="•••• •••• •••• ••••"
                      isInvalid={!!errors.cardNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cardNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name on Card</Form.Label>
                    <Form.Control
                      type="text"
                      name="nameOnCard"
                      value={cardData.nameOnCard}
                      onChange={handleCardChange}
                      placeholder="Cardholder name"
                      isInvalid={!!errors.nameOnCard}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nameOnCard}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiry Date</Form.Label>
                    <Form.Control
                      type="text"
                      name="expiryDate"
                      value={cardData.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      isInvalid={!!errors.expiryDate}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.expiryDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CVV</Form.Label>
                    <Form.Control
                      type="text"
                      name="cvv"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      placeholder="123"
                      isInvalid={!!errors.cvv}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cvv}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="alert alert-info mt-3">
                <i className="bi bi-shield-lock me-2"></i>
                Your card information is secure and encrypted. We never store your full card details.
              </div>
            </div>
          )}
          
          {paymentMethod === 'wire_transfer' && (
            <div className="payment-form">
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Please provide your bank details for wire transfer. Our team will contact you with additional instructions.
              </div>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="accountName"
                      value={wireData.accountName}
                      onChange={handleWireChange}
                      isInvalid={!!errors.accountName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.accountName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="bankName"
                      value={wireData.bankName}
                      onChange={handleWireChange}
                      isInvalid={!!errors.bankName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.bankName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="accountNumber"
                      value={wireData.accountNumber}
                      onChange={handleWireChange}
                      isInvalid={!!errors.accountNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.accountNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Routing Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="routingNumber"
                      value={wireData.routingNumber}
                      onChange={handleWireChange}
                      isInvalid={!!errors.routingNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.routingNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
          
          {paymentMethod === 'purchase_order' && (
            <div className="payment-form">
              <div className="alert alert-info mb-4">
                <i className="bi bi-info-circle me-2"></i>
                Orders paid by purchase order require approval before processing. Please provide your PO details below.
              </div>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>PO Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="poNumber"
                      value={purchaseOrder.poNumber}
                      onChange={handlePOChange}
                      isInvalid={!!errors.poNumber}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.poNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={purchaseOrder.companyName}
                      onChange={handlePOChange}
                      isInvalid={!!errors.companyName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.companyName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactName"
                      value={purchaseOrder.contactName}
                      onChange={handlePOChange}
                      isInvalid={!!errors.contactName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contactName}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="contactEmail"
                      value={purchaseOrder.contactEmail}
                      onChange={handlePOChange}
                      isInvalid={!!errors.contactEmail}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contactEmail}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Form>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={onPrev}
        >
          Back to Shipping
        </Button>
        <Button 
          variant="primary" 
          onClick={handleContinue}
        >
          Continue to Review
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default PaymentStep; 