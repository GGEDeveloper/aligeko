/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the entire cartSlice module first
vi.mock('../../../store/slices/cartSlice', () => {
  // Import the actual implementation
  const originalModule = vi.importActual('../../../store/slices/cartSlice');
  
  // Create a mock of safeLocalStorage
  const mockSafeLocalStorage = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn()
  };
  
  // Return a modified version with our mocked safeLocalStorage
  return {
    ...originalModule,
    safeLocalStorage: mockSafeLocalStorage
  };
});

// Now import the mocked module
import cartReducer, { 
  addItem, 
  removeItem, 
  updateItemQuantity, 
  clearCart,
  syncWithServer,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalAmount,
  selectCartItemById,
  safeLocalStorage
} from '../../../store/slices/cartSlice';

describe('cartSlice', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      const initialState = cartReducer(undefined, { type: 'unknown' });
      expect(initialState).toEqual({
        items: [],
        isLoading: false,
        error: null
      });
    });

    describe('addItem', () => {
      it('should add a new item to an empty cart', () => {
        const initialState = {
          items: [],
          isLoading: false,
          error: null
        };
        
        const item = {
          id: 1,
          name: 'Test Product',
          price: 10,
          image: 'test.jpg'
        };

        const action = addItem({ item });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0]).toEqual({
          ...item,
          quantity: 1
        });
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should increase quantity of existing item', () => {
        const initialState = {
          items: [{
            id: 1,
            name: 'Test Product',
            price: 10,
            image: 'test.jpg',
            quantity: 1
          }],
          isLoading: false,
          error: null
        };
        
        const item = {
          id: 1,
          name: 'Test Product',
          price: 10,
          image: 'test.jpg'
        };

        const action = addItem({ item });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].quantity).toBe(2);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should handle items with variants correctly', () => {
        const initialState = {
          items: [{
            id: 1,
            variantId: 'color-red',
            name: 'Test Product - Red',
            price: 10,
            image: 'test-red.jpg',
            quantity: 1
          }],
          isLoading: false,
          error: null
        };
        
        const item = {
          id: 1,
          variantId: 'color-blue',
          name: 'Test Product - Blue',
          price: 10,
          image: 'test-blue.jpg'
        };

        const action = addItem({ item });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(2);
        expect(newState.items[1].variantId).toBe('color-blue');
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should add item with specified quantity', () => {
        const initialState = {
          items: [],
          isLoading: false,
          error: null
        };
        
        const item = {
          id: 1,
          name: 'Test Product',
          price: 10,
          image: 'test.jpg'
        };

        const action = addItem({ item, quantity: 5 });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].quantity).toBe(5);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('removeItem', () => {
      it('should remove an item from cart', () => {
        const initialState = {
          items: [{
            id: 1,
            name: 'Test Product',
            price: 10,
            image: 'test.jpg',
            quantity: 1
          }],
          isLoading: false,
          error: null
        };

        const action = removeItem({ id: 1 });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(0);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should remove only the variant specified', () => {
        const initialState = {
          items: [
            {
              id: 1,
              variantId: 'color-red',
              name: 'Test Product - Red',
              price: 10,
              image: 'test-red.jpg',
              quantity: 1
            },
            {
              id: 1,
              variantId: 'color-blue',
              name: 'Test Product - Blue',
              price: 10,
              image: 'test-blue.jpg',
              quantity: 1
            }
          ],
          isLoading: false,
          error: null
        };

        const action = removeItem({ id: 1, variantId: 'color-red' });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].variantId).toBe('color-blue');
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('updateItemQuantity', () => {
      it('should update item quantity', () => {
        const initialState = {
          items: [{
            id: 1,
            name: 'Test Product',
            price: 10,
            image: 'test.jpg',
            quantity: 1
          }],
          isLoading: false,
          error: null
        };

        const action = updateItemQuantity({ id: 1, quantity: 3 });
        const newState = cartReducer(initialState, action);

        expect(newState.items[0].quantity).toBe(3);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should remove item when quantity is set to zero', () => {
        const initialState = {
          items: [{
            id: 1,
            name: 'Test Product',
            price: 10,
            image: 'test.jpg',
            quantity: 1
          }],
          isLoading: false,
          error: null
        };

        const action = updateItemQuantity({ id: 1, quantity: 0 });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(0);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });

      it('should only update the specified variant', () => {
        const initialState = {
          items: [
            {
              id: 1,
              variantId: 'color-red',
              name: 'Test Product - Red',
              price: 10,
              image: 'test-red.jpg',
              quantity: 1
            },
            {
              id: 1,
              variantId: 'color-blue',
              name: 'Test Product - Blue',
              price: 10,
              image: 'test-blue.jpg',
              quantity: 1
            }
          ],
          isLoading: false,
          error: null
        };

        const action = updateItemQuantity({ id: 1, variantId: 'color-blue', quantity: 3 });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(2);
        expect(newState.items[0].quantity).toBe(1); // Red variant unchanged
        expect(newState.items[1].quantity).toBe(3); // Blue variant updated
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('clearCart', () => {
      it('should clear all items from cart', () => {
        const initialState = {
          items: [
            {
              id: 1,
              name: 'Test Product 1',
              price: 10,
              image: 'test1.jpg',
              quantity: 1
            },
            {
              id: 2,
              name: 'Test Product 2',
              price: 20,
              image: 'test2.jpg',
              quantity: 2
            }
          ],
          isLoading: false,
          error: null
        };

        const action = clearCart();
        const newState = cartReducer(initialState, action);

        expect(newState.items).toHaveLength(0);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe('syncWithServer', () => {
      it('should sync cart with server data', () => {
        const initialState = {
          items: [
            {
              id: 1,
              name: 'Old Product',
              price: 10,
              image: 'old.jpg',
              quantity: 1
            }
          ],
          isLoading: false,
          error: null
        };

        const serverItems = [
          {
            id: 2,
            name: 'Server Product',
            price: 30,
            image: 'server.jpg',
            quantity: 3
          }
        ];

        const action = syncWithServer({ items: serverItems });
        const newState = cartReducer(initialState, action);

        expect(newState.items).toEqual(serverItems);
        
        // Verify localStorage mock was called
        expect(safeLocalStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('selectors', () => {
    const state = {
      cart: {
        items: [
          {
            id: 1,
            name: 'Test Product 1',
            price: 10,
            image: 'test1.jpg',
            quantity: 2
          },
          {
            id: 2,
            name: 'Test Product 2',
            price: 20,
            image: 'test2.jpg',
            quantity: 1
          },
          {
            id: 3,
            variantId: 'color-red',
            name: 'Test Product 3 - Red',
            price: 15,
            image: 'test3-red.jpg',
            quantity: 3
          }
        ]
      }
    };

    it('should select cart items', () => {
      const result = selectCartItems(state);
      expect(result).toEqual(state.cart.items);
    });

    it('should calculate total items count', () => {
      const result = selectCartTotalItems(state);
      expect(result).toBe(6); // 2 + 1 + 3
    });

    it('should calculate total price', () => {
      const result = selectCartTotalAmount(state);
      expect(result).toBe(85); // (10*2) + (20*1) + (15*3)
    });

    it('should find item by id', () => {
      const result = selectCartItemById(state, 2);
      expect(result).toEqual(state.cart.items[1]);
    });

    it('should find item by id and variant', () => {
      const result = selectCartItemById(state, 3, 'color-red');
      expect(result).toEqual(state.cart.items[2]);
    });
  });
}); 