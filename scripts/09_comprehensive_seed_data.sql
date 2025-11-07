-- Replace auth.uid() with actual user ID from auth.users table
-- Get the first authenticated user ID
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first user from auth.users table
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, exit gracefully
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No authenticated user found. Please ensure at least one user exists in auth.users';
    RETURN;
  END IF;

  -- Insert 50 Products
  INSERT INTO products (user_id, name, category, cost_price, sell_price, stock_quantity) VALUES
    (v_user_id, 'Premium Laptop Pro', 'Electronics', 45000.00, 75000.00, 15),
    (v_user_id, 'Flagship Smartphone X', 'Electronics', 28000.00, 45000.00, 25),
    (v_user_id, 'Wireless Earbuds Elite', 'Electronics', 3500.00, 6500.00, 50),
    (v_user_id, 'Smart Watch Pro', 'Electronics', 8000.00, 14000.00, 35),
    (v_user_id, 'Portable Speaker Deluxe', 'Electronics', 4500.00, 8000.00, 40),
    (v_user_id, 'USB Hub Multi-port', 'Electronics', 2000.00, 3800.00, 70),
    (v_user_id, 'Gaming Keyboard', 'Electronics', 3000.00, 5500.00, 60),
    (v_user_id, 'Wireless Mouse Premium', 'Electronics', 1500.00, 3000.00, 80),
    (v_user_id, 'Monitor 32 inch', 'Electronics', 12000.00, 20000.00, 10),
    (v_user_id, '4K Webcam', 'Electronics', 6000.00, 10000.00, 20),
    (v_user_id, 'Designer T-Shirt', 'Clothing', 800.00, 1500.00, 150),
    (v_user_id, 'Premium Jeans', 'Clothing', 2000.00, 4000.00, 80),
    (v_user_id, 'Cotton Polo Shirt', 'Clothing', 600.00, 1200.00, 200),
    (v_user_id, 'Winter Jacket Leather', 'Clothing', 5000.00, 10000.00, 25),
    (v_user_id, 'Sports Shorts', 'Clothing', 1000.00, 1800.00, 120),
    (v_user_id, 'Casual Sneakers', 'Clothing', 2500.00, 5000.00, 60),
    (v_user_id, 'Formal Shoes', 'Clothing', 3500.00, 7000.00, 40),
    (v_user_id, 'Winter Scarf', 'Clothing', 400.00, 900.00, 180),
    (v_user_id, 'Baseball Cap', 'Clothing', 300.00, 700.00, 200),
    (v_user_id, 'Sunglasses Polarized', 'Clothing', 1500.00, 3500.00, 70),
    (v_user_id, 'Programming Book', 'Books', 800.00, 1300.00, 100),
    (v_user_id, 'Business Novel', 'Books', 400.00, 700.00, 150),
    (v_user_id, 'History Encyclopedia', 'Books', 1200.00, 2000.00, 50),
    (v_user_id, 'Science Textbook', 'Books', 900.00, 1500.00, 80),
    (v_user_id, 'Self-Help Guide', 'Books', 500.00, 900.00, 120),
    (v_user_id, 'Fiction Novel', 'Books', 350.00, 600.00, 200),
    (v_user_id, 'Cookbook Premium', 'Books', 700.00, 1200.00, 90),
    (v_user_id, 'Art Coffee Table Book', 'Books', 2000.00, 3500.00, 30),
    (v_user_id, 'Biography Book', 'Books', 600.00, 1000.00, 110),
    (v_user_id, 'Poetry Collection', 'Books', 450.00, 800.00, 140),
    (v_user_id, 'Modern Sofa', 'Home Goods', 25000.00, 45000.00, 8),
    (v_user_id, 'Dining Table', 'Home Goods', 15000.00, 28000.00, 12),
    (v_user_id, 'Office Chair Ergonomic', 'Home Goods', 8000.00, 15000.00, 20),
    (v_user_id, 'Bed Frame King', 'Home Goods', 18000.00, 35000.00, 10),
    (v_user_id, 'Bookshelf Wooden', 'Home Goods', 5000.00, 9000.00, 25),
    (v_user_id, 'Coffee Table Modern', 'Home Goods', 6000.00, 11000.00, 18),
    (v_user_id, 'Wall Mounted Shelves', 'Home Goods', 2500.00, 4500.00, 40),
    (v_user_id, 'LED Ceiling Lamp', 'Home Goods', 3500.00, 6500.00, 35),
    (v_user_id, 'Standing Desk', 'Home Goods', 12000.00, 22000.00, 14),
    (v_user_id, 'Room Heater', 'Home Goods', 4000.00, 7500.00, 30),
    (v_user_id, 'Organic Apple Juice', 'Groceries', 120.00, 200.00, 500),
    (v_user_id, 'Whole Wheat Bread', 'Groceries', 80.00, 150.00, 400),
    (v_user_id, 'Free Range Eggs Dozen', 'Groceries', 150.00, 280.00, 300),
    (v_user_id, 'Organic Honey', 'Groceries', 300.00, 500.00, 200),
    (v_user_id, 'Almond Butter', 'Groceries', 250.00, 450.00, 250),
    (v_user_id, 'Coffee Beans Premium', 'Groceries', 400.00, 700.00, 180),
    (v_user_id, 'Olive Oil Extra Virgin', 'Groceries', 350.00, 600.00, 220),
    (v_user_id, 'Green Tea Box', 'Groceries', 200.00, 350.00, 350),
    (v_user_id, 'Dark Chocolate Bar', 'Groceries', 100.00, 200.00, 400),
    (v_user_id, 'Quinoa Organic', 'Groceries', 280.00, 500.00, 150);

  -- Insert 50 Customers
  INSERT INTO customers (user_id, name, phone, address, total_orders, total_spent) VALUES
    (v_user_id, 'Rajesh Kumar Singh', '01712345678', 'Dhaka', 0, 0.00),
    (v_user_id, 'Priya Sharma', '01823456789', 'Chittagong', 0, 0.00),
    (v_user_id, 'Arjun Patel', '01934567890', 'Sylhet', 0, 0.00),
    (v_user_id, 'Deepika Verma', '01645678901', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Vikram Desai', '01756789012', 'Khulna', 0, 0.00),
    (v_user_id, 'Anjali Gupta', '01867890123', 'Barisal', 0, 0.00),
    (v_user_id, 'Sanjay Rao', '01978901234', 'Rangpur', 0, 0.00),
    (v_user_id, 'Neha Singh', '01689012345', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Amit Kumar', '01700123456', 'Dhaka', 0, 0.00),
    (v_user_id, 'Ritika Iyer', '01811234567', 'Chittagong', 0, 0.00),
    (v_user_id, 'Rohan Kapoor', '01922345678', 'Sylhet', 0, 0.00),
    (v_user_id, 'Shreya Malhotra', '01633456789', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Nikhil Chatterjee', '01744567890', 'Khulna', 0, 0.00),
    (v_user_id, 'Pooja Saxena', '01855678901', 'Barisal', 0, 0.00),
    (v_user_id, 'Alok Mishra', '01966789012', 'Rangpur', 0, 0.00),
    (v_user_id, 'Sakshi Bhat', '01677890123', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Varun Nair', '01708901234', 'Dhaka', 0, 0.00),
    (v_user_id, 'Ananya Das', '01819012345', 'Chittagong', 0, 0.00),
    (v_user_id, 'Karthik Reddy', '01930123456', 'Sylhet', 0, 0.00),
    (v_user_id, 'Divya Pandey', '01641234567', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Suresh Menon', '01752345678', 'Khulna', 0, 0.00),
    (v_user_id, 'Meera Joshi', '01863456789', 'Barisal', 0, 0.00),
    (v_user_id, 'Abhishek Singh', '01974567890', 'Rangpur', 0, 0.00),
    (v_user_id, 'Swati Kumar', '01685678901', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Rahul Verma', '01796789012', 'Dhaka', 0, 0.00),
    (v_user_id, 'Kavya Sharma', '01807890123', 'Chittagong', 0, 0.00),
    (v_user_id, 'Aditya Gupta', '01918901234', 'Sylhet', 0, 0.00),
    (v_user_id, 'Isha Iyer', '01629012345', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Pranav Rao', '01740123456', 'Khulna', 0, 0.00),
    (v_user_id, 'Zara Khan', '01851234567', 'Barisal', 0, 0.00),
    (v_user_id, 'Manoj Singh', '01962345678', 'Rangpur', 0, 0.00),
    (v_user_id, 'Neha Desai', '01673456789', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Harsh Patel', '01784567890', 'Dhaka', 0, 0.00),
    (v_user_id, 'Palak Singh', '01895678901', 'Chittagong', 0, 0.00),
    (v_user_id, 'Rohit Malhotra', '01906789012', 'Sylhet', 0, 0.00),
    (v_user_id, 'Tanvi Kapoor', '01617890123', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Yash Pandey', '01728901234', 'Khulna', 0, 0.00),
    (v_user_id, 'Trisha Saxena', '01839012345', 'Barisal', 0, 0.00),
    (v_user_id, 'Aryan Sharma', '01940123456', 'Rangpur', 0, 0.00),
    (v_user_id, 'Simran Bhat', '01651234567', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Vipul Nair', '01762345678', 'Dhaka', 0, 0.00),
    (v_user_id, 'Aisha Ahmed', '01873456789', 'Chittagong', 0, 0.00),
    (v_user_id, 'Karan Reddy', '01984567890', 'Sylhet', 0, 0.00),
    (v_user_id, 'Jiya Menon', '01695678901', 'Rajshahi', 0, 0.00),
    (v_user_id, 'Vivek Kumar', '01806789012', 'Khulna', 0, 0.00),
    (v_user_id, 'Riya Joshi', '01917890123', 'Barisal', 0, 0.00),
    (v_user_id, 'Siddharth Das', '01628901234', 'Rangpur', 0, 0.00),
    (v_user_id, 'Sarika Singh', '01739012345', 'Mymensingh', 0, 0.00),
    (v_user_id, 'Bhavesh Gupta', '01840123456', 'Dhaka', 0, 0.00),
    (v_user_id, 'Divya Sharma', '01951234567', 'Chittagong', 0, 0.00);

  -- Insert 50 Sales transactions with diverse statuses and dates
  WITH sales_data AS (
    SELECT 
      v_user_id as user_id,
      ('2024-01-15'::DATE + (n * INTERVAL '3 days' - INTERVAL '1 year'))::DATE as sale_date,
      ROW_NUMBER() OVER (ORDER BY n) as rn,
      n
    FROM generate_series(0, 49) n
  ),
  customer_ids AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num FROM customers WHERE user_id = v_user_id
  ),
  product_ids AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num FROM products WHERE user_id = v_user_id
  )
  INSERT INTO sales (user_id, date, customer_id, product_id, quantity, unit_price, total_amount, status)
  SELECT 
    sd.user_id,
    sd.sale_date,
    (SELECT id FROM customer_ids WHERE row_num = ((sd.rn - 1) % 50) + 1),
    (SELECT id FROM product_ids WHERE row_num = ((sd.rn - 1) % 50) + 1),
    CASE WHEN sd.rn <= 10 THEN 1 ELSE (2 + (sd.n % 3))::INT END,
    CASE WHEN sd.rn <= 10 THEN 15000.00 ELSE (500.00 + (sd.n * 17 % 1000))::DECIMAL(12,2) END,
    CASE WHEN sd.rn <= 10 THEN 15000.00 ELSE (1000.00 + (sd.n * 23 % 2000))::DECIMAL(14,2) END,
    CASE 
      WHEN sd.rn <= 35 THEN 'completed'
      WHEN sd.rn <= 43 THEN 'pending'
      ELSE 'canceled'
    END
  FROM sales_data sd;

  -- Insert 50 Cost records with diverse categories and dates
  WITH cost_data AS (
    SELECT 
      v_user_id as user_id,
      ('2024-01-05'::DATE + (n * INTERVAL '5 days' - INTERVAL '1 year'))::DATE as cost_date,
      n
    FROM generate_series(0, 49) n
  )
  INSERT INTO costs (user_id, date, category, amount, description)
  SELECT
    cd.user_id,
    cd.cost_date,
    CASE (cd.n % 10)
      WHEN 0 THEN 'Marketing'
      WHEN 1 THEN 'Salaries'
      WHEN 2 THEN 'Utilities'
      WHEN 3 THEN 'Rent'
      WHEN 4 THEN 'Inventory'
      WHEN 5 THEN 'Software'
      WHEN 6 THEN 'Shipping'
      WHEN 7 THEN 'Training'
      WHEN 8 THEN 'Office Supplies'
      ELSE 'Insurance'
    END,
    (3000.00 + (cd.n * 1987 % 100000))::DECIMAL(14,2),
    'Expense for ' || CASE (cd.n % 10)
      WHEN 0 THEN 'Marketing'
      WHEN 1 THEN 'Salaries'
      WHEN 2 THEN 'Utilities'
      WHEN 3 THEN 'Rent'
      WHEN 4 THEN 'Inventory'
      WHEN 5 THEN 'Software'
      WHEN 6 THEN 'Shipping'
      WHEN 7 THEN 'Training'
      WHEN 8 THEN 'Office Supplies'
      ELSE 'Insurance'
    END
  FROM cost_data cd;

END $$;
