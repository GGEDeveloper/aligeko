---
trigger: manual
description:
globs:
---
# XML Import Guidelines

## General Guidelines

- All XML import functionality should be placed in `server/src/scripts` directory
- Use ES modules (import/export) for all import scripts
- Data processing logic should be separated from database operations
- Always use transactions for database operations to ensure consistency

## XML Parser Usage

When parsing XML files, use the following approach:

```javascript
import { parse } from '../utils/geko-xml-parser.js';

// Parse XML data
const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
const transformedData = await parse(xmlData);
```

## Database Operations

Always use transactions and error handling:

```javascript
const transaction = await sequelize.transaction();

try {
  // Database operations here...
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## Batch Processing

For large datasets, use batch processing:

```javascript
const BATCH_SIZE = 100;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(item => Model.create(item, { transaction })));
}
```

## Error Handling

Implement comprehensive error handling:

```javascript
try {
  // Operation
} catch (error) {
  console.error(`Operation failed: ${error.message}`);
  if (error.errors) {
    error.errors.forEach(err => {
      console.error(`- Validation error on ${err.path}: ${err.message}`);
    });
  }
  throw error;
}
```

## Simplified Model Pattern

For complex imports with validation issues, use the simplified model pattern:

1. Start with minimal fields (only required ones)
2. Create simplified objects with only required fields
3. Gradually add more fields once basic import works

Example:
```javascript
// Create a simplified product with only required fields
const simplifiedProduct = {
  code: product.code,
  name: product.name || 'Unnamed Product'
};

return await models.Product.create(simplifiedProduct, { transaction });
```
