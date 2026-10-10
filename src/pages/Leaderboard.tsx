import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Heart, Search, Filter, Share2, CheckCircle, ArrowUpRight, ArrowDownRight, Minus, Check } from 'lucide-react';
import { Actress, Category } from '../lib/types.js';
import { api } from '../lib/api.js';

interface LeaderboardProps {
  navigate: (route: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ navigate }) => {
  const [rankings, setRankings] = useState<Actress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<'all_time' | 'weekly' | 'monthly' | 'like_rate'>('all_time');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchRanked() {
      setIsLoading(true);
      try {
        const res = await api.getLeaderboard({
          period,
          category: selectedCategory,
          search,
        });
        setRankings(res.rankings || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRanked();
  }, [period, selectedCategory, search]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topThree = rankings.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232331]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#A78BFA] uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Authoritative Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F7F7FA] font-display tracking-tight">
            Official StarSwipe Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
            Real-time standings computed from verified likes and dislikes.
          </p>
        </div>

        <button
          onClick={handleShare}
          className="self-start md:self-end px-3.5 py-2 rounded-xl text-xs font-medium bg-[#15151C] border border-[#262635] text-[#F7F7FA] hover:bg-[#1D1D27] flex items-center gap-2 transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#A1A1B5]" />}
          <span>{copied ? 'Link Copied' : 'Share Rankings'}</span>
        </button>
      </div>

      {/* Filter Strip: Period Tabs & Category Selector & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Interactive Segmented Control for Period (Functional Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-[#15151C] border border-[#232331] rounded-xl self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              period === 'all_time' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            All-Time Popularity
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              period === 'weekly' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Weekly Trending
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              period === 'monthly' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Monthly Trending
          </button>
          <button
            onClick={() => setPeriod('like_rate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              period === 'like_rate' ? 'bg-[#262635] text-[#F7F7FA]' : 'text-[#A1A1B5] hover:text-[#F7F7FA]'
            }`}
          >
            Highest Like Rate
          </button>
        </div>

        {/* Search & Category filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71718A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actress or cinema..."
              className="w-full bg-[#15151C] border border-[#262635] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#15151C] border border-[#262635] rounded-xl px-3 py-1.5 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6] shrink-0"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {period === 'like_rate' && (
        <div className="text-xs text-[#A1A1B5] flex items-center gap-2">
          <span className="text-[#A78BFA]">Notice:</span>
          <span>Rankings require a minimum sample threshold of 2 total votes to prevent single-vote distortion.</span>
        </div>
      )}

      {/* TOP THREE PODIUM CARDS */}
      {!search && !selectedCategory && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {topThree.map((actress, index) => {
            const rank = index + 1;
            const isFirst = rank === 1;

            return (
              <div
                key={actress.id}
                onClick={() => navigate(`/actress/${actress.slug}`)}
                className={`relative rounded-2xl overflow-hidden bg-[#15151C] border transition-all cursor-pointer flex flex-col justify-end aspect-[4/5] shadow-xl group ${
                  isFirst ? 'border-[#F59E0B]/60 md:-translate-y-2' : 'border-[#232331] hover:border-[#8B5CF6]/50'
                }`}
              >
                <img
                  src={actress.primary_image_url}
                  alt={actress.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/60 to-transparent pointer-events-none" />

                {/* Rank Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm backdrop-blur-md shadow-lg ${
                      isFirst
                        ? 'bg-[#F59E0B] text-slate-950 ring-2 ring-[#F59E0B]/50'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    #{rank}
                  </div>
                </div>

                <div className="relative z-10 p-5 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#A1A1B5]">
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
                      <span className="text-[#71718A]">Like Rate: </span>
                      <span className="font-semibold text-[#F7F7FA]">{actress.like_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[#71718A]">Net: </span>
                      <span className={`font-semibold ${isFirst ? 'text-[#F59E0B]' : 'text-[#A78BFA]'}`}>
                        {actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL RANKINGS DATA TABLE */}
      <div className="rounded-2xl bg-[#15151C] border border-[#232331] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#232331] flex items-center justify-between text-xs text-[#A1A1B5]">
          <span className="font-medium">Standings · {rankings.length} Actresses Ranked</span>
          <span className="font-mono">Authoritative Ledger</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#A1A1B5]">
            Calculating current standings...
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A1A1B5]">
            No actresses matched the selected criteria or minimum vote thresholds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12121A] text-[#71718A] uppercase font-mono tracking-wider border-b border-[#232331]">
                <tr>
                  <th className="py-3 px-6 w-16">Rank</th>
                  <th className="py-3 px-6">Actress</th>
                  <th className="py-3 px-6 hidden sm:table-cell">Industry</th>
                  <th className="py-3 px-6 text-right font-mono">Net Score</th>
                  <th className="py-3 px-6 text-right font-mono">Likes</th>
                  <th className="py-3 px-6 text-right font-mono">Dislikes</th>
                  <th className="py-3 px-6 text-right font-mono">Like Rate</th>
                  <th className="py-3 px-6 text-right font-mono hidden md:table-cell">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232331]">
                {rankings.map((actress, idx) => {
                  const rank = idx + 1;
                  const isTop = rank === 1;

                  return (
                    <tr
                      key={actress.id}
                      onClick={() => navigate(`/actress/${actress.slug}`)}
                      className="hover:bg-[#1D1D27] cursor-pointer transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 font-display font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono tabular-nums ${
                            isTop
                              ? 'bg-[#F59E0B] text-slate-950 font-black'
                              : rank <= 3
                              ? 'bg-[#262635] text-[#F7F7FA]'
                              : 'text-[#A1A1B5]'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Actress Portrait & Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={actress.primary_image_url}
                            alt={actress.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-12 rounded-lg object-cover bg-[#0B0B0F] shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-sm text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors flex items-center gap-1.5">
                              <span>{actress.name}</span>
                              {actress.is_verified && (
                                <CheckCircle className="w-3.5 h-3.5 fill-[#8B5CF6]/30 text-[#A78BFA]" />
                              )}
                            </div>
                            <div className="text-[11px] text-[#A1A1B5] sm:hidden">
                              {actress.industry}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="py-4 px-6 hidden sm:table-cell text-[#A1A1B5]">
                        {actress.industry}
                      </td>

                      {/* Net Score */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums font-bold">
                        <span
                          className={
                            actress.net_votes > 0
                              ? 'text-emerald-400'
                              : actress.net_votes < 0
                              ? 'text-rose-400'
                              : 'text-[#A1A1B5]'
                          }
                        >
                          {actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}
                        </span>
                      </td>

                      {/* Likes */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums text-[#F7F7FA]">
                        {actress.likes}
                      </td>

                      {/* Dislikes */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums text-[#A1A1B5]">
                        {actress.dislikes}
                      </td>

                      {/* Like Rate */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums">
                        <span className="font-semibold text-[#F7F7FA]">{actress.like_rate}%</span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-6 text-right font-mono tabular-nums hidden md:table-cell text-[#A1A1B5]">
                        {actress.total_votes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
