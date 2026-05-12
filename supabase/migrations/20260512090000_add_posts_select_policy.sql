-- Enable RLS and allow SELECT on public.posts for all users
-- Creates policy so SELECT is permitted (public read)

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to SELECT
CREATE POLICY "Allow public select on posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- (Optional) Ensure owners can INSERT/UPDATE/DELETE based on auth.uid()
CREATE POLICY "Allow authenticated inserts on posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow owners modify posts"
  ON public.posts
  FOR UPDATE, DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
