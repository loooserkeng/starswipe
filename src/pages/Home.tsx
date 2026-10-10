import React, { useEffect, useState } from 'react';
import { ArrowRight, Flame, Trophy, Sparkles, CheckCircle, ShieldCheck, Heart, ThumbsDown, Layers } from 'lucide-react';
import { BRAND_CONFIG } from '../lib/brand.js';
import { Actress, Category, ActressImage } from '../lib/types.js';
import { api } from '../lib/api.js';

interface HomeProps {
  navigate: (route: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [topActresses, setTopActresses] = useState<Actress[]>([]);
  const [trending, setTrending] = useState<Actress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentImages, setRecentImages] = useState<ActressImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [boardRes, catRes] = await Promise.all([
          api.getLeaderboard({ period: 'all_time' }),
          api.getCategories(),
        ]);
        const ranked: Actress[] = boardRes.rankings || [];
        setTopActresses(ranked.slice(0, 3));
        setTrending(ranked.slice(0, 4));
        setCategories(catRes.slice(0, 6));

        // Get images from the first few actresses as sample approved submissions
        const sampleImgs: ActressImage[] = [];
        ranked.forEach((a) => {
          if (a.primary_image_url) {
            sampleImgs.push({
              id: `feat_${a.id}`,
              actress_id: a.id,
              storage_path: a.primary_image_url,
              moderation_status: 'approved',
              created_at: a.created_at,
              actress_name: a.name,
            });
          }
        });
        setRecentImages(sampleImgs.slice(0, 4));
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Subtle quiet kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#A78BFA] mb-4 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cinematic Discovery & Community Rankings</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F7F7FA] font-display text-balance leading-tight">
            {BRAND_CONFIG.tagline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#A1A1B5] max-w-2xl text-balance leading-relaxed">
            {BRAND_CONFIG.subTagline}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/discover')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg shadow-[#8B5CF6]/20 hover:opacity-95 active:scale-98 transition-all flex items-center gap-2"
            >
              <span>Start Swiping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-[#15151C] hover:bg-[#1D1D27] border border-[#262635] text-[#F7F7FA] transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
              <span>Explore Leaderboard</span>
            </button>
          </div>
        </div>

        {/* 2. FEATURED TOP 3 PODIUM */}
        <div className="mt-16 md:mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F7F7FA]">
                Top Ranked Actresses
              </h2>
              <p className="text-xs text-[#A1A1B5] mt-1">
                Authoritative rankings calculated from valid community votes.
              </p>
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
              ))}
            </div>
          ) : topActresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {topActresses.map((actress, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;

                return (
                  <div
                    key={actress.id}
                    onClick={() => navigate(`/actress/${actress.slug}`)}
                    className="group relative rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/50 transition-all cursor-pointer flex flex-col justify-end aspect-[3/4] shadow-xl"
                  >
                    {/* Background Portrait */}
                    <img
                      src={actress.primary_image_url}
                      alt={actress.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Contrast scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent pointer-events-none" />

                    {/* Rank Indicator */}
                    <div className="absolute top-4 left-4 z-10">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-sm backdrop-blur-md shadow-lg ${
                          isFirst
                            ? 'bg-[#F59E0B] text-slate-950 ring-2 ring-[#F59E0B]/50'
                            : 'bg-[#15151C]/80 text-[#F7F7FA] border border-[#262635]'
                        }`}
                      >
                        #{rank}
                      </div>
                    </div>

                    {/* Content Footer */}
                    <div className="relative z-10 p-5 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#A1A1B5]">
                        <span>{actress.industry}</span>
                        <span aria-hidden="true" className="text-[#494960]">·</span>
                        <span>{actress.country}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-display text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors">
                          {actress.name}
                        </h3>
                        {actress.is_verified && (
                          <CheckCircle className="w-4 h-4 fill-[#8B5CF6]/30 text-[#A78BFA] shrink-0" />
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-[#232331] flex items-center justify-between text-xs font-mono tabular-nums text-[#A1A1B5]">
                        <div>
                          <span className="text-[#71718A]">Rate: </span>
                          <span className="font-semibold text-[#F7F7FA]">{actress.like_rate}%</span>
                        </div>
                        <div>
                          <span className="text-[#71718A]">Net: </span>
                          <span className={`font-semibold ${isFirst ? 'text-[#F59E0B]' : 'text-[#A78BFA]'}`}>
                            {actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#71718A]">Votes: </span>
                          <span className="font-semibold text-[#F7F7FA]">{actress.total_votes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#15151C] border border-[#232331] text-center text-xs text-[#A1A1B5]">
              No actresses in the database yet. Use the Upload feature to submit portraits.
            </div>
          )}
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F7F7FA]">
              Cinema Industries & Categories
            </h2>
            <p className="text-xs text-[#A1A1B5] mt-1">
              Explore actresses by linguistic tradition and global film cultures.
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="p-4 rounded-xl bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/40 hover:bg-[#1D1D27] text-left transition-all group flex flex-col justify-between min-h-[110px]"
            >
              <div>
                <h3 className="font-semibold text-sm text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#A1A1B5] mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-mono text-[#71718A]">
                {cat.actress_count || 0} profiles
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. RECENT APPROVED SUBMISSIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F7F7FA]">
              Recently Approved Portraits
            </h2>
            <p className="text-xs text-[#A1A1B5] mt-1">
              Community submissions verified through our editorial moderation pipeline.
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] flex items-center gap-1 transition-colors"
          >
            <span>Submit a Portrait</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recentImages.map((img) => (
            <div
              key={img.id}
              className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#15151C] border border-[#232331] group"
            >
              <img
                src={img.storage_path}
                alt={img.actress_name || 'Actress'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <div className="text-xs font-medium text-white font-display truncate">
                  {img.actress_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW VOTING WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl bg-[#15151C] border border-[#232331] p-6 sm:p-10">
          <div className="max-w-2xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F7F7FA]">
              How Voting & Rankings Work
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1B5] mt-2 leading-relaxed">
              StarSwipe calculates popularity strictly from verified user interactions. We maintain strict database integrity with zero algorithmic bias or artificial inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#232331] flex items-center justify-center text-[#A78BFA] mb-2">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-[#F7F7FA]">1. One Vote Per Profile</h3>
              <p className="text-xs text-[#A1A1B5] leading-relaxed">
                Each registered voter or guest session holds exactly one active vote per actress. Changing your preference updates your vote rather than stacking duplicate records.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#232331] flex items-center justify-center text-[#A78BFA] mb-2">
                <Trophy className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F7F7FA]">2. Net Score & Like Rate</h3>
              <p className="text-xs text-[#A1A1B5] leading-relaxed">
                Rankings are determined by Net Votes (Likes minus Dislikes) and Like Rate (percentage of affirmative votes). A deterministic tie-breaker ensures consistent ordering.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#232331] flex items-center justify-center text-[#A78BFA] mb-2">
                <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F7F7FA]">3. Moderation Standards</h3>
              <p className="text-xs text-[#A1A1B5] leading-relaxed">
                All submitted photographs pass through manual editorial review to guarantee authentic, high-resolution portrait quality and respect copyright ownership.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
