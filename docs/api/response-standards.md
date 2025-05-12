# API Response Standards

This document outlines the standard format for API responses in the AliTools B2B E-commerce platform to ensure consistency, proper error handling, and data validation across all endpoints.

## Standard Success Response Format

All API endpoints should follow this standard response format for successful requests:

```json
{
  "success": true,
  "data": {
    // For collection endpoints
    "items": [ ... ],  // Always an array, even for single items
    "meta": {
      "totalItems": 0,  // Total count of all available items
      "totalPages": 1,  // Total number of pages
      "currentPage": 1,  // Current page number
      "itemsPerPage": 10  // Number of items per page
    }
    
    // OR for single resource endpoints
    "item": { ... }  // Single object
  }
}
```

## Standard Error Response Format

Error responses should follow this format:

```json
{
  "success": false,
  "error": "Brief error description",
  "details": "More detailed explanation when available",
  "code": "ERROR_CODE",  // Optional error code
  "validationErrors": [  // Optional field validation errors
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Key Principles

### 1. Consistency in Return Types

- **Collections should always be arrays** - Even when filtering returns a single item
- Always use `Array.isArray(data) ? data : [data].filter(Boolean)` to ensure arrays

### 2. Type Validation

- Implement input/output validation with a schema validation library (e.g., Joi, Zod)
- Validate response formats before sending them to clients

### 3. Error Handling

- Always catch exceptions and return proper error responses
- Use HTTP status codes appropriately (200, 201, 400, 401, 403, 404, 500)
- Include specific error details when safe to do so

### 4. Pagination

- All collection endpoints must support pagination
- Always include metadata about total counts and pages
- Use consistent pagination parameters (`page`, `limit`)

## Implementation Best Practices

### Response Wrapper Utility

```javascript
// responseUtils.js
export const createSuccessResponse = (data, meta = null) => {
  // For collection responses
  if (Array.isArray(data)) {
    return {
      success: true,
      data: {
        items: data,
        meta: meta || {
          totalItems: data.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: data.length
        }
      }
    };
  }
  
  // For single item responses
  return {
    success: true,
    data: {
      item: data
    }
  };
};

export const createErrorResponse = (error, details = null, code = null, validationErrors = null) => {
  return {
    success: false,
    error: error,
    ...(details && { details }),
    ...(code && { code }),
    ...(validationErrors && { validationErrors })
  };
};
```

### Schema Validation Example

```javascript
import Joi from 'joi';
import { createErrorResponse } from '../utils/responseUtils.js';

// Define schema for product request
const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().allow('').optional(),
  category_id: Joi.number().required()
});

// Validation middleware
export const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json(
      createErrorResponse(
        'Validation failed',
        'The product data did not pass validation',
        'VALIDATION_ERROR',
        validationErrors
      )
    );
  }
  
  next();
};
```

### Client-Side Handling

On the client side, always check the `success` flag and handle data appropriately:

```javascript
// Redux Toolkit Query example
transformResponse: (response) => {
  // Check for success flag
  if (response && response.success === true) {
    if (response.data.items) {
      // Ensure items is always an array
      const items = Array.isArray(response.data.items) 
        ? response.data.items 
        : [response.data.items].filter(Boolean);
      
      return {
        data: {
          items,
          meta: response.data.meta || {}
        }
      };
    } else if (response.data.item) {
      return {
        data: {
          item: response.data.item
        }
      };
    }
  }
  
  // Return error data for unsuccessful responses
  return {
    error: response?.error || 'Unknown error',
    details: response?.details || '',
    code: response?.code
  };
}
```

## Common Response Patterns

### Collection Response

```javascript
app.get('/api/v1/products', async (req, res) => {
  try {
    // Get products from database...
    const products = await getProducts();
    const totalItems = await countProducts();
    
    // Always ensure products is an array
    const productsArray = Array.isArray(products) ? products : [products].filter(Boolean);
    
    res.json({
      success: true,
      data: {
        items: productsArray,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});
```

### Single Resource Response

```javascript
app.get('/api/v1/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: {
        item: product
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message
    });
  }
});
```

## Error Response Examples

### Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": "The product data did not pass validation",
  "code": "VALIDATION_ERROR",
  "validationErrors": [
    {
      "field": "name",
      "message": "Product name is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### Resource Not Found

```json
{
  "success": false,
  "error": "Product not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Failed to fetch products",
  "details": "Database connection timeout"
}
```

## Testing API Responses

Create automated tests to verify API response formats:

```javascript
// Test example
test('Products endpoint returns correct format', async () => {
  const response = await request(app).get('/api/v1/products');
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(Array.isArray(response.body.data.items)).toBe(true);
  expect(response.body.data.meta).toBeDefined();
  expect(typeof response.body.data.meta.totalItems).toBe('number');
});
```

## Handling Database Results

When working with database results:

1. Always check if results are in the expected format
2. Convert single items to arrays when returning collections
3. Handle null/undefined values gracefully

```javascript
// Database results handling
const processQueryResults = (results) => {
  if (!results) return [];
  return Array.isArray(results) ? results : [results].filter(Boolean);
};
```

---

By following these standards, we maintain consistency across our API and minimize errors related to incorrect data formats or improper error handling. 