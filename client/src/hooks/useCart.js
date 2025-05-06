import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart,
  syncWithServer,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount
} from '../store/slices/cartSlice';
import { 
  useGetUserCartQuery, 
  useSyncCartMutation,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation
} from '../store/api/cartApi';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing cart operations
 * @returns {Object} Cart utility functions and state
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Get localStorage guest cart ID or create a new one
  const getGuestCartId = useCallback(() => {
    let guestCartId = localStorage.getItem('guestCartId');
    if (!guestCartId) {
      guestCartId = uuidv4();
      localStorage.setItem('guestCartId', guestCartId);
    }
    return guestCartId;
  }, []);
  
  // Select cart state from Redux
  const cartItems = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  
  // Server cart API hooks
  const { data: serverCart, isSuccess: serverCartLoaded } = useGetUserCartQuery(undefined, { 
    skip: !isAuthenticated 
  });
  
  const [syncServerCart, { isLoading: isSyncing }] = useSyncCartMutation();
  const [addServerCartItem] = useAddCartItemMutation();
  const [updateServerCartItem] = useUpdateCartItemMutation();
  const [removeServerCartItem] = useRemoveCartItemMutation();
  const [clearServerCart] = useClearCartMutation();
  
  // On login, sync local cart with server
  useEffect(() => {
    if (isAuthenticated && user && cartItems.length > 0) {
      // Format cart items for API
      const formattedItems = cartItems.map(item => ({
        variant_id: item.variant ? item.variant.id : item.id,
        quantity: item.quantity,
        price: item.price,
        added_at: item.addedAt,
        custom_data: { product_id: item.id, product_name: item.name, image: item.image }
      }));
      
      // Sync with server
      syncServerCart({ 
        items: formattedItems, 
        guest_cart_id: getGuestCartId() 
      });
    }
  }, [isAuthenticated, user, syncServerCart, getGuestCartId]);
  
  // When server cart loads, sync to local if it has items
  useEffect(() => {
    if (serverCartLoaded && serverCart && serverCart.items && serverCart.items.length > 0) {
      // Format server items to match local cart structure
      const formattedItems = serverCart.items.map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        variant: item.variant_id ? {
          id: item.variant_id,
          code: item.variant_code
        } : null,
        addedAt: item.added_at
      }));
      
      // Sync to local cart
      dispatch(syncWithServer({ serverCart: { items: formattedItems } }));
    }
  }, [serverCartLoaded, serverCart, dispatch]);
  
  // Add item to cart
  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    const payload = {
      id: product.id,
      name: product.name,
      price: variant ? variant.price : product.price,
      image: product.image || (product.Images && product.Images.length > 0 ? product.Images[0].url : ''),
      quantity,
      variant: variant ? {
        id: variant.id,
        code: variant.code,
        name: variant.name || '',
      } : null
    };
    
    // Update local cart first (for immediate UI feedback)
    dispatch(addItem(payload));
    
    // If logged in, sync with server
    if (isAuthenticated) {
      addServerCartItem({
        variant_id: variant ? variant.id : product.id,
        quantity,
        custom_data: { product_id: product.id, product_name: product.name }
      });
    }
  }, [dispatch, isAuthenticated, addServerCartItem]);
  
  // Remove item from cart
  const removeFromCart = useCallback((productId, variant = null) => {
    // Find the item to get its ID if it exists in server cart
    const cartItem = cartItems.find(item => 
      item.id === productId && 
      (variant ? (item.variant?.id === variant.id) : !item.variant)
    );
    
    // Update local cart
    dispatch(removeItem({ id: productId, variant }));
    
    // If logged in and item exists in server cart, remove from server
    if (isAuthenticated && cartItem && cartItem.serverId) {
      removeServerCartItem(cartItem.serverId);
    }
  }, [dispatch, isAuthenticated, cartItems, removeServerCartItem]);
  
  // Update item quantity
  const updateQuantity = useCallback((productId, quantity, variant = null) => {
    // Find the item to get its ID if it exists in server cart
    const cartItem = cartItems.find(item => 
      item.id === productId && 
      (variant ? (item.variant?.id === variant.id) : !item.variant)
    );
    
    // Update local cart
    dispatch(updateItemQuantity({ id: productId, quantity, variant }));
    
    // If logged in and item exists in server cart, update on server
    if (isAuthenticated && cartItem && cartItem.serverId) {
      updateServerCartItem({ 
        itemId: cartItem.serverId, 
        quantity 
      });
    }
  }, [dispatch, isAuthenticated, cartItems, updateServerCartItem]);
  
  // Clear the entire cart
  const emptyCart = useCallback(() => {
    // Clear local cart
    dispatch(clearCart());
    
    // If logged in, clear server cart
    if (isAuthenticated) {
      clearServerCart();
    }
  }, [dispatch, isAuthenticated, clearServerCart]);
  
  // Sync local cart with server
  const syncCart = useCallback(async () => {
    if (isAuthenticated && cartItems.length > 0) {
      // Format cart items for API
      const formattedItems = cartItems.map(item => ({
        variant_id: item.variant ? item.variant.id : item.id,
        quantity: item.quantity,
        price: item.price,
        added_at: item.addedAt,
        custom_data: { product_id: item.id, product_name: item.name, image: item.image }
      }));
      
      // Sync with server
      await syncServerCart({ 
        items: formattedItems, 
        guest_cart_id: getGuestCartId() 
      }).unwrap();
      
      return true;
    }
    return false;
  }, [isAuthenticated, cartItems, syncServerCart, getGuestCartId]);
  
  // Check if product is in cart
  const isInCart = useCallback((productId, variant = null) => {
    return cartItems.some(item => 
      item.id === productId && 
      (variant ? (item.variant?.id === variant.id) : !item.variant)
    );
  }, [cartItems]);
  
  // Get quantity of specific item in cart
  const getItemQuantity = useCallback((productId, variant = null) => {
    const item = cartItems.find(item => 
      item.id === productId && 
      (variant ? (item.variant?.id === variant.id) : !item.variant)
    );
    return item ? item.quantity : 0;
  }, [cartItems]);
  
  return {
    // State
    cartItems,
    totalItems,
    totalAmount,
    isSyncing,
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    emptyCart,
    syncCart,
    // Helpers
    isInCart,
    getItemQuantity,
    getGuestCartId
  };
}; 