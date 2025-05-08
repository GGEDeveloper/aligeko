# Database Documentation

This directory contains documentation related to the database structure and configuration for the AliTools B2B platform.

## Key Documents

- [Database Schema](./database-schema.md) - Complete database schema with tables, fields, constraints and relationships
- [Database Indexes](./database-indexes.md) - Index configurations for optimizing database performance
- [Seed Data](./seed-data.md) - Information about sample data generation for development and testing
- [Data Scraper](./data-scraper.md) - Documentation for the tools used to import and scrape product data

## Database Entity Relationship Quick Reference

```
products <-- variants <-- prices
    ^          ^
    |          |
    v          v
categories    stock
    
producers --> products
    
products --> images
```

## Primary Tables Overview

| Table Name | Description | Main Fields |
|------------|-------------|------------|
| products | Core product information | id, code, name, description |
| categories | Product categories | id, name, path |
| variants | Product variations | id, product_id, code, weight |
| prices | Pricing information | id, variant_id, gross_price, net_price |
| stock | Inventory quantities | id, variant_id, warehouse_id, quantity |
| producers | Manufacturers | id, name |
| images | Product images | id, product_id, url |

## Database Conventions

- All tables include `created_at` and `updated_at` timestamps
- Primary keys are named `id` throughout the database
- Foreign keys follow the pattern `table_id` (e.g., `product_id`)
- Text fields use `TEXT` data type rather than `VARCHAR` for flexibility
- Price fields use `NUMERIC(10,2)` for precision
- Most relationships are maintained through foreign keys with appropriate constraints 