# AliTools B2B E-commerce Testing Guide

This document provides instructions for running tests and understanding the test coverage for the AliTools B2B E-commerce platform.

## Client-Side Testing

The client-side application uses Vitest and React Testing Library for testing React components and Redux store.

### Test Structure

- **Unit Tests**: Test individual components, hooks, and redux slices in isolation
  - Located in `client/src/tests/unit`
  - Examples include testing Redux reducers, selectors, and simple components

- **Integration Tests**: Test interactions between multiple components or larger workflows
  - Located in `client/src/tests/integration`
  - Examples include testing the checkout flow and API interactions

### Running Client Tests

To run tests, navigate to the client directory:

```bash
cd client
```

Then run one of the following commands:

```bash
# Run all tests
npm test

# Run tests and watch for changes
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate test coverage report
npm run test:coverage
```

After running the coverage command, you can view the coverage report in `client/coverage/index.html`.

## Server-Side Testing

The server-side application uses Mocha, Chai, and Sinon for testing API endpoints, controllers, and services.

### Test Structure

- **Unit Tests**: Test individual functions and methods in isolation
  - Located in `server/tests/unit`
  - Examples include testing controller methods with mocked database interactions

- **Integration Tests**: Test complete API endpoints with database operations
  - Located in `server/tests/integration`
  - Examples include testing API endpoints with a test database

### Running Server Tests

To run tests, navigate to the server directory:

```bash
cd server
```

Then run one of the following commands:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate test coverage report
npm run test:coverage
```

After running the coverage command, you can view the coverage report in `server/coverage/index.html`.

## Cart and Checkout Testing (Task 8.8)

The cart and checkout flow has comprehensive tests covering:

### Client Testing

1. **Redux Store Testing**
   - Cart slice reducers and selectors
   - Action creators and state management
   - Local storage persistence

2. **API Interaction Testing**
   - Cart API endpoints
   - Order placement API
   - Error handling

3. **Checkout Flow Integration Testing**
   - Multi-step form navigation
   - Form validation
   - Order submission process
   - Redirect to success page

4. **Order Confirmation Testing**
   - Order details display
   - Receipt print functionality
   - Tracking information

### Server Testing

1. **Controller Unit Testing**
   - Order controller methods
   - Validation and error handling
   - Database operations

2. **API Endpoint Testing**
   - Cart endpoints
   - Order endpoints
   - Authorization checks

3. **Transaction and Data Integrity Testing**
   - Transaction handling
   - Inventory updates
   - Payment processing

## Continuous Integration

Tests are automatically run as part of the CI/CD pipeline. Pull requests must pass all tests before they can be merged.

## Writing New Tests

When adding new features, please follow these guidelines for writing tests:

1. **Write tests before implementing**: Follow TDD principles where possible
2. **Test edge cases**: Include tests for validation, errors, and edge cases
3. **Maintain independence**: Tests should be independent and not affect each other
4. **Use meaningful descriptions**: Test descriptions should clearly explain what's being tested
5. **Maintain coverage**: Aim for high test coverage on new code

For help with writing tests, refer to:
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Documentation](https://www.chaijs.com/)
- [Sinon Documentation](https://sinonjs.org/) 