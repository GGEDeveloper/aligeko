# PostgreSQL Database Schema Specification

This document provides a detailed description of all tables, fields, data types, primary keys, foreign keys, and relationships required for the **Ali Tools B2B E-commerce** project.

---

## 1. Table `products`

Stores the core data for each product.

| Column              | Type         | Constraints                                             | Description                           |
|---------------------|--------------|---------------------------------------------------------|---------------------------------------|
| `id`                | SERIAL       | PRIMARY KEY                                             | Unique product identifier            |
| `code`              | TEXT         | NOT NULL                                                | Internal code                        |
| `code_on_card`      | TEXT         |                                                         | Code displayed in the catalog        |
| `ean`               | TEXT         | UNIQUE                                                  | Barcode (EAN)                        |
| `producer_code`     | TEXT         |                                                         | Producer's code                      |
| `name`              | TEXT         | NOT NULL                                                | Product name                         |
| `description_long`  | TEXT         |                                                         | Detailed description (HTML)          |
| `description_short` | TEXT         |                                                         | Brief description (HTML)             |
| `description_html`  | TEXT         |                                                         | Additional full description field     |
| `vat`               | NUMERIC(5,2) |                                                         | VAT percentage                       |
| `delivery_date`     | DATE         |                                                         | Delivery date (if applicable)        |
| `url`               | TEXT         |                                                         | Link to the product's external page  |
| `created_at`        | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                              | Record creation timestamp            |
| `updated_at`        | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp         |

## 2. Table `categories`

Stores hierarchical product categories.

| Column       | Type   | Constraints  | Description                        |
|--------------|--------|--------------|------------------------------------|
| `id`         | TEXT   | PRIMARY KEY  | Unique category identifier         |
| `name`       | TEXT   | NOT NULL     | Category name                      |
| `path`       | TEXT   |              | Hierarchical category path         |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp      |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 3. Table `producers`

Stores product manufacturers.

| Column       | Type   | Constraints       | Description                        |
|--------------|--------|-------------------|------------------------------------|
| `id`         | SERIAL | PRIMARY KEY       | Unique producer identifier         |
| `name`       | TEXT   | NOT NULL, UNIQUE  | Manufacturer name                  |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp      |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 4. Table `units`

Defines units of measure and MOQ (minimum order quantity).

| Column       | Type    | Constraints  | Description                             |
|--------------|---------|--------------|-----------------------------------------|
| `id`         | TEXT    | PRIMARY KEY  | Unit identifier                         |
| `name`       | TEXT    | NOT NULL     | Unit name (e.g., pcs, kpl)              |
| `moq`        | INTEGER | NOT NULL     | Minimum order quantity                  |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp      |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 5. Table `variants`

Product variations (by size, color, etc.).

| Column         | Type    | Constraints                           | Description                           |
|----------------|---------|---------------------------------------|---------------------------------------|
| `id`           | SERIAL  | PRIMARY KEY                           | Unique variant identifier             |
| `product_id`   | INTEGER | NOT NULL, FOREIGN KEY → products(id)  | Reference to parent product           |
| `code`         | TEXT    | NOT NULL                              | Variant code                          |
| `weight`       | NUMERIC |                                       | Net weight (in grams)                 |
| `gross_weight` | NUMERIC |                                       | Gross weight (in grams)               |
| `created_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP         | Record creation timestamp            |
| `updated_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 6. Table `stock`

Quantity of each variant available in each warehouse.

| Column         | Type    | Constraints                           | Description                                  |
|----------------|---------|---------------------------------------|----------------------------------------------|
| `id`           | SERIAL  | PRIMARY KEY                           | Unique stock record identifier               |
| `variant_id`   | INTEGER | NOT NULL, FOREIGN KEY → variants(id)  | Reference to variant                         |
| `warehouse_id` | TEXT    | NOT NULL                              | Warehouse identifier                         |
| `quantity`     | INTEGER | NOT NULL                              | Available quantity                           |
| `created_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP         | Record creation timestamp                   |
| `updated_at`   | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 7. Table `prices`

Prices for each variant, including SRP.

| Column        | Type          | Constraints                           | Description                                |
|---------------|---------------|---------------------------------------|--------------------------------------------|
| `id`          | SERIAL        | PRIMARY KEY                           | Unique price record identifier             |
| `variant_id`  | INTEGER       | NOT NULL, FOREIGN KEY → variants(id)  | Reference to variant                       |
| `gross_price` | NUMERIC(10,2) | NOT NULL                              | Gross price                                |
| `net_price`   | NUMERIC(10,2) | NOT NULL                              | Net price                                  |
| `srp_gross`   | NUMERIC(10,2) |                                       | Gross SRP (optional)                       |
| `srp_net`     | NUMERIC(10,2) |                                       | Net SRP (optional)                         |
| `created_at`  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP           | Record creation timestamp                  |
| `updated_at`  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

## 8. Table `images`

URLs of images associated with each product.

| Column       | Type    | Constraints                           | Description                           |
|--------------|---------|---------------------------------------|---------------------------------------|
| `id`         | SERIAL  | PRIMARY KEY                           | Unique image identifier               |
| `product_id` | INTEGER | NOT NULL, FOREIGN KEY → products(id)  | Reference to product                  |
| `url`        | TEXT    | NOT NULL                              | Image URL                             |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP          | Record creation timestamp            |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record last update timestamp |

---

### Indexes and Performance

- **Index on `products(name)`** for fast searches.
- **Composite index on `variants(product_id, code)`** for variant lookups.
- **Index on `stock(variant_id)`** for stock queries.

---

### Considerations

- Use `ON CONFLICT DO NOTHING` during import operations to avoid duplication.
- Apply format validations (regex) for `ean` and URLs before insertion.
- Normalize text fields (trim, escape HTML) as needed.
- Ensure all tables include `created_at` and `updated_at` columns to support temporal queries and auditing, as required by `rules.database.timestamp_guidelines`. These timestamps facilitate tracking record history and debugging data issues.

---