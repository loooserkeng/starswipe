import React, { useState, useEffect } from 'react';
import { Actress, VoteType } from '../lib/types.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { ReportModal } from '../components/ReportModal.js';
import { CheckCircle, Trophy, Heart, ThumbsDown, Share2, Flag, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface ActressProfileProps {
  slug: string;
  navigate: (route: string) => void;
}

export const ActressProfile: React.FC<ActressProfileProps> = ({ slug, navigate }) => {
  const { voterId } = useAuth();
  const [actress, setActress] = useState<Actress | null>(null);
  const [related, setRelated] = useState<Actress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);
  const [reportModal, setReportModal] = useState<{ open: boolean; targetType: 'actress' | 'image'; id: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActressBySlug(slug, voterId);
      setActress(data);
      if (data) {
        // Load related in same category
        const catSlug = data.categories[0]?.slug;
        const all = await api.getActresses({ category: catSlug });
        setRelated(all.filter((a) => a.id !== data.id).slice(0, 3));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, voterId]);

  const handleVote = async (voteType: VoteType) => {
    if (!actress || isVoting) return;
    setIsVoting(true);
    try {
      const res = await api.castVote(voterId, actress.id, voteType);
      setActress((prev) =>
        prev
          ? {
              ...prev,
              user_vote: voteType,
              ...res.actressMetrics,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
      </div>
    );
  }

  if (!actress) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-display text-[#F7F7FA]">Actress Not Found</h2>
        <p className="text-xs text-[#A1A1B5] mt-2">The requested profile could not be found or has been merged.</p>
        <button
          onClick={() => navigate('/leaderboard')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white"
        >
          Return to Leaderboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="flex items-center gap-2 text-xs font-semibold text-[#A1A1B5] hover:text-[#F7F7FA] self-start transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Rankings</span>
      </button>

      {/* Main Profile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Portrait & Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] shadow-2xl">
            <img
              src={selectedGalleryImg || actress.primary_image_url}
              alt={actress.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {actress.rank && (
              <div className="absolute top-4 left-4 z-10">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm backdrop-blur-md shadow-lg ${
                    actress.rank === 1
                      ? 'bg-[#F59E0B] text-slate-950 ring-2 ring-[#F59E0B]/50'
                      : 'bg-[#15151C]/90 text-[#F7F7FA] border border-[#262635]'
                  }`}
                >
                  #{actress.rank}
                </div>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {actress.gallery_urls && actress.gallery_urls.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {actress.gallery_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGalleryImg(url)}
                  className={`w-16 h-20 rounded-xl overflow-hidden border transition-all shrink-0 ${
                    (selectedGalleryImg || actress.primary_image_url) === url
                      ? 'border-[#8B5CF6] scale-105'
                      : 'border-[#262635] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Gallery ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Bio, Stats, Live Voting Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#A1A1B5] mb-2">
              <span>{actress.industry}</span>
              <span aria-hidden="true" className="text-[#494960]">·</span>
              <span>{actress.country}</span>
              {actress.categories.map((c) => (
                <React.Fragment key={c.id}>
                  <span aria-hidden="true" className="text-[#494960]">·</span>
                  <button
                    onClick={() => navigate(`/categories/${c.slug}`)}
                    className="hover:text-[#F7F7FA] transition-colors"
                  >
                    {c.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#F7F7FA] flex items-center gap-2.5">
                <span>{actress.name}</span>
                {actress.is_verified && (
                  <span title="Administrator Verified Profile">
                    <CheckCircle className="w-6 h-6 fill-[#8B5CF6]/30 text-[#A78BFA]" />
                  </span>
                )}
              </h1>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  title="Share profile"
                  className="p-2.5 rounded-xl bg-[#15151C] border border-[#262635] text-[#A1A1B5] hover:text-[#F7F7FA] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setReportModal({ open: true, targetType: 'actress', id: actress.id })}
                  title="Report profile or image"
                  className="p-2.5 rounded-xl bg-[#15151C] border border-[#262635] text-[#A1A1B5] hover:text-rose-400 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Voting Actions Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#15151C] border border-[#232331] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#F7F7FA]">Your Preference</div>
              <div className="text-[11px] text-[#A1A1B5] mt-0.5">
                {actress.user_vote
                  ? `You previously voted: ${actress.user_vote.toUpperCase()}`
                  : 'Cast your vote to influence live standings.'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote('dislike')}
                disabled={isVoting}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  actress.user_vote === 'dislike'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-[#1D1D27] border-[#2B2227] text-rose-400 hover:bg-rose-950/30'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>Dislike</span>
              </button>

              <button
                onClick={() => handleVote('like')}
                disabled={isVoting}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                  actress.user_vote === 'like'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#1D1D27] border-[#242A25] text-emerald-400 hover:bg-emerald-950/30'
                }`}
              >
                <Heart className="w-4 h-4 fill-emerald-400/20" />
                <span>Like</span>
              </button>
            </div>
          </div>

          {/* Quantitative Metrics Grid (Tabular Numerals) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#15151C] border border-[#232331]">
              <div className="text-[11px] text-[#71718A]">Overall Rank</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#F7F7FA] mt-1">
                #{actress.rank || '—'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#15151C] border border-[#232331]">
              <div className="text-[11px] text-[#71718A]">Net Score</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#A78BFA] mt-1">
                {actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#15151C] border border-[#232331]">
              <div className="text-[11px] text-[#71718A]">Like Rate</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#F7F7FA] mt-1">
                {actress.like_rate}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#15151C] border border-[#232331]">
              <div className="text-[11px] text-[#71718A]">Total Votes</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#F7F7FA] mt-1">
                {actress.total_votes}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="p-6 rounded-2xl bg-[#15151C] border border-[#232331]">
            <h3 className="text-sm font-bold font-display text-[#F7F7FA] mb-2">
              Public Profile & Filmography
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1B5] leading-relaxed">
              {actress.biography}
            </p>
          </div>
        </div>
      </div>

      {/* Related Profiles in Industry */}
      {related.length > 0 && (
        <div className="pt-8 border-t border-[#232331]">
          <h2 className="text-xl font-bold font-display text-[#F7F7FA] mb-6">
            Related Performers in {actress.categories[0]?.name || actress.industry}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/actress/${rel.slug}`)}
                className="group relative rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/50 transition-all cursor-pointer aspect-[3/4] flex flex-col justify-end shadow-xl"
              >
                <img
                  src={rel.primary_image_url}
                  alt={rel.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent pointer-events-none" />

                <div className="relative z-10 p-5 flex flex-col gap-1">
                  <h3 className="text-lg font-bold font-display text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors">
                    {rel.name}
                  </h3>
                  <div className="text-xs font-mono tabular-nums text-[#A1A1B5]">
                    Rate: {rel.like_rate}% · Net: {rel.net_votes > 0 ? `+${rel.net_votes}` : rel.net_votes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <ReportModal
          isOpen={reportModal.open}
          onClose={() => setReportModal(null)}
          targetType={reportModal.targetType}
          targetId={reportModal.id}
          targetName={actress.name}
        />
      )}
    </div>
  );
};
