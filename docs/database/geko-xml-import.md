# GEKO XML Import Documentation

## Overview

This document details the process of importing product data from GEKO XML files into the AliTools B2B platform database. The import script is designed for one-time use to populate the initial product catalog.

## XML Format

- Format: IOF format version 2.6 with UTF-8 encoding
- Contains approximately 8,155 products with variants, prices, and images
- Root structure may appear as `<geko>`, `<offer>`, or direct product entries

## Database Schema Mapping

The XML data is mapped to the following database tables:

| XML Element/Attribute | Database Table | Database Column |
|--|--|--|
| `product.code` | products | code |
| `product.name` | products | name |
| `product.description` | products | description_long |
| `product.short_description` | products | description_short |
| `product.code` | variants | code |
| `product.weight` | variants | weight |
| `product.gross_weight` | variants | gross_weight |
| Product ID reference | variants | product_id |
| `product.price` | prices | gross_price, net_price |
| `product.url` (image URL) | images | url |

## Import Process

### Prerequisites

1. PostgreSQL database with the correct schema
2. Environment variables set in `.env` file:
   - `NEON_DB_URL`: PostgreSQL connection string
   - `NODE_ENV`: Environment (development, production)

### Import Steps

1. **Parse XML**: Convert XML to JavaScript objects
2. **Transform Data**: Map XML elements to database structure
3. **Import Data**:
   - Products
   - Variants (linked to products)
   - Prices (linked to variants)
   - Images (linked to products)

### Running the Import

```bash
# From the server/src/scripts directory
node direct-import-xml.js "../../../geko_products_en.xml"
```

## Troubleshooting

### Common Issues

1. **Validation Errors**: Usually due to:
   - Missing required fields (code, name)
   - Foreign key constraints
   - Incorrect data types

2. **Database Connection Issues**:
   - Check environment variables
   - Verify SSL settings
   - Run `test-db-connection.js` to validate connection

3. **Schema Mismatch**:
   - Run `check-table-schema.js` to inspect database schema
   - Ensure model definitions match actual database schema

### Solutions Implemented

1. **Simplified Model Approach**:
   - Start with minimal fields (code, name)
   - Add remaining fields once basic import is working
   - Handle foreign keys carefully

2. **Batch Processing**:
   - Import data in small batches (10-100 records)
   - Provides better error handling and progress tracking

3. **Transaction Management**:
   - Use transactions to ensure data consistency
   - Implement proper rollback on error

## Current Status

- Successfully imported 8,155 products
- Successfully imported 8,155 variants with product relationships
- Pending: Price and image import completion

## Next Steps

1. Complete price information import
2. Import product images
3. Add deduplication logic for future updates
4. Add validation and data cleaning for product information 