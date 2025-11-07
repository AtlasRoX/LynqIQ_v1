-- Update RLS policies for products table

DROP POLICY IF EXISTS "Allow users to view their own products" ON products;
CREATE POLICY "Allow users to view their own products" ON products FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert products" ON products;
CREATE POLICY "Allow users to insert products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own products" ON products;
CREATE POLICY "Allow users to update their own products" ON products FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own products" ON products;
CREATE POLICY "Allow users to delete their own products" ON products FOR DELETE USING (auth.uid() = user_id);
