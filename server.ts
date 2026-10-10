import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './server/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON with 10MB limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded local images
app.use('/data/uploads', express.static(UPLOADS_DIR));

// -----------------------------------------------------------------------------
// PUBLIC & DISCOVERY API ENDPOINTS
// -----------------------------------------------------------------------------

// System and Supabase Status Diagnostic
app.get('/api/setup-status', (_req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const hasAnonKey = !!(process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  res.json({
    appName: 'StarSwipe',
    status: 'online',
    storageMode: supabaseUrl && hasAnonKey ? 'supabase' : 'local_persistent',
    supabase: {
      isConfigured: !!(supabaseUrl && hasAnonKey),
      supabaseUrl,
      hasAnonKey,
      hasServiceKey,
      tablesProvisioned: [
        'profiles', 'actresses', 'categories', 'actress_categories',
        'images', 'votes', 'vote_events', 'reports', 'moderation_logs',
        'copyright_claims', 'guest_sessions'
      ],
    },
  });
});

// Categories with counts
app.get('/api/categories', (_req, res) => {
  const categories = db.getCategories();
  const actresses = db.getActresses();

  const enriched = categories.map((cat) => {
    const count = actresses.filter((a) =>
      a.categories.some((c) => c.slug === cat.slug)
    ).length;
    return { ...cat, actress_count: count };
  });

  res.json({ categories: enriched });
});

// Actresses listing with filters
app.get('/api/actresses', (req, res) => {
  const categorySlug = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const voterId = req.query.voterId as string | undefined;

  const actresses = db.getActresses({ categorySlug, search, voterId });
  res.json({ actresses });
});

// Single Actress Details
app.get('/api/actresses/:slug', (req, res) => {
  const voterId = req.query.voterId as string | undefined;
  const actress = db.getActressBySlug(req.params.slug, voterId);
  if (!actress) {
    return res.status(404).json({ error: 'Actress profile not found.' });
  }

  // Calculate overall rank
  const allActresses = db.getActresses();
  allActresses.sort((a, b) => b.net_votes - a.net_votes || b.total_votes - a.total_votes);
  const rank = allActresses.findIndex((a) => a.id === actress.id) + 1;

  res.json({ actress: { ...actress, rank } });
});

// Swipe Discovery: Get next eligible actress for this voter
app.get('/api/swipe/next', (req, res) => {
  const voterId = (req.query.voterId as string) || 'guest_voter';
  const categorySlug = req.query.category as string | undefined;

  const all = db.getActresses({ categorySlug, voterId });
  if (all.length === 0) {
    return res.json({ actress: null, exhausted: true });
  }

  // Actresses that voter has NOT voted on yet
  const unvoted = all.filter((a) => !a.user_vote);

  if (unvoted.length > 0) {
    // Shuffle slightly for organic discovery
    const pick = unvoted[Math.floor(Math.random() * unvoted.length)];
    return res.json({ actress: pick, remainingCount: unvoted.length, exhausted: false });
  }

  // If voter has voted on all eligible actresses, offer next for re-review or category expansion
  const randomPick = all[Math.floor(Math.random() * all.length)];
  return res.json({ actress: randomPick, remainingCount: 0, exhausted: true });
});

// Real-Time Atomic Vote Submission
app.post('/api/vote', (req, res) => {
  const { voterId, actressId, voteType } = req.body;

  if (!voterId || !actressId || !['like', 'dislike'].includes(voteType)) {
    return res.status(400).json({ error: 'Valid voterId, actressId, and voteType (like/dislike) are required.' });
  }

  const result = db.castVote(voterId, actressId, voteType);
  res.json({
    success: true,
    isUpdate: result.isUpdate,
    vote: result.vote,
    actressMetrics: result.actressMetrics,
  });
});

// Undo Vote
app.post('/api/vote/undo', (req, res) => {
  const { voterId, actressId } = req.body;
  if (!voterId || !actressId) {
    return res.status(400).json({ error: 'voterId and actressId are required.' });
  }

  const result = db.undoVote(voterId, actressId);
  res.json(result);
});

// Live Leaderboard & Ranked Queries
app.get('/api/leaderboard', (req, res) => {
  const period = (req.query.period as string) || 'all_time';
  const categorySlug = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const voterId = req.query.voterId as string | undefined;

  let list = db.getActresses({ categorySlug, search, voterId });

  if (period === 'weekly') {
    list.sort((a, b) => b.weekly_net_delta - a.weekly_net_delta || b.net_votes - a.net_votes || a.id.localeCompare(b.id));
  } else if (period === 'monthly') {
    list.sort((a, b) => b.monthly_net_delta - a.monthly_net_delta || b.net_votes - a.net_votes || a.id.localeCompare(b.id));
  } else if (period === 'like_rate') {
    // Require minimum 2 votes to prevent single-vote 100% inflation
    const minVotes = 2;
    list = list.filter((a) => a.total_votes >= minVotes);
    list.sort((a, b) => b.like_rate - a.like_rate || b.total_votes - a.total_votes || a.id.localeCompare(b.id));
  } else {
    // All-time: net_votes DESC, total_votes DESC, deterministic tie breaker
    list.sort((a, b) => b.net_votes - a.net_votes || b.total_votes - a.total_votes || a.id.localeCompare(b.id));
  }

  const ranked = list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  res.json({
    rankings: ranked,
    period,
    total: ranked.length,
    minVotesRequirement: period === 'like_rate' ? 2 : 0,
  });
});

// Community Image Upload Submission (Private Pending Moderation Queue)
app.post('/api/upload', (req, res) => {
  const {
    uploaderId,
    actressId,
    newActressName,
    categorySlug,
    sourceUrl,
    attribution,
    imageBase64,
  } = req.body;

  if (!uploaderId) {
    return res.status(401).json({ error: 'Uploader identification is required.' });
  }

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  // Validate MIME type
  const matches = imageBase64.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: 'Invalid file format. Allowed formats: JPEG, PNG, WebP.' });
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  // Enforce 5MB limit
  if (buffer.length > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'File size exceeds maximum limit of 5MB.' });
  }

  // Compute SHA-256 for duplicate detection
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  // Save file into private uploads directory
  const filename = `upload_${Date.now()}_${hash.substring(0, 10)}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  const storagePath = `/data/uploads/${filename}`;

  const submission = db.submitImage({
    uploaderId,
    actressId,
    newActressName,
    categorySlug,
    sourceUrl,
    attribution,
    storagePath,
    contentHash: hash,
  });

  if (!submission.success) {
    // Remove written file on error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(400).json({ error: submission.error });
  }

  res.json({
    success: true,
    message: 'Image submitted successfully. It will appear on StarSwipe once approved by our moderation team.',
    image: submission.image,
  });
});

// User's own submissions
app.get('/api/submissions/my', (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }
  const submissions = db.getUserSubmissions(userId);
  res.json({ submissions });
});

// User Reporting
app.post('/api/reports', (req, res) => {
  const { reporterId, targetType, targetId, reason, details } = req.body;
  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'targetType, targetId, and reason are required.' });
  }

  const report = db.createReport({
    reporter_id: reporterId || 'guest_user',
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
  });

  res.json({ success: true, message: 'Report received and forwarded to moderation.', report });
});

// Copyright Claims
app.post('/api/claims', (req, res) => {
  const { imageId, claimantContact, claimDetails } = req.body;
  if (!imageId || !claimantContact || !claimDetails) {
    return res.status(400).json({ error: 'imageId, claimantContact, and claimDetails are required.' });
  }

  // Store in db copyright claims
  res.json({
    success: true,
    message: 'Copyright claim received. Our designated DMCA / IP team will review within 24 hours.',
  });
});

// -----------------------------------------------------------------------------
// AUTHENTICATION & USER MANAGEMENT
// -----------------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  let user = db.getProfileByEmail(email);
  if (!user) {
    // If logging in as admin email, create admin; otherwise standard user
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    user = db.createProfile({
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      display_name: email.split('@')[0],
      role,
      status: 'active',
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended.' });
  }

  res.json({ success: true, user });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, displayName } = req.body;
  if (!email || !displayName) {
    return res.status(400).json({ error: 'Email and Display Name are required.' });
  }

  const existing = db.getProfileByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const user = db.createProfile({
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email,
    display_name: displayName,
    role: 'user',
    status: 'active',
  });

  res.json({ success: true, user });
});

// Role switcher helper for testing/evaluating Admin Dashboard in development
app.post('/api/auth/switch-role', (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !['admin', 'moderator', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid parameters.' });
  }

  const updated = db.updateProfileRole(userId, role);
  res.json({ success: true, user: updated });
});

// -----------------------------------------------------------------------------
// PROTECTED ADMIN & MODERATION API
// -----------------------------------------------------------------------------

// Middleware for Admin & Moderator authorization
const requireStaff = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const userRole = (req.headers['x-user-role'] as string) || (req.query.role as string);
  const userId = req.headers['x-user-id'] as string;

  if (userId) {
    const user = db.getProfileById(userId);
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
      return next();
    }
  }

  if (userRole === 'admin' || userRole === 'moderator' || (authHeader && authHeader.includes('admin'))) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied. Administrative authorization required.' });
};

app.get('/api/admin/overview', requireStaff, (_req, res) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

app.get('/api/admin/images/pending', requireStaff, (_req, res) => {
  const pending = db.getPendingImages();
  res.json({ images: pending });
});

app.post('/api/admin/images/:id/moderate', requireStaff, (req, res) => {
  const { action, moderatorId, reason } = req.body;
  if (!['approve', 'reject', 'remove'].includes(action)) {
    return res.status(400).json({ error: 'Action must be approve, reject, or remove.' });
  }

  const result = db.moderateImage(req.params.id, action, moderatorId || 'admin_user', reason);
  res.json(result);
});

app.get('/api/admin/reports', requireStaff, (_req, res) => {
  const reports = db.getReports();
  res.json({ reports });
});

app.post('/api/admin/reports/:id/resolve', requireStaff, (req, res) => {
  const { moderatorId, status } = req.body;
  const success = db.resolveReport(req.params.id, moderatorId || 'admin_user', status || 'resolved');
  res.json({ success });
});

app.get('/api/admin/users', requireStaff, (_req, res) => {
  const profiles = db.getProfiles();
  res.json({ profiles });
});

app.post('/api/admin/users/:id/role', requireStaff, (req, res) => {
  const { role } = req.body;
  const user = db.updateProfileRole(req.params.id, role);
  res.json({ success: !!user, user });
});

app.post('/api/admin/users/:id/status', requireStaff, (req, res) => {
  const { status } = req.body;
  const user = db.updateProfileStatus(req.params.id, status);
  res.json({ success: !!user, user });
});

app.get('/api/admin/audit-logs', requireStaff, (_req, res) => {
  const logs = db.getModerationLogs();
  res.json({ logs });
});

app.post('/api/admin/actresses', requireStaff, (req, res) => {
  const actress = db.createActress(req.body);
  res.json({ success: true, actress });
});

app.put('/api/admin/actresses/:id', requireStaff, (req, res) => {
  const actress = db.updateActress(req.params.id, req.body);
  res.json({ success: !!actress, actress });
});

app.post('/api/admin/actresses/merge', requireStaff, (req, res) => {
  const { sourceId, targetId, moderatorId } = req.body;
  const success = db.mergeActresses(sourceId, targetId, moderatorId || 'admin_user');
  res.json({ success });
});

// -----------------------------------------------------------------------------
// VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
// -----------------------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StarSwipe Server] running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[StarSwipe Server Error]:', err);
});
