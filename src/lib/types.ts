export type Role = 'user' | 'moderator' | 'admin';
export type VoteType = 'like' | 'dislike';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'removed';
export type ReportTargetType = 'actress' | 'image';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: Role;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  actress_count?: number;
  created_at: string;
}

export interface ActressImage {
  id: string;
  actress_id: string;
  uploader_id?: string;
  storage_path: string;
  thumbnail_path?: string;
  source_url?: string;
  attribution?: string;
  moderation_status: ModerationStatus;
  rejection_reason?: string;
  content_hash?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  actress_name?: string;
}

export interface Actress {
  id: string;
  name: string;
  slug: string;
  biography: string;
  industry: string;
  country: string;
  primary_image_id: string;
  primary_image_url: string;
  gallery_urls?: string[];
  images?: ActressImage[];
  categories: Category[];
  status: 'active' | 'archived';
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
  
  // Real-time calculated voting metrics
  likes: number;
  dislikes: number;
  total_votes: number;
  net_votes: number;
  like_rate: number; // 0 to 100
  rank?: number;
  previous_rank?: number;
  weekly_net_delta?: number;
  monthly_net_delta?: number;
  user_vote?: VoteType | null;
}

export interface VoteRecord {
  id: string;
  user_id: string;
  actress_id: string;
  vote_type: VoteType;
  created_at: string;
  updated_at: string;
}

export interface VoteEvent {
  id: string;
  voter_reference: string;
  actress_id: string;
  previous_vote_type: VoteType | null;
  new_vote_type: VoteType;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  reporter_id: string;
  reporter_email?: string;
  target_type: ReportTargetType;
  target_id: string;
  target_label?: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  created_at: string;
  resolved_at?: string;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  moderator_name?: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label?: string;
  reason?: string;
  created_at: string;
}

export interface CopyrightClaim {
  id: string;
  image_id: string;
  image_url?: string;
  claimant_contact: string;
  claim_details: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
}

export interface AdminStats {
  totalActresses: number;
  totalApprovedImages: number;
  pendingSubmissions: number;
  votesToday: number;
  totalValidCurrentVotes: number;
  reportedContentCount: number;
  suspiciousSpikeAlerts: number;
}

export interface RankingOptions {
  period?: 'all_time' | 'weekly' | 'monthly' | 'like_rate';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}
