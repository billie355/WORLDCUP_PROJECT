-- Create user_badges table
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_type, match_id) -- Prevent duplicate badges for the same match
);

-- Index for fast profile querying
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies (Users can only view badges)
CREATE POLICY "Anyone can view badges"
    ON public.user_badges
    FOR SELECT
    TO public
    USING (true);

-- Note: Inserting/updating is handled by Server Actions using the Service Role Key.
