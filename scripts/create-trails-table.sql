-- Create the trails table to match your existing schema pattern
CREATE TABLE IF NOT EXISTS trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  distance NUMERIC(5,2) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Moderate', 'Hard')) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  elevation_gain INTEGER DEFAULT 0,
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security to match your existing tables
ALTER TABLE trails ENABLE ROW LEVEL SECURITY;

-- Create a policy for user-specific access (matching your app pattern)
CREATE POLICY "Users can view own trails" ON trails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trails" ON trails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trails" ON trails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trails" ON trails
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trails_user_id_idx ON trails(user_id);
CREATE INDEX IF NOT EXISTS trails_date_idx ON trails(date DESC);
CREATE INDEX IF NOT EXISTS trails_created_at_idx ON trails(created_at DESC);
