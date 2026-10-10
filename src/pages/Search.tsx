import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Actress, Category } from '../lib/types.js';
import { api } from '../lib/api.js';

interface SearchProps {
  navigate: (route: string) => void;
}

export const Search: React.FC<SearchProps> = ({ navigate }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Actress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const list = await api.getActresses({
          search: query.trim() || undefined,
          category: category || undefined,
        });
        setResults(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, category]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">
          Search Actresses & Profiles
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
          Explore by name, cinematic industry, or category.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71718A]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type actress name (e.g., Ananya, Meera, Elena)..."
            className="w-full bg-[#15151C] border border-[#262635] rounded-xl pl-10 pr-10 py-3 text-sm text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71718A] hover:text-[#F7F7FA]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#15151C] border border-[#262635] rounded-xl px-4 py-3 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6] shrink-0"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
          No actresses found matching your search. Try adjusting the query or category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((actress) => (
            <div
              key={actress.id}
              onClick={() => navigate(`/actress/${actress.slug}`)}
              className="group relative rounded-2xl overflow-hidden bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/50 transition-all cursor-pointer aspect-[3/4] flex flex-col justify-end shadow-xl"
            >
              <img
                src={actress.primary_image_url}
                alt={actress.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent pointer-events-none" />

              <div className="relative z-10 p-5 flex flex-col gap-1">
                <div className="text-[11px] text-[#A1A1B5]">{actress.industry}</div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-display text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors">
                    {actress.name}
                  </h3>
                  {actress.is_verified && (
                    <CheckCircle className="w-4 h-4 fill-[#8B5CF6]/30 text-[#A78BFA] shrink-0" />
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-[#232331] flex items-center justify-between text-xs font-mono tabular-nums text-[#A1A1B5]">
                  <span>Rate: {actress.like_rate}%</span>
                  <span>Net: {actress.net_votes > 0 ? `+${actress.net_votes}` : actress.net_votes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
