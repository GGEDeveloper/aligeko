# Database Indexes Documentation

This document describes the database indexes implemented for the AliTools B2B E-commerce platform to optimize query performance.

## Implemented Indexes

### Required Indexes (from database_schema.markdown)

1. **Product Name Index**
   - **Table**: `products`
   - **Columns**: `name`
   - **Index Name**: `idx_products_name`
   - **Purpose**: Enables fast text searches on product names, essential for product search functionality.
   - **Implementation**: Created in base migration file.

2. **Variant Composite Index**
   - **Table**: `variants`
   - **Columns**: `product_id, code`
   - **Index Name**: `idx_variants_product_id_code`
   - **Purpose**: Optimizes lookups of specific variants by product and variant code.
   - **Implementation**: Created in base migration file.

3. **Stock Variant Index**
   - **Table**: `stock`
   - **Columns**: `variant_id`
   - **Index Name**: `idx_stock_variant_id`
   - **Purpose**: Improves performance when querying stock levels for specific variants.
   - **Implementation**: Created in base migration file.

### Additional Optimization Indexes

4. **Price Variant Index**
   - **Table**: `prices`
   - **Columns**: `variant_id`
   - **Index Name**: `idx_prices_variant_id`
   - **Purpose**: Optimizes price lookups for specific variants.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

5. **Image Product Index**
   - **Table**: `images`
   - **Columns**: `product_id`
   - **Index Name**: `idx_images_product_id`
   - **Purpose**: Improves performance when retrieving images for a product.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

6. **Customer User Index**
   - **Table**: `customers`
   - **Columns**: `user_id`
   - **Index Name**: `idx_customers_user_id`
   - **Purpose**: Optimizes lookups of customer records by user ID.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

7. **Customer Tax ID Index**
   - **Table**: `customers`
   - **Columns**: `tax_id`
   - **Index Name**: `idx_customers_tax_id`
   - **Purpose**: Enables fast lookups by tax ID, which is frequently used in B2B environments.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

8. **Address Customer Index**
   - **Table**: `addresses`
   - **Columns**: `customer_id`
   - **Index Name**: `idx_addresses_customer_id`
   - **Purpose**: Optimizes retrieval of all addresses for a customer.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

9. **Address Customer Type Default Index**
   - **Table**: `addresses`
   - **Columns**: `customer_id, type, is_default`
   - **Index Name**: `idx_addresses_customer_defaults`
   - **Purpose**: Optimizes lookup of default shipping/billing addresses for a customer.
   - **Implementation**: Added in 20250516000001-add-additional-indexes.js

10. **Product Code Index**
    - **Table**: `products`
    - **Columns**: `code`
    - **Index Name**: `idx_products_code`
    - **Purpose**: Enables fast lookups by product code, which is frequently used in B2B environments.
    - **Implementation**: Added in 20250516000001-add-additional-indexes.js

11. **Product EAN Index**
    - **Table**: `products`
    - **Columns**: `ean`
    - **Index Name**: `idx_products_ean`
    - **Purpose**: Enables fast lookups by EAN code, used for barcode scanning and product identification.
    - **Implementation**: Added in 20250516000001-add-additional-indexes.js

12. **Stock Warehouse Index**
    - **Table**: `stock`
    - **Columns**: `warehouse_id`
    - **Index Name**: `idx_stock_warehouse_id`
    - **Purpose**: Optimizes queries to find all stock in a specific warehouse.
    - **Implementation**: Added in 20250516000001-add-additional-indexes.js

### Order Related Indexes

13. **Order Customer Index**
    - **Table**: `orders`
    - **Columns**: `customer_id`
    - **Index Name**: `idx_orders_customer_id`
    - **Purpose**: Optimizes queries to find all orders for a specific customer.
    - **Implementation**: Created in base migration file.

14. **Order Number Index**
    - **Table**: `orders`
    - **Columns**: `order_number`
    - **Index Name**: `idx_orders_order_number`
    - **Purpose**: Enables fast lookups by order number.
    - **Implementation**: Created in base migration file.

15. **Order Item Order Index**
    - **Table**: `order_items`
    - **Columns**: `order_id`
    - **Index Name**: `idx_order_items_order_id`
    - **Purpose**: Optimizes retrieval of all items for a specific order.
    - **Implementation**: Created in base migration file.

16. **Order Item Variant Index**
    - **Table**: `order_items`
    - **Columns**: `variant_id`
    - **Index Name**: `idx_order_items_variant_id`
    - **Purpose**: Optimizes queries to find all order items for a specific variant.
    - **Implementation**: Created in base migration file.

17. **Shipment Order Index**
    - **Table**: `shipments`
    - **Columns**: `order_id`
    - **Index Name**: `idx_shipments_order_id`
    - **Purpose**: Optimizes retrieval of all shipments for a specific order.
    - **Implementation**: Created in base migration file.

18. **Shipment Tracking Number Index**
    - **Table**: `shipments`
    - **Columns**: `tracking_number`
    - **Index Name**: `idx_shipments_tracking_number`
    - **Purpose**: Enables fast lookups by tracking number.
    - **Implementation**: Created in base migration file.

## Testing Indexes

To verify that the database is using the indexes correctly, a test script has been created at `server/src/scripts/test-indexes.js`. This script runs EXPLAIN ANALYZE queries to check if PostgreSQL is using the indexes as expected.

Run the test with:

```bash
npm run db:test-indexes
```

The script tests several key indexes and outputs the query execution plan, which should confirm that indexes are being used.

## Recommendations for Future Optimization

1. **Monitor query performance** during development and production use to identify any slow queries that might benefit from additional indexes.

2. **Consider index maintenance** - Add the following maintenance tasks to a regular schedule:
   - `REINDEX`: Rebuilds indexes to improve performance after many updates.
   - `VACUUM ANALYZE`: Updates table statistics to help the query planner make better decisions.

3. **Avoid over-indexing** - Each index adds overhead to write operations, so only add indexes that support actual query patterns.

4. **Consider partial indexes** for tables with specific query patterns on a subset of rows. 