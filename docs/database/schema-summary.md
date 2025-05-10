# Neon PostgreSQL Database Schema Summary

This document provides a summary of the database schema for the AliTools B2B E-commerce platform based on the Neon PostgreSQL database exploration conducted on November 29, 2023.

## Tables Overview

The database contains 18 tables:

1. SequelizeMeta
2. addresses
3. carts
4. categories
5. company_info
6. customers
7. images
8. order_items
9. orders
10. prices
11. producers
12. products
13. shipments
14. stock
15. sync_health
16. units
17. users
18. variants

## Key Tables Structure

### Products Table

The `products` table stores information about all products in the system.

**Columns:**
- `id` (integer, PK) - Auto-incrementing product identifier
- `code` (text) - Product code, indexed for fast lookups
- `code_on_card` (text, nullable) - Product code displayed on the card
- `ean` (text, nullable, unique) - European Article Number, unique product identifier
- `producer_code` (text, nullable) - Manufacturer's product code
- `name` (text) - Product name, indexed for searches
- `description_long` (text, nullable) - Detailed product description
- `description_short` (text, nullable) - Brief product description
- `vat` (numeric(5,2), nullable) - Value Added Tax percentage
- `delivery_date` (timestamp with timezone, nullable) - Expected delivery date
- `url` (text, nullable) - URL to the product page
- `created_at` (timestamp with timezone) - Record creation timestamp
- `updated_at` (timestamp with timezone) - Record update timestamp

**Indexes:**
- Primary Key on `id`
- Unique index on `ean`
- Non-unique indexes on `code`, `name`, and `ean`

### Categories Table

The `categories` table organizes products into a hierarchical category structure.

**Columns:**
- `id` (text, PK) - Category identifier
- `name` (text) - Category name
- `path` (text, nullable) - Category hierarchy path
- `created_at` (timestamp with timezone) - Record creation timestamp
- `updated_at` (timestamp with timezone) - Record update timestamp

**Indexes:**
- Primary Key on `id`

## Relationships

Based on database structure conventions, the following relationships likely exist:

1. Products belong to Categories (many-to-many relationship via a join table)
2. Products have Prices (one-to-many)
3. Products have Variants (one-to-many)
4. Products have Images (one-to-many)
5. Products belong to Producers (many-to-one)
6. Orders contain Products via order_items (many-to-many)
7. Customers place Orders (one-to-many)
8. Customers have Addresses (one-to-many)
9. Orders have Shipments (one-to-one or one-to-many)

## Database Status

During our exploration, we found that the tables exist but contain no data (all tables had 0 rows). This suggests the database schema is set up but not yet populated with production data.

## Connection Information

The Neon PostgreSQL database can be accessed using the following connection string format:

```
postgres://neondb_owner:password@ep-young-scene-abkud0t0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

Connection requires SSL to be enabled with the following Sequelize configuration:

```javascript
{
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
}
```

## Migration Status

The `SequelizeMeta` table suggests that database migrations are managed using Sequelize ORM's migration system. This table tracks which migrations have been applied to the database.

---

*This document was generated from the database exploration scripts in docs/database/. Run these scripts to get the most up-to-date information about the database structure.* 