-- add-foreign-keys.sql
-- Script to add and populate missing foreign key columns to products table

-- 1. Add the foreign key columns to products table
ALTER TABLE products 
ADD COLUMN category_id TEXT,
ADD COLUMN producer_id INTEGER,
ADD COLUMN unit_id TEXT;

-- 2. Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_producer_id ON products(producer_id);
CREATE INDEX idx_products_unit_id ON products(unit_id);

-- 3. Link products to producers based on name patterns (will need manual review)
-- First, let's add constraints for each producer
-- Note: This is an example for GEKO products, similar updates would be needed for other producers
UPDATE products
SET producer_id = (SELECT id FROM producers WHERE name = 'GEKO')
WHERE name ILIKE '%GEKO%';

-- 4. Link products to categories based on best matching category name
-- Note: This is a simplified approach. A more sophisticated algorithm might be needed for production
UPDATE products p
SET category_id = 
    (SELECT c.id 
     FROM categories c 
     WHERE p.name ILIKE '%' || c.name || '%'
     ORDER BY length(c.name) DESC 
     LIMIT 1)
WHERE p.category_id IS NULL;

-- 5. For products that couldn't be matched, use the 'uncategorized' category
UPDATE products
SET category_id = 'uncategorized'
WHERE category_id IS NULL;

-- 6. Add foreign key constraints after populating the data
ALTER TABLE products 
ADD CONSTRAINT fk_products_category_id FOREIGN KEY (category_id) REFERENCES categories(id),
ADD CONSTRAINT fk_products_producer_id FOREIGN KEY (producer_id) REFERENCES producers(id),
ADD CONSTRAINT fk_products_unit_id FOREIGN KEY (unit_id) REFERENCES units(id);

-- 7. Create stocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES variants(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT false,
  min_order_quantity INTEGER NOT NULL DEFAULT 1,
  warehouse_location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create prices table if it doesn't exist
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES variants(id),
  gross_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  net_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create default stock records for all variants that don't have them
INSERT INTO stocks (variant_id, quantity, available, min_order_quantity, created_at, updated_at)
SELECT 
  v.id, 
  0, 
  false, 
  1, 
  now(), 
  now()
FROM variants v
LEFT JOIN stocks s ON s.variant_id = v.id
WHERE s.id IS NULL;

-- 10. Create default price records for all variants that don't have them
INSERT INTO prices (variant_id, gross_price, net_price, created_at, updated_at)
SELECT 
  v.id, 
  0.00, 
  0.00, 
  now(), 
  now()
FROM variants v
LEFT JOIN prices p ON p.variant_id = v.id
WHERE p.id IS NULL;

-- 11. Create a view for easily querying product details with all relationships
CREATE OR REPLACE VIEW product_details AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.description_long,
  p.description_short,
  p.ean,
  c.id AS category_id,
  c.name AS category_name,
  c.path AS category_path,
  pr.id AS producer_id,
  pr.name AS producer_name,
  u.id AS unit_id,
  u.name AS unit_name,
  v.id AS variant_id,
  v.code AS variant_code,
  s.quantity,
  s.available,
  s.min_order_quantity,
  COALESCE(pri.gross_price, 0.00) AS price,
  COALESCE(pri.net_price, 0.00) AS price_net
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN producers pr ON p.producer_id = pr.id
LEFT JOIN units u ON p.unit_id = u.id
LEFT JOIN variants v ON v.product_id = p.id
LEFT JOIN stocks s ON s.variant_id = v.id
LEFT JOIN prices pri ON pri.variant_id = v.id;

-- Query example to test the view:
-- SELECT * FROM product_details LIMIT 10; 