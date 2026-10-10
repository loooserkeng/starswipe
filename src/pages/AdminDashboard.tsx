import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Actress, ActressImage, UserProfile, AdminStats, ReportRecord, ModerationLog, Category } from '../lib/types.js';
import { Shield, Users, Image as ImageIcon, Flag, BarChart3, Settings as SettingsIcon, Check, X, Trash2, Plus, Edit, Merge, AlertTriangle, CheckCircle, Database } from 'lucide-react';

interface AdminDashboardProps {
  navigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'actresses' | 'images' | 'reports' | 'users' | 'logs'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [actresses, setActresses] = useState<Actress[]>([]);
  const [pendingImages, setPendingImages] = useState<ActressImage[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingImageId, setRejectingImageId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Low image resolution or lighting');

  // Actress Create/Edit modal
  const [showActressModal, setShowActressModal] = useState(false);
  const [editingActress, setEditingActress] = useState<Partial<Actress> | null>(null);
  const [actressForm, setActressForm] = useState({
    name: '',
    biography: '',
    industry: 'Malayalam & Tamil Cinema',
    country: 'India',
    categoryIds: [] as string[],
    is_verified: true,
  });

  // Actress Merge modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');

  const loadAllData = async () => {
    if (!user || !isStaff) return;
    setLoading(true);
    try {
      const [st, acts, imgs, reps, usrs, lgs, cats] = await Promise.all([
        api.getAdminOverview(user),
        api.getActresses({ status: 'active' }),
        api.getAdminPendingImages(user),
        api.getAdminReports(user),
        api.getAdminUsers(user),
        api.getAdminLogs(user),
        api.getCategories(),
      ]);
      setStats(st);
      setActresses(acts);
      setPendingImages(imgs);
      setReports(reps);
      setUsersList(usrs);
      setLogs(lgs);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user, isStaff]);

  if (!isStaff || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-display text-[#F7F7FA]">Restricted Access</h2>
        <p className="text-xs text-[#A1A1B5] mt-2">
          Administrator or moderator authorization is required to access this dashboard.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white"
        >
          Sign In as Staff
        </button>
      </div>
    );
  }

  // Action handlers
  const handleApproveImage = async (id: string) => {
    await api.moderateImage(user, id, 'approve');
    loadAllData();
  };

  const handleRejectImage = async () => {
    if (!rejectingImageId) return;
    await api.moderateImage(user, rejectingImageId, 'reject', rejectReason);
    setRejectingImageId(null);
    loadAllData();
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await api.resolveReport(user, reportId, status);
    loadAllData();
  };

  const handleToggleUserRole = async (targetUser: UserProfile) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    await api.updateAdminUserRole(user, targetUser.id, nextRole);
    loadAllData();
  };

