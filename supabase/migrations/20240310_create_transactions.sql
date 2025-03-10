-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own transactions
CREATE POLICY "Users can only view their own transactions" 
  ON transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own transactions
CREATE POLICY "Users can insert their own transactions" 
  ON transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" 
  ON transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX transactions_user_id_idx ON transactions(user_id);

