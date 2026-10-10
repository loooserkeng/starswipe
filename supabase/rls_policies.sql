-- ============================================================================
-- STARSWIPE: ROW LEVEL SECURITY (RLS) POLICIES
-- Strict least-privilege security model
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actress_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copyright_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator') AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Actresses
CREATE POLICY "Active actresses are viewable by everyone"
  ON public.actresses FOR SELECT
  USING (status = 'active' OR public.is_staff());

CREATE POLICY "Staff can insert/update actresses"
  ON public.actresses FOR ALL
  USING (public.is_staff());

-- 3. Categories
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- 4. Images
CREATE POLICY "Only approved images are publicly viewable"
  ON public.images FOR SELECT
  USING (moderation_status = 'approved' OR uploader_id = auth.uid() OR public.is_staff());

CREATE POLICY "Authenticated users can submit images"
  ON public.images FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update image moderation status"
  ON public.images FOR UPDATE
  USING (public.is_staff());

-- 5. Votes
CREATE POLICY "Votes can be viewed for aggregations"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert or update their own votes"
  ON public.votes FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own vote"
  ON public.votes FOR UPDATE
  USING (user_id = auth.uid()::text);

-- 6. Reports & Claims
CREATE POLICY "Users can insert reports"
  ON public.reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can review and update reports"
  ON public.reports FOR ALL
  USING (public.is_staff());

CREATE POLICY "Staff can access moderation logs"
  ON public.moderation_logs FOR SELECT
  USING (public.is_staff());