  const handleToggleUserStatus = async (targetUser: UserProfile) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    await api.updateAdminUserStatus(user, targetUser.id, nextStatus);
    loadAllData();
  };

  const handleSaveActress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actressForm.name.trim()) return;

    if (editingActress?.id) {
      await api.updateActress(user, editingActress.id, actressForm);
    } else {
      await api.createActress(user, actressForm);
    }
    setShowActressModal(false);
    setEditingActress(null);
    loadAllData();
  };

  const handleMergeActresses = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId) return;
    await api.mergeActresses(user, mergeSourceId, mergeTargetId);
    setShowMergeModal(false);
    loadAllData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#232331]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F7FA] font-display">
              StarSwipe Staff Console
            </h1>
            <p className="text-xs text-[#A1A1B5]">
              Administrative supervision, community portrait moderation, and ledger auditing.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#15151C] border border-[#232331] rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'images' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            <span>Moderation</span>
            {pendingImages.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#8B5CF6] text-white text-[10px] flex items-center justify-center">
                {pendingImages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('actresses')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'actresses' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Actresses
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            <span>Reports</span>
            {reports.filter((r) => r.status === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                {reports.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'logs' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#15151C] border border-[#232331]">
              <div className="text-xs text-[#71718A]">Total Actresses</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#F7F7FA] mt-1">
                {stats?.totalActresses || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#15151C] border border-[#232331]">
              <div className="text-xs text-[#71718A]">Approved Portraits</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#A78BFA] mt-1">
                {stats?.totalApprovedImages || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#15151C] border border-[#232331]">
              <div className="text-xs text-[#71718A]">Pending Review</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-[#F59E0B] mt-1">
                {stats?.pendingSubmissions || 0}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#15151C] border border-[#232331]">
              <div className="text-xs text-[#71718A]">Total Valid Votes</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {stats?.totalValidCurrentVotes || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331]">
              <h3 className="text-sm font-bold font-display text-[#F7F7FA] mb-4">
                Voting Integrity & Abuse Alerts
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331] flex items-center justify-between">
                  <span>Votes Cast Today:</span>
                  <span className="font-mono font-semibold text-[#F7F7FA]">{stats?.votesToday || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331] flex items-center justify-between">
                  <span>Suspicious Rapid Spikes:</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    {stats?.suspiciousSpikeAlerts === 0 ? 'None detected (Normal)' : `${stats?.suspiciousSpikeAlerts} alert`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331] flex items-center justify-between">
                  <span>Database Constraint Invariant:</span>
                  <span className="font-mono font-semibold text-[#A78BFA]">Unique(user_id, actress_id)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331]">
              <h3 className="text-sm font-bold font-display text-[#F7F7FA] mb-4">
                Pending Queues
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331] flex items-center justify-between">
                  <span>Pending Community Submissions:</span>
                  <button
                    onClick={() => setActiveTab('images')}
                    className="font-mono font-semibold text-[#A78BFA] hover:underline"
                  >
                    {pendingImages.length} images to review →
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0F] border border-[#232331] flex items-center justify-between">
                  <span>Open Content Reports:</span>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="font-mono font-semibold text-rose-400 hover:underline"
                  >
                    {reports.filter((r) => r.status === 'pending').length} reports pending →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMAGE MODERATION */}
      {activeTab === 'images' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-[#F7F7FA]">
              Pending Submissions Queue ({pendingImages.length})
            </h2>
          </div>

          {pendingImages.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
              All submissions have been reviewed. The moderation queue is clear!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pendingImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden flex flex-col shadow-xl"
                >
                  <div className="aspect-[3/4] bg-[#0B0B0F]">
                    <img
                      src={img.storage_path}
                      alt={img.actress_name || 'Submission'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#F7F7FA] font-display">
                        {img.actress_name}
                      </div>
                      <div className="text-[11px] text-[#A1A1B5] mt-0.5">
                        Attribution: {img.attribution || 'Not specified'}
                      </div>
                      <div className="text-[10px] font-mono text-[#71718A] mt-1 truncate">
                        Hash: {img.content_hash}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#232331]">
                      <button
                        onClick={() => handleApproveImage(img.id)}
                        className="py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setRejectingImageId(img.id)}
                        className="py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTRESSES MANAGEMENT */}
      {activeTab === 'actresses' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold font-display text-[#F7F7FA]">
              Actress Profiles Directory ({actresses.length})
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingActress(null);
                  setActressForm({
                    name: '',
                    biography: '',
                    industry: 'Malayalam & Tamil Cinema',
                    country: 'India',
                    categoryIds: categories.length > 0 ? [categories[0].id] : [],
                    is_verified: true,
                  });
                  setShowActressModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Profile</span>
              </button>
              <button
                onClick={() => setShowMergeModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#232331] hover:bg-[#2E2E42] text-[#F7F7FA] flex items-center gap-1.5"
              >
                <Merge className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Merge Duplicates</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12121A] text-[#71718A] uppercase font-mono border-b border-[#232331]">
                <tr>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Industry</th>
                  <th className="py-3 px-6">Categories</th>
                  <th className="py-3 px-6 text-right font-mono">Net Score</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232331]">
                {actresses.map((a) => (
                  <tr key={a.id} className="hover:bg-[#1D1D27]">
                    <td className="py-3 px-6 font-medium text-[#F7F7FA]">
                      <div className="flex items-center gap-2">
                        <span>{a.name}</span>
                        {a.is_verified && <CheckCircle className="w-3.5 h-3.5 text-[#A78BFA]" />}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-[#A1A1B5]">{a.industry}</td>
                    <td className="py-3 px-6 text-[#A1A1B5]">
                      {a.categories.map((c) => c.name).join(', ') || 'None'}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums text-[#A78BFA]">
                      {a.net_votes > 0 ? `+${a.net_votes}` : a.net_votes}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => {
                          setEditingActress(a);
                          setActressForm({
                            name: a.name,
                            biography: a.biography,
                            industry: a.industry,
                            country: a.country,
                            categoryIds: a.categories.map((c) => c.id),
                            is_verified: !!a.is_verified,
                          });
                          setShowActressModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#232331] hover:bg-[#2F2F42] text-[#F7F7FA]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold font-display text-[#F7F7FA]">
            User Reports & Copyright Claims
          </h2>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
              No user reports pending review.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-[#15151C] border border-[#232331] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#F7F7FA]">
                        Reason: {rep.reason}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                          rep.status === 'pending'
                            ? 'bg-amber-950/80 text-amber-300'
                            : 'bg-emerald-950/80 text-emerald-300'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1B5] mt-1">
                      Target: {rep.target_type} ({rep.target_label || rep.target_id})
                    </div>
                    {rep.details && (
                      <div className="text-xs text-[#71718A] mt-1 italic">
                        "{rep.details}"
                      </div>
                    )}
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Resolve & Action
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#232331] hover:bg-[#2E2E42] text-[#A1A1B5]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold font-display text-[#F7F7FA]">
            Platform Users & Roles
          </h2>

          <div className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12121A] text-[#71718A] uppercase font-mono border-b border-[#232331]">
                <tr>
                  <th className="py-3 px-6">Display Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232331]">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1D1D27]">
                    <td className="py-3 px-6 font-medium text-[#F7F7FA]">{u.display_name}</td>
                    <td className="py-3 px-6 text-[#A1A1B5]">{u.email}</td>
                    <td className="py-3 px-6">
                      <span className="capitalize font-mono text-[#A78BFA]">{u.role}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`capitalize font-semibold ${
                          u.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#232331] hover:bg-[#2F2F42] text-[#F7F7FA]"
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-6">
          <h2 className="text-lg font-bold font-display text-[#F7F7FA]">
            Moderation & System Audit Logs
          </h2>

          <div className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12121A] text-[#71718A] uppercase font-mono border-b border-[#232331]">
                <tr>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Target</th>
                  <th className="py-3 px-6">Reason / Details</th>
                  <th className="py-3 px-6 text-right font-mono">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232331]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1D1D27]">
                    <td className="py-3 px-6 font-mono text-[#A78BFA] font-semibold">{log.action}</td>
                    <td className="py-3 px-6 text-[#F7F7FA]">{log.target_type}: {log.target_id}</td>
                    <td className="py-3 px-6 text-[#A1A1B5]">{log.reason || '—'}</td>
                    <td className="py-3 px-6 text-right font-mono text-[#71718A]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingImageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#15151C] border border-[#262635] p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-[#F7F7FA] font-display">
              Reject Image Submission
            </h3>
            <p className="text-xs text-[#A1A1B5]">
              Please specify the reason for rejection to notify the community uploader.
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
            >
              <option value="Low image resolution or lighting">Low portrait resolution or harsh lighting</option>
              <option value="Unverified or copyright infringement">Unverified ownership / Potential copyright</option>
              <option value="Inappropriate or explicit content">Inappropriate or prohibited content</option>
              <option value="Wrong actress tagged">Mismatched actress identity</option>
              <option value="Duplicate image already archived">Duplicate image already present</option>
            </select>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setRejectingImageId(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#A1A1B5]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectImage}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ACTRESS MODAL */}
      {showActressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleSaveActress}
            className="w-full max-w-lg rounded-2xl bg-[#15151C] border border-[#262635] p-6 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-[#F7F7FA] font-display">
              {editingActress ? 'Edit Actress Profile' : 'Create New Actress Profile'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5]">Actress Name *</label>
              <input
                type="text"
                required
                value={actressForm.name}
                onChange={(e) => setActressForm({ ...actressForm, name: e.target.value })}
                className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A1A1B5]">Cinema Industry</label>
                <input
                  type="text"
                  value={actressForm.industry}
                  onChange={(e) => setActressForm({ ...actressForm, industry: e.target.value })}
                  className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A1A1B5]">Country</label>
                <input
                  type="text"
                  value={actressForm.country}
                  onChange={(e) => setActressForm({ ...actressForm, country: e.target.value })}
                  className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5]">Biography</label>
              <textarea
                rows={3}
                value={actressForm.biography}
                onChange={(e) => setActressForm({ ...actressForm, biography: e.target.value })}
                className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#A1A1B5] cursor-pointer">
              <input
                type="checkbox"
                checked={actressForm.is_verified}
                onChange={(e) => setActressForm({ ...actressForm, is_verified: e.target.checked })}
                className="rounded-sm accent-[#8B5CF6]"
              />
              <span>Mark as Administrator-Verified Profile</span>
            </label>

            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => setShowActressModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A1A1B5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MERGE DUPLICATES MODAL */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleMergeActresses}
            className="w-full max-w-md rounded-2xl bg-[#15151C] border border-[#262635] p-6 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-[#F7F7FA] font-display">
              Merge Duplicate Profiles
            </h3>
            <p className="text-xs text-[#A1A1B5]">
              Transfers all images and votes from the source profile to the target profile, then archives the source.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5]">Source (Duplicate to remove):</label>
              <select
                value={mergeSourceId}
                onChange={(e) => setMergeSourceId(e.target.value)}
                className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
              >
                <option value="">-- Select Source Actress --</option>
                {actresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.industry})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5]">Target (Canonical profile to keep):</label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA]"
              >
                <option value="">-- Select Target Actress --</option>
                {actresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.industry})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A1A1B5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!mergeSourceId || !mergeTargetId || mergeSourceId === mergeTargetId}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 disabled:opacity-50 text-white"
              >
                Execute Merge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
