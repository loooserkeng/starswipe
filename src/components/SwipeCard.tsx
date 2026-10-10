import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Heart, X, RotateCcw, SkipForward, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Actress, VoteType } from '../lib/types.js';

interface SwipeCardProps {
  actress: Actress;
  onVote: (voteType: VoteType) => Promise<boolean>;
  onSkip: () => void;
  onUndo: () => void;
  onViewProfile: (slug: string) => void;
  canUndo: boolean;
  isVoting: boolean;
  voteError: string | null;
  onClearError: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  actress,
  onVote,
  onSkip,
  onUndo,
  onViewProfile,
  canUndo,
  isVoting,
  voteError,
  onClearError,
}) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Motion drag values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const dislikeOpacity = useTransform(x, [-120, -40], [1, 0]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVoting) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerVote('like');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerVote('dislike');
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        onSkip();
      } else if ((e.key === 'z' || e.key === 'Z') && canUndo) {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoting, canUndo, actress.id]);

  const triggerVote = async (type: VoteType) => {
    if (isVoting) return;
    setExitDirection(type === 'like' ? 'right' : 'left');
    const success = await onVote(type);
    if (!success) {
      setExitDirection(null);
    }
  };

  const handleDragEnd = async (_: any, info: { offset: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      triggerVote('like');
    } else if (info.offset.x < -threshold) {
      triggerVote('dislike');
    } else {
      x.set(0);
    }
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] max-h-[600px] flex flex-col justify-end select-none">
      {voteError && (
        <div className="absolute top-2 left-2 right-2 z-50 p-3 rounded-xl bg-red-950/90 border border-red-500/40 text-red-200 text-xs flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{voteError}</span>
          </div>
          <button
            onClick={onClearError}
            className="px-2 py-0.5 rounded bg-red-900/60 hover:bg-red-800 text-[11px] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Draggable Card */}
      <motion.div
        drag={isVoting ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        animate={
          exitDirection === 'right'
            ? { x: 500, opacity: 0, rotate: 20 }
            : exitDirection === 'left'
            ? { x: -500, opacity: 0, rotate: -20 }
            : { x: 0, opacity: 1, rotate: 0 }
        }
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-end"
      >
        {/* Background Image / Zero-Broken-Image Fallback */}
        <div className="absolute inset-0 z-0 bg-[#12121A]">
          {!imageError ? (
            <img
              src={actress.primary_image_url}
              alt={actress.name}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1E1B4B] via-[#15151C] to-[#0B0B0F]">
              <div className="w-20 h-20 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] font-bold text-2xl font-display mb-3">
                {actress.name.charAt(0)}
              </div>
              <p className="text-sm font-semibold text-[#F7F7FA]">{actress.name}</p>
              <p className="text-xs text-[#A1A1B5] mt-1">{actress.industry}</p>
            </div>
          )}

          {/* Measured Scrim for WCAG 4.5:1 text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent pointer-events-none" />
        </div>

        {/* Dynamic Drag Overlays: LIKE & DISLIKE stamps */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 z-20 pointer-events-none border-2 border-emerald-400 text-emerald-400 font-display font-extrabold text-2xl px-4 py-1 rounded-lg uppercase tracking-wider rotate-[-12deg] bg-emerald-950/40 backdrop-blur-xs"
        >
          LIKE
        </motion.div>

        <motion.div
          style={{ opacity: dislikeOpacity }}
          className="absolute top-8 right-8 z-20 pointer-events-none border-2 border-rose-500 text-rose-400 font-display font-extrabold text-2xl px-4 py-1 rounded-lg uppercase tracking-wider rotate-[12deg] bg-rose-950/40 backdrop-blur-xs"
        >
          DISLIKE
        </motion.div>

        {/* Card Content Footer */}
        <div className="relative z-10 p-6 pt-12 flex flex-col gap-2">
          {/* Unboxed Metadata with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
            <span>{actress.industry}</span>
            <span aria-hidden="true" className="text-[#494960]">·</span>
            <span>{actress.country}</span>
            {actress.categories.length > 0 && (
              <>
                <span aria-hidden="true" className="text-[#494960]">·</span>
                <span>{actress.categories[0].name}</span>
              </>
            )}
          </div>

          {/* Actress Name & Verification */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F7F7FA] tracking-tight flex items-center gap-2">
              <span>{actress.name}</span>
              {actress.is_verified && (
                <span title="Administrator Verified Profile" className="text-[#A78BFA] flex items-center">
                  <CheckCircle className="w-5 h-5 fill-[#8B5CF6]/30 text-[#A78BFA]" />
                </span>
              )}
            </h2>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(actress.slug);
              }}
              title="View full profile and gallery"
              className="w-8 h-8 rounded-full bg-[#1D1D27]/80 hover:bg-[#282837] border border-[#2B2B3D] text-[#A1A1B5] hover:text-[#F7F7FA] flex items-center justify-center transition-colors shrink-0"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Biography excerpt */}
          <p className="text-xs text-[#A1A1B5] line-clamp-2 leading-relaxed">
            {actress.biography}
          </p>

          {/* Current Live Stats Strip (Tabular Numerals) */}
          <div className="mt-2 pt-3 border-t border-[#232331]/80 flex items-center justify-between text-xs font-mono tabular-nums text-[#A1A1B5]">
            <div>
              <span className="text-[#71718A]">Rate: </span>
              <span className="font-semibold text-[#F7F7FA]">{actress.like_rate}%</span>
            </div>
            <div>
              <span className="text-[#71718A]">Net: </span>
              <span className="font-semibold text-[#A78BFA]">{actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}</span>
            </div>
            <div>
              <span className="text-[#71718A]">Total Votes: </span>
              <span className="font-semibold text-[#F7F7FA]">{actress.total_votes}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tactile Control Buttons Bar (Min 44x44px touch targets) */}
      <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 py-2">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo || isVoting}
          title="Undo previous vote (Z)"
          className={`min-h-[44px] min-w-[44px] w-11 h-11 rounded-full border border-[#262635] flex items-center justify-center transition-all ${
            canUndo && !isVoting
              ? 'bg-[#15151C] text-[#A1A1B5] hover:text-[#F7F7FA] hover:bg-[#1D1D27] active:scale-95'
              : 'bg-[#15151C]/40 text-[#404052] cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Dislike Button (Cross) */}
        <button
          onClick={() => triggerVote('dislike')}
          disabled={isVoting}
          title="Dislike (Left Arrow)"
          className="min-h-[52px] min-w-[52px] w-14 h-14 rounded-full bg-[#15151C] border border-[#2B2227] text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/60 flex items-center justify-center shadow-lg active:scale-95 transition-all group"
        >
          <X className="w-6 h-6 transition-transform group-hover:scale-110" />
        </button>

        {/* Skip Button */}
        <button
          onClick={onSkip}
          disabled={isVoting}
          title="Skip without voting (Space)"
          className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-full bg-[#15151C] border border-[#262635] text-[#A1A1B5] hover:text-[#F7F7FA] hover:bg-[#1D1D27] flex items-center justify-center transition-all active:scale-95"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Like Button (Heart) */}
        <button
          onClick={() => triggerVote('like')}
          disabled={isVoting}
          title="Like (Right Arrow)"
          className="min-h-[52px] min-w-[52px] w-14 h-14 rounded-full bg-[#15151C] border border-[#242A25] text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/60 flex items-center justify-center shadow-lg active:scale-95 transition-all group"
        >
          <Heart className="w-6 h-6 transition-transform group-hover:scale-110 fill-transparent group-hover:fill-emerald-400/20" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-[#55556E] mt-1">
        <span>← Dislike</span>
        <span>·</span>
        <span>Space to Skip</span>
        <span>·</span>
        <span>Like →</span>
      </div>
    </div>
  );
};
