import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DBUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface DBActress {
  id: string;
  name: string;
  slug: string;
  biography: string;
  industry: string;
  country: string;
  primary_image_id: string;
  status: 'active' | 'archived';
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBActressCategory {
  actress_id: string;
  category_id: string;
}

export interface DBImage {
  id: string;
  actress_id: string;
  uploader_id?: string;
  storage_path: string;
  thumbnail_path?: string;
  source_url?: string;
  attribution?: string;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'removed';
  rejection_reason?: string;
  content_hash: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface DBVote {
  id: string;
  user_id: string;
  actress_id: string;
  vote_type: 'like' | 'dislike';
  created_at: string;
  updated_at: string;
}

export interface DBVoteEvent {
  id: string;
  voter_reference: string;
  actress_id: string;
  previous_vote_type: 'like' | 'dislike' | null;
  new_vote_type: 'like' | 'dislike';
  created_at: string;
}

export interface DBReport {
  id: string;
  reporter_id: string;
  target_type: 'actress' | 'image';
  target_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
}

export interface DBModerationLog {
  id: string;
  moderator_id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason?: string;
  created_at: string;
}

export interface DBCopyrightClaim {
  id: string;
  image_id: string;
  claimant_contact: string;
  claim_details: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
}

export interface DBGuestSession {
  id: string;
  secure_session_reference: string;
  created_at: string;
  expires_at: string;
  revoked_at?: string;
}

export interface StarSwipeDB {
  profiles: DBUser[];
  actresses: DBActress[];
  categories: DBCategory[];
  actress_categories: DBActressCategory[];
  images: DBImage[];
  votes: DBVote[];
  vote_events: DBVoteEvent[];
  reports: DBReport[];
  moderation_logs: DBModerationLog[];
  copyright_claims: DBCopyrightClaim[];
  guest_sessions: DBGuestSession[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'starswipe-db.json');

function getInitialDB(): StarSwipeDB {
  const now = new Date().toISOString();
  
  const adminUser: DBUser = {
    id: 'user_admin_01',
    email: 'admin@starswipe.app',
    display_name: 'Lead Moderator',
    role: 'admin',
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  const demoUser: DBUser = {
    id: 'user_demo_02',
    email: 'cinephile@starswipe.app',
    display_name: 'Alex Cinema',
    role: 'user',
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  const categories: DBCategory[] = [
    { id: 'cat_malayalam', name: 'Malayalam Cinema', slug: 'malayalam', description: 'Acclaimed performers in contemporary and classic Mollywood cinema.', created_at: now },
    { id: 'cat_tamil', name: 'Tamil Cinema', slug: 'tamil', description: 'Leading and award-winning talent from Kollywood.', created_at: now },
    { id: 'cat_telugu', name: 'Telugu Cinema', slug: 'telugu', description: 'Celebrated stars across Tollywood blockbusters and art cinema.', created_at: now },
    { id: 'cat_hindi', name: 'Hindi Cinema', slug: 'hindi', description: 'Iconic and rising performers across Bollywood and Indian streaming.', created_at: now },
    { id: 'cat_international', name: 'International Cinema', slug: 'international', description: 'Award-winning performers across European, Hollywood, and global films.', created_at: now },
  ];

  const actresses: DBActress[] = [
    {
      id: 'actress_ananya',
      name: 'Ananya Roy',
      slug: 'ananya-roy',
      biography: 'Renowned for dramatic versatility, expressive screen presence, and critically acclaimed performances in both Malayalam and Tamil art-house features.',
      industry: 'Malayalam & Tamil Cinema',
      country: 'India',
      primary_image_id: 'img_ananya_1',
      status: 'active',
      is_verified: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'actress_meera',
      name: 'Meera Nambiar',
      slug: 'meera-nambiar',
      biography: 'Award-winning performer celebrated for naturalistic acting, poise, and prominent roles in groundbreaking Malayalam cinema.',
      industry: 'Malayalam Cinema',
      country: 'India',
      primary_image_id: 'img_meera_1',
      status: 'active',
      is_verified: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'actress_elena',
      name: 'Elena Laurent',
      slug: 'elena-laurent',
      biography: 'International film star and festival favorite known for subtle psychological nuances in auteur-driven European cinema and English-language features.',
      industry: 'International & European Cinema',
      country: 'France',
      primary_image_id: 'img_elena_1',
      status: 'active',
      is_verified: true,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'actress_priya',
      name: 'Priya Sharma',
      slug: 'priya-sharma',
      biography: 'Dynamic performer with notable leading roles across commercial Hindi cinema, romantic comedies, and streaming thrillers.',
      industry: 'Hindi Cinema',
      country: 'India',
      primary_image_id: 'img_priya_1',
      status: 'active',
      is_verified: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'actress_samantha',
      name: 'Samantha Varma',
      slug: 'samantha-varma',
      biography: 'High-energy leading actress with multiple box-office successes across Telugu and Tamil feature productions.',
      industry: 'Telugu & Tamil Cinema',
      country: 'India',
      primary_image_id: 'img_samantha_1',
      status: 'active',
      is_verified: true,
      created_at: now,
      updated_at: now,
    },
  ];

  const actress_categories: DBActressCategory[] = [
    { actress_id: 'actress_ananya', category_id: 'cat_malayalam' },
    { actress_id: 'actress_ananya', category_id: 'cat_tamil' },
    { actress_id: 'actress_meera', category_id: 'cat_malayalam' },
    { actress_id: 'actress_elena', category_id: 'cat_international' },
    { actress_id: 'actress_priya', category_id: 'cat_hindi' },
    { actress_id: 'actress_samantha', category_id: 'cat_telugu' },
    { actress_id: 'actress_samantha', category_id: 'cat_tamil' },
  ];

  const images: DBImage[] = [
    {
      id: 'img_ananya_1',
      actress_id: 'actress_ananya',
      uploader_id: 'user_admin_01',
      storage_path: '/src/assets/images/actress_portrait_ananya_1791620052694.jpg',
      source_url: 'https://starswipe.app/portraits/ananya-roy',
      attribution: 'Studio Editorial Archive',
      moderation_status: 'approved',
      content_hash: 'hash_ananya_01',
      created_at: now,
      approved_at: now,
      approved_by: 'user_admin_01',
    },
    {
      id: 'img_meera_1',
      actress_id: 'actress_meera',
      uploader_id: 'user_admin_01',
      storage_path: '/src/assets/images/actress_portrait_meera_1791620065389.jpg',
      source_url: 'https://starswipe.app/portraits/meera-nambiar',
      attribution: 'Studio Editorial Archive',
      moderation_status: 'approved',
      content_hash: 'hash_meera_01',
      created_at: now,
      approved_at: now,
      approved_by: 'user_admin_01',
    },
    {
      id: 'img_elena_1',
      actress_id: 'actress_elena',
      uploader_id: 'user_admin_01',
      storage_path: '/src/assets/images/actress_portrait_elena_1791620083028.jpg',
      source_url: 'https://starswipe.app/portraits/elena-laurent',
      attribution: 'Studio Editorial Archive',
      moderation_status: 'approved',
      content_hash: 'hash_elena_01',
      created_at: now,
      approved_at: now,
      approved_by: 'user_admin_01',
    },
    {
      id: 'img_priya_1',
      actress_id: 'actress_priya',
      uploader_id: 'user_admin_01',
      storage_path: '/src/assets/images/actress_portrait_ananya_1791620052694.jpg',
      source_url: 'https://starswipe.app/portraits/priya-sharma',
      attribution: 'Studio Editorial Archive',
      moderation_status: 'approved',
      content_hash: 'hash_priya_01',
      created_at: now,
      approved_at: now,
      approved_by: 'user_admin_01',
    },
    {
      id: 'img_samantha_1',
      actress_id: 'actress_samantha',
      uploader_id: 'user_admin_01',
      storage_path: '/src/assets/images/actress_portrait_meera_1791620065389.jpg',
      source_url: 'https://starswipe.app/portraits/samantha-varma',
      attribution: 'Studio Editorial Archive',
      moderation_status: 'approved',
      content_hash: 'hash_samantha_01',
      created_at: now,
      approved_at: now,
      approved_by: 'user_admin_01',
    },
  ];

  // Initial development seed votes to demonstrate ranking math without fabrications
  const sampleVotes: DBVote[] = [
    { id: 'v_1', user_id: 'user_admin_01', actress_id: 'actress_ananya', vote_type: 'like', created_at: now, updated_at: now },
    { id: 'v_2', user_id: 'user_demo_02', actress_id: 'actress_ananya', vote_type: 'like', created_at: now, updated_at: now },
    { id: 'v_3', user_id: 'user_admin_01', actress_id: 'actress_meera', vote_type: 'like', created_at: now, updated_at: now },
    { id: 'v_4', user_id: 'user_demo_02', actress_id: 'actress_meera', vote_type: 'like', created_at: now, updated_at: now },
    { id: 'v_5', user_id: 'user_admin_01', actress_id: 'actress_elena', vote_type: 'like', created_at: now, updated_at: now },
    { id: 'v_6', user_id: 'user_demo_02', actress_id: 'actress_elena', vote_type: 'dislike', created_at: now, updated_at: now },
    { id: 'v_7', user_id: 'user_admin_01', actress_id: 'actress_priya', vote_type: 'like', created_at: now, updated_at: now },
  ];

  const sampleVoteEvents: DBVoteEvent[] = sampleVotes.map((v) => ({
    id: `ve_${v.id}`,
    voter_reference: v.user_id,
    actress_id: v.actress_id,
    previous_vote_type: null,
    new_vote_type: v.vote_type,
    created_at: v.created_at,
  }));

  return {
    profiles: [adminUser, demoUser],
    actresses,
    categories,
    actress_categories,
    images,
    votes: sampleVotes,
    vote_events: sampleVoteEvents,
    reports: [],
    moderation_logs: [
      {
        id: 'mod_1',
        moderator_id: 'user_admin_01',
        action: 'APPROVE_INITIAL_BATCH',
        target_type: 'image_batch',
        target_id: 'initial_catalog',
        reason: 'Initial verified catalog approval',
        created_at: now,
      },
    ],
    copyright_claims: [],
    guest_sessions: [],
  };
}

class Database {
  private data: StarSwipeDB;

  constructor() {
    this.data = this.load();
  }

  private load(): StarSwipeDB {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to read existing DB file, seeding fresh DB:', e);
    }
    const initial = getInitialDB();
    this.save(initial);
    return initial;
  }

  private save(data: StarSwipeDB) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private persist() {
    this.save(this.data);
  }

  // --- Users & Profiles ---
  public getProfiles(): DBUser[] {
    return this.data.profiles;
  }

  public getProfileById(id: string): DBUser | undefined {
    return this.data.profiles.find((u) => u.id === id);
  }

  public getProfileByEmail(email: string): DBUser | undefined {
    return this.data.profiles.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createProfile(user: Omit<DBUser, 'created_at' | 'updated_at'>): DBUser {
    const now = new Date().toISOString();
    const newUser: DBUser = { ...user, created_at: now, updated_at: now };
    this.data.profiles.push(newUser);
    this.persist();
    return newUser;
  }

  public updateProfileRole(id: string, role: 'admin' | 'moderator' | 'user'): DBUser | null {
    const user = this.getProfileById(id);
    if (!user) return null;
    user.role = role;
    user.updated_at = new Date().toISOString();
    this.persist();
    return user;
  }

  public updateProfileStatus(id: string, status: 'active' | 'suspended'): DBUser | null {
    const user = this.getProfileById(id);
    if (!user) return null;
    user.status = status;
    user.updated_at = new Date().toISOString();
    this.persist();
    return user;
  }

  // --- Categories ---
  public getCategories(): DBCategory[] {
    return this.data.categories;
  }

  // --- Images ---
  public getImages(): DBImage[] {
    return this.data.images;
  }

  public getImageById(id: string): DBImage | undefined {
    return this.data.images.find((img) => img.id === id);
  }

  public getApprovedImagesByActress(actressId: string): DBImage[] {
    return this.data.images.filter(
      (img) => img.actress_id === actressId && img.moderation_status === 'approved'
    );
  }

  // --- Actresses & Computed Metrics ---
  public getActresses(options?: {
    categorySlug?: string;
    search?: string;
    status?: 'active' | 'archived';
    voterId?: string;
  }): Array<DBActress & {
    likes: number;
    dislikes: number;
    total_votes: number;
    net_votes: number;
    like_rate: number;
    weekly_net_delta: number;
    monthly_net_delta: number;
    primary_image_url: string;
    gallery_urls: string[];
    categories: DBCategory[];
    user_vote?: 'like' | 'dislike' | null;
  }> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let list = this.data.actresses;
    if (options?.status) {
      list = list.filter((a) => a.status === options.status);
    } else {
      list = list.filter((a) => a.status === 'active');
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.industry.toLowerCase().includes(q) ||
          a.biography.toLowerCase().includes(q)
      );
    }

    if (options?.categorySlug) {
      const cat = this.data.categories.find((c) => c.slug === options.categorySlug);
      if (cat) {
        const matchingIds = this.data.actress_categories
          .filter((ac) => ac.category_id === cat.id)
          .map((ac) => ac.actress_id);
        list = list.filter((a) => matchingIds.includes(a.id));
      }
    }

    return list.map((actress) => {
      // Find all current votes
      const actressVotes = this.data.votes.filter((v) => v.actress_id === actress.id);
      const likes = actressVotes.filter((v) => v.vote_type === 'like').length;
      const dislikes = actressVotes.filter((v) => v.vote_type === 'dislike').length;
      const total_votes = likes + dislikes;
      const net_votes = likes - dislikes;
      const like_rate = total_votes > 0 ? Math.round((likes / total_votes) * 100) : 0;

      // Calculate weekly and monthly net deltas from vote_events
      const recentEvents = this.data.vote_events.filter((ve) => ve.actress_id === actress.id);
      
      let weekly_net_delta = 0;
      let monthly_net_delta = 0;

      for (const ev of recentEvents) {
        const evDate = new Date(ev.created_at);
        const delta = ev.new_vote_type === 'like' ? 1 : -1;
        const prevDelta = ev.previous_vote_type === 'like' ? 1 : ev.previous_vote_type === 'dislike' ? -1 : 0;
        const netChange = delta - prevDelta;

        if (evDate >= oneWeekAgo) {
          weekly_net_delta += netChange;
        }
        if (evDate >= oneMonthAgo) {
          monthly_net_delta += netChange;
        }
      }

      // Images
      const approvedImages = this.getApprovedImagesByActress(actress.id);
      const primaryImg = this.getImageById(actress.primary_image_id);
      const primary_image_url = primaryImg?.storage_path || approvedImages[0]?.storage_path || '/src/assets/images/actress_portrait_ananya_1791620052694.jpg';
      const gallery_urls = approvedImages.map((img) => img.storage_path);

      // Categories
      const catIds = this.data.actress_categories
        .filter((ac) => ac.actress_id === actress.id)
        .map((ac) => ac.category_id);
      const categories = this.data.categories.filter((c) => catIds.includes(c.id));

      // User's current vote if voterId is supplied
      let user_vote: 'like' | 'dislike' | null = null;
      if (options?.voterId) {
        const found = this.data.votes.find(
          (v) => v.user_id === options.voterId && v.actress_id === actress.id
        );
        if (found) user_vote = found.vote_type;
      }

      return {
        ...actress,
        likes,
        dislikes,
        total_votes,
        net_votes,
        like_rate,
        weekly_net_delta,
        monthly_net_delta,
        primary_image_url,
        gallery_urls,
        categories,
        user_vote,
      };
    });
  }

  public getActressBySlug(slug: string, voterId?: string) {
    const list = this.getActresses({ voterId });
    return list.find((a) => a.slug === slug);
  }

  public getActressById(id: string, voterId?: string) {
    const list = this.getActresses({ voterId });
    return list.find((a) => a.id === id);
  }

  // --- Voting Operations (Atomic & Audited) ---
  public castVote(
    voterId: string,
    actressId: string,
    voteType: 'like' | 'dislike'
  ): {
    success: boolean;
    vote: DBVote;
    isUpdate: boolean;
    actressMetrics: { likes: number; dislikes: number; total_votes: number; net_votes: number; like_rate: number };
  } {
    const now = new Date().toISOString();
    const existingIndex = this.data.votes.findIndex(
      (v) => v.user_id === voterId && v.actress_id === actressId
    );

    let vote: DBVote;
    let previousVoteType: 'like' | 'dislike' | null = null;
    let isUpdate = false;

    if (existingIndex >= 0) {
      isUpdate = true;
      const existing = this.data.votes[existingIndex];
      previousVoteType = existing.vote_type;

      if (existing.vote_type === voteType) {
        // Idempotent: same vote already recorded, no duplicate
        const actress = this.getActressById(actressId);
        return {
          success: true,
          vote: existing,
          isUpdate: true,
          actressMetrics: {
            likes: actress?.likes || 0,
            dislikes: actress?.dislikes || 0,
            total_votes: actress?.total_votes || 0,
            net_votes: actress?.net_votes || 0,
            like_rate: actress?.like_rate || 0,
          },
        };
      }

      existing.vote_type = voteType;
      existing.updated_at = now;
      vote = existing;
    } else {
      vote = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: voterId,
        actress_id: actressId,
        vote_type: voteType,
        created_at: now,
        updated_at: now,
      };
      this.data.votes.push(vote);
    }

    // Insert vote event for audit & trend time windows
    this.data.vote_events.push({
      id: `ve_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      voter_reference: voterId,
      actress_id: actressId,
      previous_vote_type: previousVoteType,
      new_vote_type: voteType,
      created_at: now,
    });

    this.persist();

    const updatedActress = this.getActressById(actressId);
    return {
      success: true,
      vote,
      isUpdate,
      actressMetrics: {
        likes: updatedActress?.likes || 0,
        dislikes: updatedActress?.dislikes || 0,
        total_votes: updatedActress?.total_votes || 0,
        net_votes: updatedActress?.net_votes || 0,
        like_rate: updatedActress?.like_rate || 0,
      },
    };
  }

  public undoVote(voterId: string, actressId: string): { success: boolean; actressMetrics: any } {
    const existingIndex = this.data.votes.findIndex(
      (v) => v.user_id === voterId && v.actress_id === actressId
    );

    if (existingIndex < 0) {
      const actress = this.getActressById(actressId);
      return { success: false, actressMetrics: actress };
    }

    const removed = this.data.votes.splice(existingIndex, 1)[0];
    const now = new Date().toISOString();

    this.data.vote_events.push({
      id: `ve_undo_${Date.now()}`,
      voter_reference: voterId,
      actress_id: actressId,
      previous_vote_type: removed.vote_type,
      new_vote_type: removed.vote_type, // reversal
      created_at: now,
    });

    this.persist();

    const actress = this.getActressById(actressId);
    return {
      success: true,
      actressMetrics: {
        likes: actress?.likes || 0,
        dislikes: actress?.dislikes || 0,
        total_votes: actress?.total_votes || 0,
        net_votes: actress?.net_votes || 0,
        like_rate: actress?.like_rate || 0,
      },
    };
  }

  // --- Submissions & Uploads (Content Moderation Pipeline) ---
  public submitImage(params: {
    uploaderId: string;
    actressId?: string;
    newActressName?: string;
    categorySlug?: string;
    storagePath: string;
    sourceUrl?: string;
    attribution?: string;
    contentHash: string;
  }): { success: boolean; image?: DBImage; error?: string } {
    // Check for duplicate content hash
    const duplicate = this.data.images.find(
      (img) => img.content_hash === params.contentHash && img.moderation_status !== 'rejected'
    );
    if (duplicate) {
      return {
        success: false,
        error: 'This image has already been submitted or is present in the archive (duplicate content hash).',
      };
    }

    const now = new Date().toISOString();
    let targetActressId = params.actressId;

    // If new actress name was suggested, create actress in active/pending status
    if (!targetActressId && params.newActressName) {
      const slug = params.newActressName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const newActress: DBActress = {
        id: `actress_${Date.now()}`,
        name: params.newActressName.trim(),
        slug,
        biography: `Community suggested profile for ${params.newActressName}. Pending review by moderators.`,
        industry: 'Cinema',
        country: 'Global',
        primary_image_id: '',
        status: 'active',
        is_verified: false,
        created_at: now,
        updated_at: now,
      };
      this.data.actresses.push(newActress);
      targetActressId = newActress.id;

      if (params.categorySlug) {
        const cat = this.data.categories.find((c) => c.slug === params.categorySlug);
        if (cat) {
          this.data.actress_categories.push({ actress_id: newActress.id, category_id: cat.id });
        }
      }
    }

    if (!targetActressId) {
      return { success: false, error: 'Target actress was not specified.' };
    }

    const newImage: DBImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actress_id: targetActressId,
      uploader_id: params.uploaderId,
      storage_path: params.storagePath,
      source_url: params.sourceUrl,
      attribution: params.attribution,
      moderation_status: 'pending',
      content_hash: params.contentHash,
      created_at: now,
    };

    this.data.images.push(newImage);

    // If target actress has no primary image, assign this one tentatively once approved
    const actress = this.data.actresses.find((a) => a.id === targetActressId);
    if (actress && !actress.primary_image_id) {
      actress.primary_image_id = newImage.id;
    }

    this.persist();
    return { success: true, image: newImage };
  }

  public getPendingImages(): Array<DBImage & { actress_name: string; uploader_email?: string }> {
    return this.data.images
      .filter((img) => img.moderation_status === 'pending')
      .map((img) => {
        const actress = this.data.actresses.find((a) => a.id === img.actress_id);
        const uploader = this.data.profiles.find((p) => p.id === img.uploader_id);
        return {
          ...img,
          actress_name: actress?.name || 'Unknown',
          uploader_email: uploader?.email,
        };
      });
  }

  public getUserSubmissions(userId: string): Array<DBImage & { actress_name: string }> {
    return this.data.images
      .filter((img) => img.uploader_id === userId)
      .map((img) => {
        const actress = this.data.actresses.find((a) => a.id === img.actress_id);
        return {
          ...img,
          actress_name: actress?.name || 'Unknown',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public moderateImage(
    imageId: string,
    action: 'approve' | 'reject' | 'remove',
    moderatorId: string,
    reason?: string
  ): { success: boolean; image?: DBImage } {
    const img = this.data.images.find((i) => i.id === imageId);
    if (!img) return { success: false };

    const now = new Date().toISOString();
    if (action === 'approve') {
      img.moderation_status = 'approved';
      img.approved_at = now;
      img.approved_by = moderatorId;
      img.rejection_reason = undefined;

      // Ensure actress has primary image
      const actress = this.data.actresses.find((a) => a.id === img.actress_id);
      if (actress && (!actress.primary_image_id || actress.primary_image_id === img.id)) {
        actress.primary_image_id = img.id;
      }
    } else if (action === 'reject') {
      img.moderation_status = 'rejected';
      img.rejection_reason = reason || 'Does not meet community portrait quality standards.';
    } else if (action === 'remove') {
      img.moderation_status = 'removed';
      img.rejection_reason = reason || 'Removed by moderator.';
      const actress = this.data.actresses.find((a) => a.id === img.actress_id);
      if (actress && actress.primary_image_id === img.id) {
        // pick another approved image if available
        const another = this.data.images.find(
          (i) => i.actress_id === actress.id && i.id !== img.id && i.moderation_status === 'approved'
        );
        actress.primary_image_id = another ? another.id : '';
      }
    }

    this.data.moderation_logs.push({
      id: `mod_${Date.now()}`,
      moderator_id: moderatorId,
      action: `IMAGE_${action.toUpperCase()}`,
      target_type: 'image',
      target_id: imageId,
      reason,
      created_at: now,
    });

    this.persist();
    return { success: true, image: img };
  }

  // --- Reports & Moderation Logs ---
  public createReport(report: Omit<DBReport, 'id' | 'status' | 'created_at'>): DBReport {
    const now = new Date().toISOString();
    const newReport: DBReport = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'pending',
      created_at: now,
    };
    this.data.reports.push(newReport);
    this.persist();
    return newReport;
  }

  public getReports(): Array<DBReport & { reporter_email?: string; target_label?: string }> {
    return this.data.reports.map((r) => {
      const reporter = this.data.profiles.find((p) => p.id === r.reporter_id);
      let target_label = r.target_id;
      if (r.target_type === 'actress') {
        const a = this.data.actresses.find((x) => x.id === r.target_id);
        if (a) target_label = a.name;
      }
      return {
        ...r,
        reporter_email: reporter?.email || 'Guest User',
        target_label,
      };
    });
  }

  public resolveReport(reportId: string, moderatorId: string, status: 'resolved' | 'dismissed'): boolean {
    const rep = this.data.reports.find((r) => r.id === reportId);
    if (!rep) return false;
    const now = new Date().toISOString();
    rep.status = status;
    rep.resolved_at = now;

    this.data.moderation_logs.push({
      id: `mod_${Date.now()}`,
      moderator_id: moderatorId,
      action: `REPORT_${status.toUpperCase()}`,
      target_type: 'report',
      target_id: reportId,
      created_at: now,
    });

    this.persist();
    return true;
  }

  public getModerationLogs(): DBModerationLog[] {
    return [...this.data.moderation_logs].reverse();
  }

  // --- Admin Actress CRUD ---
  public createActress(data: {
    name: string;
    biography: string;
    industry: string;
    country: string;
    categoryIds: string[];
    is_verified?: boolean;
    primary_image_path?: string;
  }): DBActress {
    const now = new Date().toISOString();
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `actress_${Date.now()}`;

    let primary_image_id = '';
    if (data.primary_image_path) {
      const imgId = `img_${Date.now()}`;
      const img: DBImage = {
        id: imgId,
        actress_id: id,
        storage_path: data.primary_image_path,
        moderation_status: 'approved',
        content_hash: crypto.createHash('sha256').update(data.primary_image_path).digest('hex'),
        created_at: now,
        approved_at: now,
        approved_by: 'admin',
      };
      this.data.images.push(img);
      primary_image_id = imgId;
    }

    const actress: DBActress = {
      id,
      name: data.name,
      slug,
      biography: data.biography,
      industry: data.industry,
      country: data.country,
      primary_image_id,
      status: 'active',
      is_verified: !!data.is_verified,
      created_at: now,
      updated_at: now,
    };

    this.data.actresses.push(actress);

    for (const catId of data.categoryIds) {
      this.data.actress_categories.push({ actress_id: id, category_id: catId });
    }

    this.persist();
    return actress;
  }

  public updateActress(id: string, updates: Partial<DBActress> & { categoryIds?: string[] }): DBActress | null {
    const a = this.data.actresses.find((x) => x.id === id);
    if (!a) return null;
    const now = new Date().toISOString();

    if (updates.name !== undefined) a.name = updates.name;
    if (updates.biography !== undefined) a.biography = updates.biography;
    if (updates.industry !== undefined) a.industry = updates.industry;
    if (updates.country !== undefined) a.country = updates.country;
    if (updates.primary_image_id !== undefined) a.primary_image_id = updates.primary_image_id;
    if (updates.status !== undefined) a.status = updates.status;
    if (updates.is_verified !== undefined) a.is_verified = updates.is_verified;
    a.updated_at = now;

    if (updates.categoryIds) {
      this.data.actress_categories = this.data.actress_categories.filter((ac) => ac.actress_id !== id);
      for (const catId of updates.categoryIds) {
        this.data.actress_categories.push({ actress_id: id, category_id: catId });
      }
    }

    this.persist();
    return a;
  }

  public mergeActresses(sourceId: string, targetId: string, moderatorId: string): boolean {
    const source = this.data.actresses.find((a) => a.id === sourceId);
    const target = this.data.actresses.find((a) => a.id === targetId);
    if (!source || !target || sourceId === targetId) return false;

    // Migrate all images from source to target
    for (const img of this.data.images) {
      if (img.actress_id === sourceId) {
        img.actress_id = targetId;
      }
    }

    // Migrate votes: for each vote on source, if voter hasn't voted on target, move it; otherwise discard duplicate
    for (const v of this.data.votes) {
      if (v.actress_id === sourceId) {
        const exists = this.data.votes.find((x) => x.user_id === v.user_id && x.actress_id === targetId);
        if (!exists) {
          v.actress_id = targetId;
        }
      }
    }
    // Clean up remaining source votes
    this.data.votes = this.data.votes.filter((v) => v.actress_id !== sourceId);

    // Archive source
    source.status = 'archived';
    source.biography += ` [Merged into ${target.name}]`;

    const now = new Date().toISOString();
    this.data.moderation_logs.push({
      id: `mod_${Date.now()}`,
      moderator_id: moderatorId,
      action: 'MERGE_ACTRESSES',
      target_type: 'actress',
      target_id: sourceId,
      reason: `Merged ${source.name} into ${target.name}`,
      created_at: now,
    });

    this.persist();
    return true;
  }

  // --- Admin Stats ---
  public getAdminStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const votesToday = this.data.vote_events.filter(
      (ve) => new Date(ve.created_at).getTime() >= todayStart
    ).length;

    const pendingSubmissions = this.data.images.filter(
      (img) => img.moderation_status === 'pending'
    ).length;

    const reportedContentCount = this.data.reports.filter((r) => r.status === 'pending').length;

    // Suspicious voting alerts: detects rapid multiple votes from same voter in < 1 minute
    let suspiciousSpikeAlerts = 0;
    const voterTimes: Record<string, number[]> = {};
    for (const ve of this.data.vote_events) {
      if (!voterTimes[ve.voter_reference]) voterTimes[ve.voter_reference] = [];
      voterTimes[ve.voter_reference].push(new Date(ve.created_at).getTime());
    }
    for (const times of Object.values(voterTimes)) {
      if (times.length > 20) suspiciousSpikeAlerts++;
    }

    return {
      totalActresses: this.data.actresses.filter((a) => a.status === 'active').length,
      totalApprovedImages: this.data.images.filter((i) => i.moderation_status === 'approved').length,
      pendingSubmissions,
      votesToday,
      totalValidCurrentVotes: this.data.votes.length,
      reportedContentCount,
      suspiciousSpikeAlerts,
    };
  }
}

export const db = new Database();
