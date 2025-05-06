import React from 'react';
import { Badge, Button, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useCart } from '../../hooks/useCart';

/**
 * CartSync component shows cart synchronization status and controls
 *
 * @returns {JSX.Element}
 */
const CartSync = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { syncCart, isSyncing } = useCart();
  
  if (!isAuthenticated) {
    return null;
  }

  const handleSync = async () => {
    try {
      await syncCart();
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
  };

  return (
    <div className="cart-sync-indicator">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip>
            {isSyncing 
              ? 'Synchronizing cart with server...' 
              : 'Sync your cart with the server'}
          </Tooltip>
        }
      >
        <Button
          variant="link"
          size="sm"
          className="text-white p-0 mx-2"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up-fill"></i>
              <Badge 
                bg="success" 
                pill 
                className="position-absolute translate-middle"
                style={{ fontSize: '0.5rem', top: '10%', right: '10%' }}
              >
                ✓
              </Badge>
            </>
          )}
        </Button>
      </OverlayTrigger>
    </div>
  );
};

export default CartSync; 