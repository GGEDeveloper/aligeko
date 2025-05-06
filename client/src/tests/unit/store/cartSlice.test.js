import { describe, it, expect, beforeEach, vi } from 'vitest';
import cartReducer, { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart,
  syncWithServer,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartItemById
} from '../../../store/slices/cartSlice';

// Mock window if it doesn't exist (for Node.js environment)
if (typeof window === 'undefined') {
  global.window = {};
}

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Assign localStorage to window
window.localStorage = localStorageMock;

describe('cartSlice', () => {
  let initialState;

  beforeEach(() => {
    // Reset localStorage mock between tests
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Setup initial state for tests
    initialState = {
      items: [],
      totalQuantity: 0,
      totalAmount: 0
    };
  });
  
  describe('reducers', () => {
    it('should handle initial state', () => {
      const state = cartReducer(undefined, { type: 'unknown' });
      expect(state).toEqual({
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      });
    });
    
    describe('addItem', () => {
      it('should add a new item to an empty cart', () => {
        const product = { id: 1, name: 'Test Product', price: 100, image: 'test.jpg' };
        const state = cartReducer(initialState, addItem(product));
        
        expect(state.items).toHaveLength(1);
        expect(state.items[0].id).toBe(1);
        expect(state.items[0].name).toBe('Test Product');
        expect(state.items[0].quantity).toBe(1);
        expect(state.totalQuantity).toBe(1);
        expect(state.totalAmount).toBe(100);
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });

      it('should increase quantity of existing item', () => {
        // Add initial item
        const product = { id: 1, name: 'Test Product', price: 100, image: 'test.jpg' };
        let state = cartReducer(initialState, addItem(product));
        
        // Add same product again
        state = cartReducer(state, addItem(product));
        
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(2);
        expect(state.totalQuantity).toBe(2);
        expect(state.totalAmount).toBe(200);
      });
      
      it('should handle items with variants correctly', () => {
        const product1 = { 
          id: 1, 
          name: 'Test Product', 
          price: 100,
          image: 'test.jpg',
          variant: { id: 'v1', name: 'Small' }
        };
        
        const product2 = { 
          id: 1, 
          name: 'Test Product', 
          price: 120,
          image: 'test.jpg',
          variant: { id: 'v2', name: 'Large' }
        };
        
        let state = cartReducer(initialState, addItem(product1));
        state = cartReducer(state, addItem(product2));
        
        expect(state.items).toHaveLength(2);
        expect(state.totalQuantity).toBe(2);
        expect(state.totalAmount).toBe(220);
      });
      
      it('should add item with specified quantity', () => {
        const product = { 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg', 
          quantity: 5 
        };
        
        const state = cartReducer(initialState, addItem(product));
        
        expect(state.items[0].quantity).toBe(5);
        expect(state.totalQuantity).toBe(5);
        expect(state.totalAmount).toBe(500);
      });
    });
    
    describe('removeItem', () => {
      it('should remove an item from cart', () => {
        // Setup cart with an item
        let state = cartReducer(initialState, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg' 
        }));
        
        // Remove the item
        state = cartReducer(state, removeItem({ id: 1 }));
        
        expect(state.items).toHaveLength(0);
        expect(state.totalQuantity).toBe(0);
        expect(state.totalAmount).toBe(0);
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
      
      it('should remove only the variant specified', () => {
        // Add two variants of same product
        let state = initialState;
        state = cartReducer(state, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg',
          variant: { id: 'v1', name: 'Small' }
        }));
        
        state = cartReducer(state, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 120, 
          image: 'test.jpg',
          variant: { id: 'v2', name: 'Large' }
        }));
        
        // Remove one variant
        state = cartReducer(state, removeItem({ id: 1, variant: { id: 'v1' } }));
        
        expect(state.items).toHaveLength(1);
        expect(state.items[0].variant.id).toBe('v2');
        expect(state.totalQuantity).toBe(1);
        expect(state.totalAmount).toBe(120);
      });
    });
    
    describe('updateItemQuantity', () => {
      it('should update item quantity', () => {
        // Setup cart with an item
        let state = cartReducer(initialState, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg' 
        }));
        
        // Update quantity
        state = cartReducer(state, updateItemQuantity({ id: 1, quantity: 3 }));
        
        expect(state.items[0].quantity).toBe(3);
        expect(state.totalQuantity).toBe(3);
        expect(state.totalAmount).toBe(300);
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
      
      it('should remove item when quantity is set to zero', () => {
        // Setup cart with an item
        let state = cartReducer(initialState, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg' 
        }));
        
        // Update quantity to zero
        state = cartReducer(state, updateItemQuantity({ id: 1, quantity: 0 }));
        
        expect(state.items).toHaveLength(0);
        expect(state.totalQuantity).toBe(0);
        expect(state.totalAmount).toBe(0);
      });
      
      it('should only update the specified variant', () => {
        // Add two variants
        let state = initialState;
        state = cartReducer(state, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 100, 
          image: 'test.jpg',
          variant: { id: 'v1', name: 'Small' }
        }));
        
        state = cartReducer(state, addItem({ 
          id: 1, 
          name: 'Test Product', 
          price: 120, 
          image: 'test.jpg',
          variant: { id: 'v2', name: 'Large' }
        }));
        
        // Update quantity of first variant
        state = cartReducer(state, updateItemQuantity({ 
          id: 1, 
          quantity: 4,
          variant: { id: 'v1' }
        }));
        
        expect(state.items).toHaveLength(2);
        expect(state.items[0].quantity).toBe(4);
        expect(state.items[1].quantity).toBe(1);
        expect(state.totalQuantity).toBe(5);
        expect(state.totalAmount).toBe(520); // 4*100 + 1*120
      });
    });
    
    describe('clearCart', () => {
      it('should clear all items from cart', () => {
        // Setup cart with items
        let state = initialState;
        state = cartReducer(state, addItem({ id: 1, name: 'Product 1', price: 100, image: 'test1.jpg' }));
        state = cartReducer(state, addItem({ id: 2, name: 'Product 2', price: 200, image: 'test2.jpg' }));
        
        // Clear cart
        state = cartReducer(state, clearCart());
        
        expect(state.items).toHaveLength(0);
        expect(state.totalQuantity).toBe(0);
        expect(state.totalAmount).toBe(0);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart');
      });
    });
    
    describe('syncWithServer', () => {
      it('should sync cart with server data', () => {
        const serverCart = {
          items: [
            { id: 1, name: 'Server Product', price: 150, image: 'server.jpg', quantity: 2 }
          ]
        };
        
        const state = cartReducer(initialState, syncWithServer({ serverCart }));
        
        expect(state.items).toEqual(serverCart.items);
        expect(state.totalQuantity).toBe(2);
        expect(state.totalAmount).toBe(300);
        expect(localStorageMock.setItem).toHaveBeenCalled();
      });
    });
  });
  
  describe('selectors', () => {
    it('should select cart items', () => {
      const items = [{ id: 1, name: 'Test', price: 100, quantity: 1 }];
      const state = { cart: { items, totalQuantity: 1, totalAmount: 100 } };
      
      expect(selectCartItems(state)).toEqual(items);
    });
    
    it('should select total items', () => {
      const state = { cart: { items: [], totalQuantity: 5, totalAmount: 500 } };
      expect(selectCartTotalItems(state)).toBe(5);
    });
    
    it('should select total amount', () => {
      const state = { cart: { items: [], totalQuantity: 5, totalAmount: 500 } };
      expect(selectCartTotalAmount(state)).toBe(500);
    });
    
    it('should select cart item by id', () => {
      const items = [
        { id: 1, name: 'Product 1', price: 100, quantity: 1 },
        { id: 2, name: 'Product 2', price: 200, quantity: 2 }
      ];
      const state = { cart: { items, totalQuantity: 3, totalAmount: 500 } };
      
      expect(selectCartItemById(2)(state)).toEqual(items[1]);
    });
    
    it('should select cart item by id and variant', () => {
      const items = [
        { id: 1, name: 'Product', price: 100, quantity: 1, variant: { id: 'v1', name: 'Small' } },
        { id: 1, name: 'Product', price: 120, quantity: 1, variant: { id: 'v2', name: 'Large' } }
      ];
      const state = { cart: { items, totalQuantity: 2, totalAmount: 220 } };
      
      expect(selectCartItemById(1, { id: 'v2' })(state)).toEqual(items[1]);
    });
  });
}); 