import React, { useState, useEffect } from 'react';
import { Flame, TrendingUp, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Actress } from '../lib/types.js';
import { api } from '../lib/api.js';

interface TrendingProps {
  navigate: (route: string) => void;
}

export const Trending: React.FC<TrendingProps> = ({ navigate }) => {
  const [weeklyTrending, setWeeklyTrending] = useState<Actress[]>([]);
  const [monthlyTrending, setMonthlyTrending] = useState<Actress[]>([]);
  const [activeWindow, setActiveWindow] = useState<'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTrending() {
      setIsLoading(true);
      try {
        const [wRes, mRes] = await Promise.all([
          api.getLeaderboard({ period: 'weekly' }),
          api.getLeaderboard({ period: 'monthly' }),
        ]);
        setWeeklyTrending(wRes.rankings || []);
        setMonthlyTrending(mRes.rankings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrending();
  }, []);

  const currentList = activeWindow === 'weekly' ? weeklyTrending : monthlyTrending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#232331]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#A78BFA] uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Real Momentum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F7F7FA] font-display tracking-tight">
            Trending Actresses
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
            Calculated from net vote momentum changes during verified active windows.
          </p>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#15151C] border border-[#232331] rounded-xl self-start">
          <button
            onClick={() => setActiveWindow('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeWindow === 'weekly' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setActiveWindow('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeWindow === 'monthly' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
          No vote events recorded in this time window yet. Cast a vote in Discovery to kick off the momentum!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentList.map((actress, index) => {
            const momentum = activeWindow === 'weekly' ? actress.weekly_net_delta : actress.monthly_net_delta;

            return (
              <div
                key={actress.id}
                onClick={() => navigate(`/actress/${actress.slug}`)}
                className="group relative rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/50 transition-all cursor-pointer flex flex-col justify-end aspect-[3/4] shadow-xl"
              >
                <img
                  src={actress.primary_image_url}
                  alt={actress.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent pointer-events-none" />

                {/* Momentum Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#15151C]/90 border border-[#262635] text-emerald-400 backdrop-blur-md">
                    +{momentum} net
                  </div>
                </div>

                <div className="relative z-10 p-5 flex flex-col gap-1.5">
                  <div className="text-xs text-[#A1A1B5]">
                    {actress.industry}
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
                    <span>Rate: {actress.like_rate}%</span>
                    <span>Total: {actress.total_votes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
