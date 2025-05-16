---
trigger: model_decision
description: api
globs: 
---
# API Authentication Best Practices

This document outlines the standard authentication practices for the AliTools B2B E-commerce platform, with a focus on distinguishing between public and protected routes.

## Authentication Middleware

The platform uses JWT (JSON Web Token) authentication with middleware to protect routes. The `auth.middleware.js` file contains the core authentication logic.

### Public vs. Protected Routes

**Public Routes:**
Public routes are accessible without authentication and include:

```javascript
const PUBLIC_ROUTES = [
  '/api/v1/products',          // Product listing and details
  '/api/v1/auth/login',        // User login
  '/api/v1/auth/register',     // User registration
  '/api/v1/company-info',      // Company information
  '/health'                    // Health check endpoint
];
```

**Protected Routes:**
All other routes are protected and require authentication. This includes:
- Order management (`/api/v1/orders`)
- Customer management (`/api/v1/customers`)
- Admin operations
- Any route not explicitly listed in `PUBLIC_ROUTES`

## Implementing Authentication

### ✅ DO: Skip auth check for public routes

```javascript
// Correct implementation with public routes checking
export const checkAuth = async (req, res, next) => {
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    return req.path === route || 
          (req.path.startsWith(route + '/') && req.method === 'GET');
  });

  if (isPublicRoute) {
    return next();
  }

  // Continue with authentication logic for protected routes
  // ...
}
```

### ❌ DON'T: Apply auth middleware to all routes indiscriminately

```javascript
// Incorrect: This would apply authentication to all routes
app.use(authMiddleware.checkAuth);

// Incorrect: Individual route without checking if it should be public
router.get('/', authMiddleware.checkAuth, productController.getAllProducts);
```

### ✅ DO: Document authentication requirements in route files

```javascript
/**
 * @route   GET /api/v1/products
 * @desc    Get all products with pagination
 * @access  Public
 */
router.get('/', productController.getAllProducts);

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin only)
 */
router.post('/', isAuthenticated, isAdmin, productController.createProduct);
```

## JWT Token Management

### Token Generation

```javascript
// Generate access token with appropriate expiration
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
};
```

### Token Verification

```javascript
// Verify token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
```

## Role-Based Access Control

The platform implements RBAC with middleware functions:

```javascript
// Check if user has required role
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage example
router.put('/:id', isAuthenticated, checkRole(['admin']), controller.updateItem);
```

## Testing Authentication

Always test both authenticated and unauthenticated access to API endpoints:

1. **Public Routes**: Should return 200 OK without authentication
2. **Protected Routes**: Should return 401 Unauthorized without authentication
3. **Role-Specific Routes**: Should return 403 Forbidden with incorrect role

Example test:
```javascript
// Test public access
await testEndpoint('/api/v1/products');  // Should return 200 OK

// Test protected access without auth
await testEndpoint('/api/v1/orders');  // Should return 401 Unauthorized

// Test protected access with auth
await testEndpoint('/api/v1/orders', 'GET', validToken);  // Should return 200 OK
```

## Common Issues and Solutions

### 401 Unauthorized on Public Routes

If public routes are returning 401 errors:
- Check if route is included in `PUBLIC_ROUTES` list
- Verify middleware is checking for public routes before token validation
- Check the path matching logic in the isPublicRoute function

### 403 Forbidden Even with Valid Token

If protected routes return 403 with a valid token:
- Check user role against required roles
- Verify user account status (active, approved, etc.)
- Check for environment-specific issues (e.g., different roles in dev vs. prod)

## References

- [Authentication Flow](mdc:server/docs/authentication-flow.md)
- [Auth Controller](mdc:server/src/controllers/auth.controller.js)
- [Auth Middleware](mdc:server/src/middleware/auth.middleware.js)
