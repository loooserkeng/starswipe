# StarSwipe — Premium Actress Swipe & Leaderboard Platform

StarSwipe is a premium, full-stack entertainment platform where users discover acclaimed cinematic actresses through portrait cards, cast likes and dislikes using touch and mouse swipe gestures, and follow live community-driven leaderboards.

---

## 🌟 Core Features

- **Kinetic Swipe Discovery**: Full physics-based gesture card swiping (swipe right to like, swipe left to dislike, skip, undo previous vote).
- **Authoritative Real-Time Ledger**:
  - One current vote per profile per voter enforced at the database constraint level.
  - Zero duplicate votes. Changing a vote updates existing totals atomically.
  - Historical `vote_events` log used to calculate real weekly and monthly momentum changes.
- **Multi-Mode Live Leaderboard**:
  - All-Time Popularity (Net votes = likes minus dislikes).
  - Weekly Trending (Net vote changes during a 7-day window).
  - Monthly Trending (Net vote changes during a 30-day window).
  - Highest Like Rate (affirmative percentage with minimum sample threshold).
- **Curated High-Resolution Portraits**:
  - High-fashion and cinematic editorial portraits.
  - Multi-image galleries per actress.
- **Community Submission & Private Moderation Pipeline**:
  - Community members upload portrait images (JPEG, PNG, WebP < 5MB).
  - SHA-256 content hash duplicate detection.
  - Submissions held in private pending escrow until approved by staff.
- **Role-Based Admin Console (`/admin`)**:
  - Actress catalog management: Create, edit, change categories, set primary portraits, and merge duplicate records.
  - Moderation queue: One-click approval, rejection with reasons, or takedown.
  - Abuse monitoring: Real-time spike alerts and audit logs.
  - User status management: Suspend abusive voters or elevate moderators.

---

## 🗄️ Database Architecture & Supabase Integration

StarSwipe includes complete production PostgreSQL schemas ready for Supabase:

1. `supabase/schema.sql`: 11 core tables (`profiles`, `actresses`, `categories`, `actress_categories`, `images`, `votes`, `vote_events`, `reports`, `moderation_logs`, `copyright_claims`, `guest_sessions`) with foreign keys, checks, and performance indexes.
2. `supabase/rls_policies.sql`: Row-Level Security ensuring private pending submissions and preventing vote forgery.
3. `supabase/storage_setup.sql`: Provisioning for `actress-portraits` (public) and `pending-submissions` (private) storage buckets.

### Connecting to Supabase in Production
1. Create a project at [Supabase](https://supabase.com).
2. Run `supabase/schema.sql` and `supabase/rls_policies.sql` in the Supabase SQL Editor.
3. Run `supabase/storage_setup.sql` in the Storage SQL Editor.
4. Set the following environment variables in `.env` or your hosting provider:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret"
   ```

*Note: In development when external Supabase credentials are not provided, StarSwipe operates seamlessly on an atomic file-backed local database (`data/starswipe-db.json`) that simulates the full schema, constraints, and audit logging.*

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the full-stack server (Express backend + Vite client)
npm run dev

# Run automated integration tests
npm test

# Build production bundle
npm run build
```

---

## 🛡️ Brand Customization

Branding, colors, and thresholds are centralized in `src/lib/brand.ts`. Customize the platform title, copyright year, support email, or voting rules from one source file.
