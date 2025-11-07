-- Add stock_quantity column to the products table if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0;
