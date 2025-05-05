// Set the test environment
process.env.NODE_ENV = 'test';

// Mock models
jest.mock('../src/models', () => {
  return require('./mocks/models');
});

// Setup environment variables needed for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Use in-memory SQLite database for tests if not already configured
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'sqlite::memory:';
}

// Add more environment variables as needed for testing

// Set up global jest matchers or helpers if needed
// For example:
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Silence console logs during testing
// Uncomment these lines to suppress console output during tests
// const originalConsoleLog = console.log;
// const originalConsoleError = console.error;
// const originalConsoleWarn = console.warn;
// 
// console.log = jest.fn();
// console.error = jest.fn();
// console.warn = jest.fn();
// 
// // Restore console functions after tests complete
// afterAll(() => {
//   console.log = originalConsoleLog;
//   console.error = originalConsoleError;
//   console.warn = originalConsoleWarn;
// }); 