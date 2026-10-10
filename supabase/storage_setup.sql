-- ============================================================================
-- STARSWIPE: SUPABASE STORAGE BUCKETS SETUP
-- Private pending submissions bucket & Public approved portraits bucket
-- ============================================================================

-- 1. Create Public Bucket for Approved Actress Portraits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'actress-portraits',
    'actress-portraits',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Private Bucket for Pending Submissions (Requires Staff/Uploader Access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pending-submissions',
    'pending-submissions',
    false,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public read for approved actress portraits"
ON storage.objects FOR SELECT
USING (bucket_id = 'actress-portraits');

CREATE POLICY "Users can upload pending submissions"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pending-submissions' AND auth.role() = 'authenticated');

CREATE POLICY "Moderators can view and manage pending submissions"
ON storage.objects FOR ALL
USING (bucket_id = 'pending-submissions' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
));
