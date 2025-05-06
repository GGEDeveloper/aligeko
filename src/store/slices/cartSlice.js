import { createSlice } from '@reduxjs/toolkit';
import { safeLocalStorage, safeJsonParse } from '../../utils/storageUtils';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cartData = safeLocalStorage.getItem('cart');
    if (cartData) {
      const parsedData = safeJsonParse(cartData, {});
      return parsedData.items || [];
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage helper
const saveCartToStorage = (items) => {
  try {
    safeLocalStorage.setItem('cart', JSON.stringify({
      items,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Initial state
const initialState = {
  items: loadCartFromStorage(),
  isLoading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { item, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(i => 
        i.id === item.id && 
        (!item.variantId || i.variantId === item.variantId)
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        state.items.push({
          ...item,
          quantity
        });
      }
      
      // Update localStorage
      saveCartToStorage(state.items);
    },
    
    removeItem: (state, action) => {
      const { id, variantId } = action.payload;
      
      // Filter out the item to remove
      state.items = state.items.filter(item => {
        // If variantId is provided, only remove the specific variant
        if (variantId) {
          return !(item.id === id && item.variantId === variantId);
        }
        // Otherwise remove all variants of the product
        return item.id !== id;
      });
      
      // Update localStorage
      saveCartToStorage(state.items);
    },
    
    updateItemQuantity: (state, action) => {
      const { id, quantity, variantId } = action.payload;
      const itemIndex = state.items.findIndex(item => {
        if (variantId) {
          return item.id === id && item.variantId === variantId;
        }
        return item.id === id;
      });
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity if > 0
          state.items[itemIndex].quantity = quantity;
        }
      }
      
      // Update localStorage
      saveCartToStorage(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      
      // Clear localStorage cart
      saveCartToStorage([]);
    },
    
    syncWithServer: (state, action) => {
      const { items } = action.payload;
      
      if (items && Array.isArray(items)) {
        state.items = items;
        
        // Update localStorage
        saveCartToStorage(state.items);
      }
    }
  },
});

// Export actions and reducer
export const { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart,
  syncWithServer
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => 
  state.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotalAmount = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemById = (state, id, variantId) => {
  if (variantId) {
    return state.cart.items.find(item => item.id === id && item.variantId === variantId);
  }
  return state.cart.items.find(item => item.id === id);
};

// Export helpers for testing
export { safeLocalStorage, loadCartFromStorage, saveCartToStorage };

export default cartSlice.reducer; 