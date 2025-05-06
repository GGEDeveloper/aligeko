import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { formatCurrency } from '../../utils/formatters';

/**
 * ShippingStep component for selecting shipping options
 * 
 * @param {Object} props
 * @param {Function} props.onNext - Function to move to next step
 * @param {Function} props.onPrev - Function to move to previous step
 * @param {Object} props.value - Current shipping value
 * @param {Function} props.onChange - Function to update shipping value
 * @returns {JSX.Element}
 */
const ShippingStep = ({ onNext, onPrev, value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState('');
  
  // Mock shipping options - replace with actual API call in production
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivery in 3-5 business days',
      price: 10,
      estimatedDelivery: '3-5 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivery in 2 business days',
      price: 25,
      estimatedDelivery: '2 business days'
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      price: 45,
      estimatedDelivery: 'Next business day'
    },
    {
      id: 'free',
      name: 'Free Shipping',
      description: 'Orders over $500 qualify for free shipping',
      price: 0,
      estimatedDelivery: '5-7 business days',
      minOrderAmount: 500
    }
  ];
  
  // Set default selected option or use previously selected one
  useEffect(() => {
    if (value) {
      setSelectedOption(value.id);
    } else {
      // Default to standard shipping
      setSelectedOption('standard');
      onChange(shippingOptions.find(option => option.id === 'standard'));
    }
  }, [onChange, value]);
  
  // Handle shipping option selection
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    const selectedShipping = shippingOptions.find(option => option.id === optionId);
    onChange(selectedShipping);
  };
  
  // Handle continue to next step
  const handleContinue = () => {
    if (selectedOption) {
      onNext();
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h4 className="mb-0">Shipping Method</h4>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Please select your preferred shipping method for this order.
        </p>
        
        <Form>
          <div className="mb-4">
            {shippingOptions.map(option => (
              <div key={option.id} className="mb-3">
                <Form.Check
                  type="radio"
                  id={`shipping-${option.id}`}
                  name="shippingOption"
                  label={
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div>
                        <span className="fw-medium">{option.name}</span>
                        <div className="text-muted small">{option.description}</div>
                        <div className="text-muted small">Estimated delivery: {option.estimatedDelivery}</div>
                      </div>
                      <span className="fs-5">
                        {option.price === 0 
                          ? 'Free' 
                          : formatCurrency(option.price)
                        }
                      </span>
                    </div>
                  }
                  checked={selectedOption === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="p-2 border rounded"
                />
              </div>
            ))}
          </div>
          
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Shipping costs are calculated based on weight and destination. Orders over $500 may qualify for free shipping.
          </div>
        </Form>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={onPrev}
        >
          Back to Address
        </Button>
        <Button 
          variant="primary" 
          onClick={handleContinue}
          disabled={!selectedOption}
        >
          Continue to Payment
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ShippingStep; 