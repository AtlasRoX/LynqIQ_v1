-- Create tables for LynqIQ Business Management System
-- Currency: Bangladeshi Taka (৳)

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(12, 2) NOT NULL,
  sell_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(14, 2) DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  canceled_orders INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(14, 2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Costs table
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(14, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Allow users to view their own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for customers
CREATE POLICY "Allow users to view their own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sales
CREATE POLICY "Allow users to view their own sales" ON sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert sales" ON sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own sales" ON sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own sales" ON sales FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for costs
CREATE POLICY "Allow users to view their own costs" ON costs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert costs" ON costs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own costs" ON costs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own costs" ON costs FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_product_id ON sales(product_id);
CREATE INDEX idx_costs_user_id ON costs(user_id);
CREATE INDEX idx_costs_date ON costs(date);
