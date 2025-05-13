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
 * Custom hook for cart functionality
 * @returns {Object} Cart methods and data
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.cart);
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
  
  /**
   * Check if a product is in the cart
   * @param {string|number} productId - Product ID to check
   * @returns {boolean} True if product is in cart
   */
  const isInCart = (productId) => {
    return items.some(item => item.id === productId);
  };
  
  /**
   * Get the quantity of a product in the cart
   * @param {string|number} productId - Product ID to check
   * @returns {number} Quantity in cart (0 if not in cart)
   */
  const getItemQuantity = (productId) => {
    const item = items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };
  
  /**
   * Add a product to the cart
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price || 
        (product.Variants && product.Variants.length > 0 && 
         product.Variants[0].Prices && product.Variants[0].Prices.length > 0)
        ? product.Variants[0].Prices[0].amount
        : 0,
      image: (product.Images && product.Images.length > 0)
        ? product.Images[0].url
        : '/placeholder-product.png',
      quantity: quantity,
      stock: product.Variants && product.Variants.length > 0 && product.Variants[0].Stock
        ? product.Variants[0].Stock.quantity
        : 0,
      producer: product.Producer ? product.Producer.name : null,
      category: product.Category ? product.Category.name : null,
      variantId: product.Variants && product.Variants.length > 0
        ? product.Variants[0].id
        : null
    }));
  };
  
  /**
   * Remove a product from the cart
   * @param {string|number} productId - Product ID to remove
   */
  const removeFromCart = (productId) => {
    dispatch(removeItem(productId));
  };
  
  /**
   * Update the quantity of a product in the cart
   * @param {string|number} productId - Product ID to update
   * @param {number} newQuantity - New quantity
   */
  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    dispatch(updateItemQuantity({
      id: productId,
      quantity: newQuantity
    }));
  };
  
  /**
   * Clear all items from the cart
   */
  const emptyCart = () => {
    dispatch(clearCart());
  };
  
  /**
   * Calculate total items in cart
   * @returns {number} Total number of items
   */
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  /**
   * Calculate total price of items in cart
   * @returns {number} Total price
   */
  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  return {
    items,
    loading,
    error,
    isInCart,
    getItemQuantity,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    getTotalItems,
    getTotalPrice,
    isSyncing,
    getGuestCartId
  };
}; 