-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10, 2),
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own categories
CREATE POLICY "Users can only view their own categories" 
  ON categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own categories
CREATE POLICY "Users can insert their own categories" 
  ON categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own categories
CREATE POLICY "Users can update their own categories" 
  ON categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own categories
CREATE POLICY "Users can delete their own categories" 
  ON categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX categories_user_id_idx ON categories(user_id);

-- Alter transactions table to add category_id
ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX transactions_category_id_idx ON transactions(category_id);

