-- Create wellbeing_entries table
CREATE TABLE IF NOT EXISTS public.wellbeing_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 10),
    emotions TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.wellbeing_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own wellbeing entries
CREATE POLICY "Users can view their own wellbeing entries"
    ON public.wellbeing_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own wellbeing entries
CREATE POLICY "Users can insert their own wellbeing entries"
    ON public.wellbeing_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own wellbeing entries
CREATE POLICY "Users can update their own wellbeing entries"
    ON public.wellbeing_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wellbeing entries
CREATE POLICY "Users can delete their own wellbeing entries"
    ON public.wellbeing_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS wellbeing_entries_user_id_idx ON public.wellbeing_entries(user_id);
CREATE INDEX IF NOT EXISTS wellbeing_entries_created_at_idx ON public.wellbeing_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS wellbeing_entries_user_created_idx ON public.wellbeing_entries(user_id, created_at DESC);

-- Grant permissions
GRANT ALL ON public.wellbeing_entries TO authenticated;
GRANT ALL ON public.wellbeing_entries TO service_role;
