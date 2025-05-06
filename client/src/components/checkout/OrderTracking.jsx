import React from 'react';
import PropTypes from 'prop-types';
import './OrderTracking.css';

/**
 * OrderTracking component displays a visual timeline of an order's status
 * 
 * @param {Object} props
 * @param {string} props.status - Current order status
 * @param {Date} props.orderDate - Date the order was placed
 * @param {Date} props.estimatedDelivery - Estimated delivery date
 * @param {Date} props.shippedDate - Date the order was shipped (optional)
 * @returns {JSX.Element}
 */
const OrderTracking = ({ status, orderDate, estimatedDelivery, shippedDate }) => {
  // Define the steps in the order process
  const steps = [
    { id: 'placed', label: 'Order Placed', date: orderDate },
    { id: 'processing', label: 'Processing', date: null },
    { id: 'shipped', label: 'Shipped', date: shippedDate },
    { id: 'delivered', label: 'Delivered', date: null }
  ];
  
  // Determine which steps are completed based on the order status
  const completedSteps = {
    'pending': ['placed'],
    'processing': ['placed'],
    'approved': ['placed', 'processing'],
    'paid': ['placed', 'processing'],
    'shipped': ['placed', 'processing', 'shipped'],
    'delivered': ['placed', 'processing', 'shipped', 'delivered'],
    'cancelled': ['placed']
  };
  
  // Get the completed steps for the current status
  const completedStepIds = completedSteps[status] || ['placed'];
  
  // Determine the active step (the step that's currently in progress)
  let activeStep = '';
  if (completedStepIds.includes('delivered')) {
    activeStep = '';
  } else if (completedStepIds.includes('shipped')) {
    activeStep = 'delivered';
  } else if (completedStepIds.includes('processing')) {
    activeStep = 'shipped';
  } else {
    activeStep = 'processing';
  }
  
  // Calculate estimated ship date (2 days after order date)
  const estimatedShipDate = orderDate && new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  
  return (
    <div className="tracking-timeline">
      {steps.map(step => {
        const isCompleted = completedStepIds.includes(step.id);
        const isActive = step.id === activeStep;
        
        return (
          <div 
            key={step.id} 
            className={`tracking-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="tracking-icon">
              <i className={isCompleted ? 'bi bi-check-circle-fill' : isActive ? 'bi bi-circle-fill' : 'bi bi-circle'}></i>
            </div>
            <div className="tracking-content">
              <h6>{step.label}</h6>
              <p className="text-muted small">
                {step.id === 'placed' && orderDate ? (
                  orderDate.toLocaleString()
                ) : step.id === 'processing' ? (
                  'Your order is being processed'
                ) : step.id === 'shipped' ? (
                  shippedDate ? 
                    `Shipped on ${shippedDate.toLocaleDateString()}` : 
                    `Estimated ship date: ${estimatedShipDate?.toLocaleDateString() || 'Pending'}`
                ) : step.id === 'delivered' ? (
                  `Estimated delivery: ${estimatedDelivery?.toLocaleDateString() || 'Pending'}`
                ) : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

OrderTracking.propTypes = {
  status: PropTypes.string.isRequired,
  orderDate: PropTypes.instanceOf(Date),
  estimatedDelivery: PropTypes.instanceOf(Date),
  shippedDate: PropTypes.instanceOf(Date)
};

OrderTracking.defaultProps = {
  status: 'pending',
  orderDate: new Date(),
  estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
};

export default OrderTracking; 