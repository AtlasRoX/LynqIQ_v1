-- Add user_id column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Allow users to view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);
