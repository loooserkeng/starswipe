-- ============================================================================
-- STARSWIPE: PRODUCTION POSTGRESQL SCHEMA (SUPABASE)
-- Fully compliant with 11 core tables, foreign keys, indexes, and constraints
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Auth Users mirror)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Actresses Table
CREATE TABLE IF NOT EXISTS public.actresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    biography TEXT DEFAULT '',
    industry TEXT NOT NULL DEFAULT 'Cinema',
    country TEXT NOT NULL DEFAULT 'India',
    primary_image_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Actress-Categories Junction Table
CREATE TABLE IF NOT EXISTS public.actress_categories (
    actress_id UUID NOT NULL REFERENCES public.actresses(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (actress_id, category_id)
);

-- 5. Images Table (Portraits & Galleries)
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actress_id UUID NOT NULL REFERENCES public.actresses(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    source_url TEXT,
    attribution TEXT,
    moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'removed')),
    rejection_reason TEXT,
    content_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add primary_image_id foreign key constraint back to images
ALTER TABLE public.actresses
    ADD CONSTRAINT fk_actress_primary_image
    FOREIGN KEY (primary_image_id)
    REFERENCES public.images(id)
    ON DELETE SET NULL;

-- 6. Votes Table (Current Authoritative State)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- UUID or server-verified guest session token
    actress_id UUID NOT NULL REFERENCES public.actresses(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_actress_vote UNIQUE (user_id, actress_id)
);

-- 7. Vote Events Table (Historical Log for Trend Calculations)
CREATE TABLE IF NOT EXISTS public.vote_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_reference TEXT NOT NULL,
    actress_id UUID NOT NULL REFERENCES public.actresses(id) ON DELETE CASCADE,
    previous_vote_type TEXT CHECK (previous_vote_type IN ('like', 'dislike')),
    new_vote_type TEXT NOT NULL CHECK (new_vote_type IN ('like', 'dislike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('actress', 'image')),
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 9. Moderation Logs Table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Copyright Claims Table
CREATE TABLE IF NOT EXISTS public.copyright_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
    claimant_contact TEXT NOT NULL,
    claim_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 11. Guest Sessions Table
CREATE TABLE IF NOT EXISTS public.guest_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    secure_session_reference TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR HIGH-TRAFFIC LEADERBOARD & SWIPE DISCOVERY
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_votes_actress_id ON public.votes (actress_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_actress ON public.votes (user_id, actress_id);
CREATE INDEX IF NOT EXISTS idx_vote_events_actress_created ON public.vote_events (actress_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_actress_status ON public.images (actress_id, moderation_status);
CREATE INDEX IF NOT EXISTS idx_images_content_hash ON public.images (content_hash);
CREATE INDEX IF NOT EXISTS idx_actresses_slug ON public.actresses (slug);
CREATE INDEX IF NOT EXISTS idx_actresses_status ON public.actresses (status);
