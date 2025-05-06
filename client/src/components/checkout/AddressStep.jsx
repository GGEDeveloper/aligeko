import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

/**
 * AddressStep component for selecting or adding shipping address
 * 
 * @param {Object} props
 * @param {Function} props.onNext - Function to move to next step
 * @param {Object} props.value - Current address value
 * @param {Function} props.onChange - Function to update address value
 * @returns {JSX.Element}
 */
const AddressStep = ({ onNext, value, onChange }) => {
  const { user } = useSelector(state => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });
  const [errors, setErrors] = useState({});
  
  // Mock addresses - replace with actual API call in production
  useEffect(() => {
    // Simulate API call to fetch addresses
    const mockAddresses = [
      {
        id: '1',
        name: 'Office',
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'USA',
        isDefault: true
      },
      {
        id: '2',
        name: 'Warehouse',
        street: '456 Storage Blvd',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94612',
        country: 'USA',
        isDefault: false
      }
    ];
    
    setAddresses(mockAddresses);
    
    // Set default selected address or use previously selected one
    if (value) {
      setSelectedAddressId(value.id);
    } else if (mockAddresses.length > 0) {
      const defaultAddress = mockAddresses.find(addr => addr.isDefault) || mockAddresses[0];
      setSelectedAddressId(defaultAddress.id);
      onChange(defaultAddress);
    } else {
      setShowAddressForm(true);
    }
  }, [onChange, value]);
  
  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    onChange(selectedAddress);
    setShowAddressForm(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!newAddress.name.trim()) newErrors.name = 'Name is required';
    if (!newAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!newAddress.city.trim()) newErrors.city = 'City is required';
    if (!newAddress.state.trim()) newErrors.state = 'State is required';
    if (!newAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create a new address object with ID
    const address = {
      ...newAddress,
      id: `new-${Date.now()}`
    };
    
    // In a real app, you would save this to the server here
    
    // Update local state
    setAddresses(prev => [...prev, address]);
    setSelectedAddressId(address.id);
    onChange(address);
    setShowAddressForm(false);
  };
  
  // Handle continue to next step
  const handleContinue = () => {
    if (selectedAddressId) {
      onNext();
    } else if (showAddressForm) {
      // If showing form, validate and submit first
      if (validateForm()) {
        handleAddressSubmit({ preventDefault: () => {} });
        onNext();
      }
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h4 className="mb-0">Shipping Address</h4>
      </Card.Header>
      <Card.Body>
        {addresses.length > 0 && !showAddressForm && (
          <div className="mb-4">
            <Form>
              <div className="mb-3">
                {addresses.map(address => (
                  <div key={address.id} className="mb-2">
                    <Form.Check
                      type="radio"
                      id={`address-${address.id}`}
                      name="addressSelect"
                      label={
                        <div>
                          <span className="fw-medium">{address.name}</span>
                          <div className="text-muted small">
                            {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                          </div>
                        </div>
                      }
                      checked={selectedAddressId === address.id}
                      onChange={() => handleAddressSelect(address.id)}
                      className="p-2 border rounded mb-1"
                    />
                  </div>
                ))}
              </div>
              <Button 
                variant="outline-primary" 
                onClick={() => setShowAddressForm(true)}
                className="me-2"
              >
                Add New Address
              </Button>
            </Form>
          </div>
        )}
        
        {showAddressForm && (
          <Form onSubmit={handleAddressSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address Name/Label</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newAddress.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Office, Warehouse"
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Street Address</Form.Label>
              <Form.Control
                type="text"
                name="street"
                value={newAddress.street}
                onChange={handleInputChange}
                placeholder="Street address"
                isInvalid={!!errors.street}
              />
              <Form.Control.Feedback type="invalid">
                {errors.street}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    isInvalid={!!errors.city}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.city}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    isInvalid={!!errors.state}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.state}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    isInvalid={!!errors.zipCode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.zipCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Select
                name="country"
                value={newAddress.country}
                onChange={handleInputChange}
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="MEX">Mexico</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isDefault"
                label="Set as default address"
                checked={newAddress.isDefault}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <div className="d-flex">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Address
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
      <Card.Footer className="d-flex justify-content-end">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleContinue}
          disabled={!selectedAddressId && !validateForm()}
        >
          Continue to Shipping
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default AddressStep; 