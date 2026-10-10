import React, { useState, useEffect } from 'react';
import { Actress, Category } from '../lib/types.js';
import { api } from '../lib/api.js';
import { ArrowLeft, CheckCircle, Flame } from 'lucide-react';

interface CategoryDetailProps {
  slug: string;
  navigate: (route: string) => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ slug, navigate }) => {
  const [actresses, setActresses] = useState<Actress[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, actList] = await Promise.all([
          api.getCategories(),
          api.getActresses({ category: slug }),
        ]);
        const found = cats.find((c) => c.slug === slug);
        setCategory(found || null);
        setActresses(actList);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/categories')}
        className="flex items-center gap-2 text-xs font-semibold text-[#A1A1B5] hover:text-[#F7F7FA] self-start transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#232331]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F7F7FA] font-display tracking-tight">
            {category ? category.name : slug}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1B5] mt-2 max-w-2xl leading-relaxed">
            {category?.description || 'Browse leading and celebrated performers.'}
          </p>
        </div>

        <button
          onClick={() => navigate(`/discover?category=${slug}`)}
          className="self-start md:self-end px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg flex items-center gap-2 hover:opacity-95 transition-all"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Swipe in {category?.name || 'Category'}</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
          ))}
        </div>
      ) : actresses.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#A1A1B5] rounded-2xl bg-[#15151C] border border-[#232331]">
          No profiles currently listed in this category. You can submit one using the Upload tool.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {actresses.map((actress) => (
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

              <div className="relative z-10 p-5 flex flex-col gap-1.5">
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
