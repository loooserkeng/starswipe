import { Actress, Category, ActressImage, UserProfile, AdminStats, ReportRecord, ModerationLog } from './types.js';

const API_BASE = '/api';

export const api = {
  async getSetupStatus() {
    const res = await fetch(`${API_BASE}/setup-status`);
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    return data.categories || [];
  },

  async getActresses(options?: { category?: string; search?: string; voterId?: string; status?: string }): Promise<Actress[]> {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    if (options?.voterId) params.set('voterId', options.voterId);
    if (options?.status) params.set('status', options.status);

    const res = await fetch(`${API_BASE}/actresses?${params.toString()}`);
    const data = await res.json();
    return data.actresses || [];
  },

  async getActressBySlug(slug: string, voterId?: string): Promise<Actress> {
    const params = new URLSearchParams();
    if (voterId) params.set('voterId', voterId);

    const res = await fetch(`${API_BASE}/actresses/${slug}?${params.toString()}`);
    if (!res.ok) throw new Error('Actress not found');
    const data = await res.json();
    return data.actress;
  },

  async getNextSwipe(voterId: string, category?: string): Promise<{ actress: Actress | null; remainingCount: number; exhausted: boolean }> {
    const params = new URLSearchParams({ voterId });
    if (category) params.set('category', category);

    const res = await fetch(`${API_BASE}/swipe/next?${params.toString()}`);
    return res.json();
  },

  async castVote(voterId: string, actressId: string, voteType: 'like' | 'dislike') {
    const res = await fetch(`${API_BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, actressId, voteType }),
    });
    if (!res.ok) throw new Error('Failed to record vote');
    return res.json();
  },

  async undoVote(voterId: string, actressId: string) {
    const res = await fetch(`${API_BASE}/vote/undo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, actressId }),
    });
    return res.json();
  },

  async getLeaderboard(options?: { period?: string; category?: string; search?: string; voterId?: string }) {
    const params = new URLSearchParams();
    if (options?.period) params.set('period', options.period);
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    if (options?.voterId) params.set('voterId', options.voterId);

    const res = await fetch(`${API_BASE}/leaderboard?${params.toString()}`);
    return res.json();
  },

  async uploadImage(payload: {
    uploaderId: string;
    actressId?: string;
    newActressName?: string;
    categorySlug?: string;
    sourceUrl?: string;
    attribution?: string;
    imageBase64: string;
  }) {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  async getMySubmissions(userId: string): Promise<ActressImage[]> {
    const res = await fetch(`${API_BASE}/submissions/my?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.submissions || [];
  },

  async submitReport(payload: {
    reporterId?: string;
    targetType: 'actress' | 'image';
    targetId: string;
    reason: string;
    details?: string;
  }) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async submitClaim(payload: { imageId: string; claimantContact: string; claimDetails: string }) {
    const res = await fetch(`${API_BASE}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Auth
  async login(email: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data.user;
  },

  async signup(email: string, displayName: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data.user;
  },

  async switchRole(userId: string, role: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    const data = await res.json();
    return data.user;
  },

  // Admin APIs
  async getAdminOverview(user: UserProfile): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: { 'x-user-id': user.id, 'x-user-role': user.role },
    });
    const data = await res.json();
    return data.stats;
  },

  async getAdminPendingImages(user: UserProfile): Promise<ActressImage[]> {
    const res = await fetch(`${API_BASE}/admin/images/pending`, {
      headers: { 'x-user-id': user.id, 'x-user-role': user.role },
    });
    const data = await res.json();
    return data.images || [];
  },

  async moderateImage(
    user: UserProfile,
    imageId: string,
    action: 'approve' | 'reject' | 'remove',
    reason?: string
  ) {
    const res = await fetch(`${API_BASE}/admin/images/${imageId}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ action, moderatorId: user.id, reason }),
    });
    return res.json();
  },

  async getAdminReports(user: UserProfile): Promise<ReportRecord[]> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: { 'x-user-id': user.id, 'x-user-role': user.role },
    });
    const data = await res.json();
    return data.reports || [];
  },

  async resolveReport(user: UserProfile, reportId: string, status: 'resolved' | 'dismissed') {
    const res = await fetch(`${API_BASE}/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ moderatorId: user.id, status }),
    });
    return res.json();
  },

  async getAdminUsers(user: UserProfile): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'x-user-id': user.id, 'x-user-role': user.role },
    });
    const data = await res.json();
    return data.profiles || [];
  },

  async updateAdminUserRole(user: UserProfile, targetId: string, role: string) {
    const res = await fetch(`${API_BASE}/admin/users/${targetId}/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  async updateAdminUserStatus(user: UserProfile, targetId: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/users/${targetId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async getAdminLogs(user: UserProfile): Promise<ModerationLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { 'x-user-id': user.id, 'x-user-role': user.role },
    });
    const data = await res.json();
    return data.logs || [];
  },

  async createActress(user: UserProfile, data: any) {
    const res = await fetch(`${API_BASE}/admin/actresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateActress(user: UserProfile, id: string, data: any) {
    const res = await fetch(`${API_BASE}/admin/actresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async mergeActresses(user: UserProfile, sourceId: string, targetId: string) {
    const res = await fetch(`${API_BASE}/admin/actresses/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ sourceId, targetId, moderatorId: user.id }),
    });
    return res.json();
  },
};
