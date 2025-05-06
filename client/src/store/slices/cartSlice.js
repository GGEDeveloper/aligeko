import { createSlice } from '@reduxjs/toolkit';

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  return items.reduce(
    (acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.totalAmount += item.quantity * item.price;
      return acc;
    },
    { totalQuantity: 0, totalAmount: 0 }
  );
};

// Get cart from local storage
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      const { items = [] } = parsedCart;
      const { totalQuantity, totalAmount } = calculateCartTotals(items);
      return {
        items,
        totalQuantity,
        totalAmount,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return { items: [], totalQuantity: 0, totalAmount: 0 };
};

const initialState = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const { id, name, price, image, quantity = 1, variant = null } = action.payload;
      
      const existingIndex = state.items.findIndex(
        (item) => item.id === id && (variant ? item.variant?.id === variant.id : !item.variant)
      );
      
      if (existingIndex >= 0) {
        // Item exists, update quantity
        state.items[existingIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          id,
          name,
          price,
          image,
          quantity,
          variant,
          addedAt: new Date().toISOString(),
        });
      }

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateCartTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      // Update localStorage
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        updatedAt: new Date().toISOString()
      }));
    },
    
    removeItem: (state, action) => {
      const { id, variant = null } = action.payload;
      
      state.items = state.items.filter(
        (item) => !(item.id === id && (variant ? item.variant?.id === variant.id : !item.variant))
      );

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateCartTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      // Update localStorage
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        updatedAt: new Date().toISOString()
      }));
    },
    
    updateItemQuantity: (state, action) => {
      const { id, quantity, variant = null } = action.payload;
      
      const itemIndex = state.items.findIndex(
        (item) => item.id === id && (variant ? item.variant?.id === variant.id : !item.variant)
      );
      
      if (itemIndex >= 0) {
        // Update quantity
        if (quantity > 0) {
          state.items[itemIndex].quantity = quantity;
        } else {
          // Remove if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        }
      }

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateCartTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      // Update localStorage
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        updatedAt: new Date().toISOString()
      }));
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      
      // Clear cart in localStorage
      localStorage.removeItem('cart');
    },
    
    syncWithServer: (state, action) => {
      // This action will be used when we implement server-side cart
      const { serverCart } = action.payload;
      
      if (serverCart && serverCart.items) {
        state.items = serverCart.items;
        
        // Recalculate totals
        const { totalQuantity, totalAmount } = calculateCartTotals(state.items);
        state.totalQuantity = totalQuantity;
        state.totalAmount = totalAmount;
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify({
          items: state.items,
          updatedAt: new Date().toISOString()
        }));
      }
    }
  },
});

export const { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart,
  syncWithServer 
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalItems = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartItemById = (id, variant = null) => (state) => 
  state.cart.items.find(
    (item) => item.id === id && (variant ? item.variant?.id === variant.id : !item.variant)
  ); 