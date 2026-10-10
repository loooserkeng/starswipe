import React, { useState, useEffect } from 'react';
import { Actress, Category, VoteType } from '../lib/types.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { SwipeCard } from '../components/SwipeCard.js';
import { ReportModal } from '../components/ReportModal.js';
import { Filter, RotateCcw, Check, Sparkles, AlertCircle, Flag } from 'lucide-react';

interface DiscoverProps {
  navigate: (route: string) => void;
}

export const Discover: React.FC<DiscoverProps> = ({ navigate }) => {
  const { voterId } = useAuth();
  const [currentActress, setCurrentActress] = useState<Actress | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [remainingCount, setRemainingCount] = useState<number>(0);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [lastVotedActressId, setLastVotedActressId] = useState<string | null>(null);
  const [voteFeedback, setVoteFeedback] = useState<{ type: 'like' | 'dislike'; name: string } | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  // Report modal state
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  // Load categories
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Load next swipe
  const loadNext = async (catSlug?: string) => {
    setIsLoading(true);
    setVoteError(null);
    try {
      const res = await api.getNextSwipe(voterId, catSlug !== undefined ? catSlug : selectedCategory);
      setCurrentActress(res.actress);
      setRemainingCount(res.remainingCount);
      setIsExhausted(res.exhausted);
    } catch (err: any) {
      console.error(err);
      setVoteError('Unable to load discovery stream. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNext();
  }, [selectedCategory, voterId]);

  // Handle Vote
  const handleVote = async (type: VoteType): Promise<boolean> => {
    if (!currentActress || isVoting) return false;
    setIsVoting(true);
    setVoteError(null);

    const actressToVote = currentActress;
    try {
      await api.castVote(voterId, actressToVote.id, type);
      setLastVotedActressId(actressToVote.id);
      setVoteFeedback({ type, name: actressToVote.name });

      // Clear feedback after 1.5s
      setTimeout(() => setVoteFeedback(null), 1500);

      // Load next card
      const res = await api.getNextSwipe(voterId, selectedCategory);
      setCurrentActress(res.actress);
      setRemainingCount(res.remainingCount);
      setIsExhausted(res.exhausted);
      return true;
    } catch (err: any) {
      console.error('Vote failed:', err);
      setVoteError('Vote could not be recorded. Card preserved—tap to retry.');
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  // Handle Skip
  const handleSkip = () => {
    loadNext();
  };

  // Handle Undo
  const handleUndo = async () => {
    if (!lastVotedActressId || isVoting) return;
    setIsVoting(true);
    try {
      await api.undoVote(voterId, lastVotedActressId);
      const prev = await api.getActresses({ voterId });
      const undone = prev.find((a) => a.id === lastVotedActressId);
      if (undone) {
        setCurrentActress(undone);
        setIsExhausted(false);
      }
      setLastVotedActressId(null);
    } catch (err) {
      console.error('Undo failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col items-center">
      {/* Top Filter & Status Header */}
      <div className="w-full max-w-md flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#A1A1B5]" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
            }}
            className="bg-[#15151C] border border-[#262635] rounded-lg px-2.5 py-1.5 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {remainingCount > 0 ? (
            <span className="text-[11px] font-mono text-[#A1A1B5] tabular-nums">
              {remainingCount} unvoted
            </span>
          ) : (
            <span className="text-[11px] font-mono text-[#A78BFA]">
              Catalog Complete
            </span>
          )}

          {currentActress && (
            <button
              onClick={() => setReportTarget({ id: currentActress.id, name: currentActress.name })}
              title="Report content"
              className="p-1.5 rounded-lg text-[#71718A] hover:text-rose-400 hover:bg-[#15151C] transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subtle floating vote toast notification */}
      {voteFeedback && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-xl bg-[#15151C]/95 border border-[#262635] shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md animate-fade-in">
          {voteFeedback.type === 'like' ? (
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-rose-400" />
          )}
          <span className="text-[#F7F7FA] font-medium">
            Recorded {voteFeedback.type === 'like' ? 'Like' : 'Dislike'} for {voteFeedback.name}
          </span>
        </div>
      )}

      {/* Main Interactive Stage */}
      {isLoading ? (
        <div className="w-full max-w-sm sm:max-w-md aspect-[3/4] max-h-[600px] rounded-2xl bg-[#15151C] border border-[#232331] animate-pulse flex flex-col justify-end p-6">
          <div className="h-4 bg-[#232331] rounded-sm w-1/3 mb-2" />
          <div className="h-6 bg-[#232331] rounded-sm w-2/3 mb-2" />
          <div className="h-3 bg-[#232331] rounded-sm w-full mb-1" />
          <div className="h-3 bg-[#232331] rounded-sm w-4/5" />
        </div>
      ) : currentActress ? (
        <SwipeCard
          actress={currentActress}
          onVote={handleVote}
          onSkip={handleSkip}
          onUndo={handleUndo}
          onViewProfile={(slug) => navigate(`/actress/${slug}`)}
          canUndo={!!lastVotedActressId}
          isVoting={isVoting}
          voteError={voteError}
          onClearError={() => setVoteError(null)}
        />
      ) : (
        /* Empty / Exhausted State */
        <div className="w-full max-w-md p-8 sm:p-12 rounded-2xl bg-[#15151C] border border-[#262635] text-center flex flex-col items-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#A78BFA] mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-[#F7F7FA]">
            You've Explored All Profiles
          </h2>
          <p className="text-xs text-[#A1A1B5] mt-2 max-w-xs leading-relaxed">
            You've cast votes on every actress currently available in this category. Check the live rankings or contribute a portrait.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white hover:opacity-95 transition-opacity"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => {
                setSelectedCategory('');
                loadNext('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#232331] text-[#F7F7FA] hover:bg-[#2F2F42] transition-colors"
            >
              Browse All Categories
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType="actress"
          targetId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
};
