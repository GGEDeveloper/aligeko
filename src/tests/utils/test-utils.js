import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { setupListeners } from '@reduxjs/toolkit/query';

/**
 * Creates a mock store for RTK Query API testing
 * 
 * @param {Object} api - The RTK Query api to test
 * @param {Object} extraReducers - Any additional reducers needed
 * @returns {Object} The configured store and api
 */
export function setupApiStore(api, extraReducers = {}, preloadedState = {}) {
  const getStore = () =>
    configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        ...extraReducers
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
      preloadedState
    });

  const initialStore = getStore();
  const refObj = {
    store: initialStore,
    api
  };

  setupListeners(initialStore.dispatch);

  return refObj;
}

/**
 * Helper to mock a successful response for fetch
 * 
 * @param {Object} data - The data to return in the response
 * @returns {Object} A mocked response object
 */
export function createMockResponse(data = {}, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  };
}

/**
 * Helper to mock a failed response
 * 
 * @param {number} status - HTTP status code
 * @param {string} statusText - Error message
 * @returns {Object} A mocked error response
 */
export function createErrorResponse(status = 500, statusText = 'Internal Server Error') {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({ error: statusText }),
  };
}

/**
 * Creates a mock for localStorage
 * 
 * @returns {Object} A mock implementation of localStorage
 */
export function createLocalStorageMock() {
  let store = {};
  return {
    getItem: vi.fn((key) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getAll: () => store,
    length: Object.keys(store).length
  };
}

/**
 * Creates a mock for sessionStorage
 * 
 * @returns {Object} A mock implementation of sessionStorage
 */
export function createSessionStorageMock() {
  let store = {};
  return {
    getItem: vi.fn((key) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getAll: () => store,
    length: Object.keys(store).length
  };
}

/**
 * Custom render for components with Redux store
 * 
 * @param {ReactNode} ui - The component to render
 * @param {Object} options - Render options
 * @returns {Object} The rendered component and the store
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        // Add any reducers needed for testing
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
      preloadedState
    }),
    ...renderOptions
  } = {}
) {
  setupListeners(store.dispatch);

  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
  };
}

/**
 * Re-export everything from RTL
 */
export * from '@testing-library/react';

/**
 * Override the standard render method with our custom one
 * 
 * @param {ReactNode} ui - The component to render
 * @param {Object} options - Render options
 * @returns {Object} The rendered component and the store
 */
export function render(ui, options) {
  return renderWithProviders(ui, options);
}

/**
 * Mock window.URL.createObjectURL
 * 
 * @returns {Function} A function to restore the original createObjectURL
 */
export function mockCreateObjectURL() {
  const originalCreateObjectURL = global.URL.createObjectURL;
  global.URL.createObjectURL = vi.fn(() => 'mock-object-url');

  return () => {
    global.URL.createObjectURL = originalCreateObjectURL;
  };
}

/**
 * Helper to mock Redux hooks
 * 
 * @param {any} mockReturnValue - The value to return for the mocked useSelector
 * @returns {void}
 */
export const mockUseSelector = (mockReturnValue) => {
  vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
      ...actual,
      useSelector: vi.fn().mockImplementation(() => mockReturnValue)
    };
  });
};

/**
 * Helper to mock Redux dispatch
 * 
 * @returns {Function} A mocked dispatch function
 */
export const mockUseDispatch = () => {
  const mockDispatch = vi.fn();
  vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
      ...actual,
      useDispatch: () => mockDispatch
    };
  });
  return mockDispatch;
}; 