import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Category } from '../lib/types.js';
import { api } from '../lib/api.js';

interface CategoriesProps {
  navigate: (route: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getCategories().then((data) => {
      setCategories(data);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
      <div className="pb-6 border-b border-[#232331]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#A78BFA] uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Cinematic Traditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F7F7FA] font-display tracking-tight">
          Explore by Category & Language
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
          Discover acclaimed performers across distinct cinematic industries.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#15151C] animate-pulse border border-[#232331]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/categories/${cat.slug}`)}
              className="p-6 rounded-2xl bg-[#15151C] border border-[#232331] hover:border-[#8B5CF6]/50 hover:bg-[#1D1D27] text-left transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold font-display text-[#F7F7FA] group-hover:text-[#A78BFA] transition-colors">
                    {cat.name}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-[#71718A] group-hover:text-[#A78BFA] group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-[#A1A1B5] leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#232331] flex items-center justify-between text-xs font-mono text-[#71718A]">
                <span>Active Profiles</span>
                <span className="font-semibold text-[#F7F7FA]">{cat.actress_count || 0}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
