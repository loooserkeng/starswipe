import React from 'react';
import { BRAND_CONFIG } from '../lib/brand.js';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="w-full border-t border-[#232331] bg-[#0B0B0F] py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 text-xs text-[#A1A1B5]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-[#F7F7FA] font-bold text-sm font-display">
            <span>{BRAND_CONFIG.name}</span>
            <span className="text-[#37374D]" aria-hidden="true">·</span>
            <span className="text-[#A1A1B5] font-normal text-xs">{BRAND_CONFIG.tagline}</span>
          </div>
          <p className="text-[11px] text-[#71718A]">
            Independent cinematic actress discovery & community-driven leaderboard platform.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <button onClick={() => navigate('/privacy')} className="hover:text-[#F7F7FA] transition-colors">
            Privacy Policy
          </button>
          <span className="text-[#37374D]" aria-hidden="true">·</span>
          <button onClick={() => navigate('/terms')} className="hover:text-[#F7F7FA] transition-colors">
            Terms of Service
          </button>
          <span className="text-[#37374D]" aria-hidden="true">·</span>
          <button onClick={() => navigate('/community-guidelines')} className="hover:text-[#F7F7FA] transition-colors">
            Community Guidelines
          </button>
          <span className="text-[#37374D]" aria-hidden="true">·</span>
          <button onClick={() => navigate('/copyright')} className="hover:text-[#F7F7FA] transition-colors">
            Copyright Policy & DMCA
          </button>
          <span className="text-[#37374D]" aria-hidden="true">·</span>
          <button onClick={() => navigate('/contact')} className="hover:text-[#F7F7FA] transition-colors">
            Contact
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#1D1D27] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#71718A]">
        <div>
          © {BRAND_CONFIG.copyrightYear} {BRAND_CONFIG.name}. All verified rights reserved.
        </div>
        <div className="flex items-center gap-3">
          <span>Production-grade PostgreSQL architecture</span>
          <span className="text-[#37374D]" aria-hidden="true">·</span>
          <span>Zero telemetry fabrication</span>
        </div>
      </div>
    </footer>
  );
};
