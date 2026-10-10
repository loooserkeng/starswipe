import React, { useState } from 'react';
import { Search, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../lib/brand.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isStaff, switchRole } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { label: 'Discover', path: '/discover' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Trending', path: '/trending' },
    { label: 'Categories', path: '/categories' },
    { label: 'Upload', path: '/upload' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232331] bg-[#0B0B0F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => navigate('/')}
          className="text-xl font-bold tracking-tight text-[#F7F7FA] font-display whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white font-black text-base shadow-sm">
            S
          </span>
          <span>{BRAND_CONFIG.name}</span>
        </button>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1B5]">
          {navLinks.map((item) => {
            const isActive = currentRoute === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#F7F7FA] font-semibold'
                    : 'hover:text-[#F7F7FA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search & Primary Action / Account Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/search')}
            aria-label="Search actresses"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#A1A1B5] hover:text-[#F7F7FA] hover:bg-[#15151C] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {isStaff && (
            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#262635] text-[#A78BFA] hover:bg-[#323246] transition-colors whitespace-nowrap"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium bg-[#15151C] border border-[#232331] text-[#F7F7FA] hover:border-[#8B5CF6]/50 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="hidden sm:inline">
                {user ? user.display_name : 'Guest'}
              </span>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[#15151C] border border-[#232331] shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-[#232331]">
                      <div className="font-semibold text-[#F7F7FA]">{user.display_name}</div>
                      <div className="text-[11px] text-[#A1A1B5] truncate">{user.email}</div>
                      <div className="mt-1 text-[10px] text-[#A78BFA] uppercase tracking-wider font-mono">
                        Role: {user.role}
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#F7F7FA] transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => { navigate('/my-submissions'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#F7F7FA] transition-colors"
                    >
                      My Submissions
                    </button>
                    {isStaff && (
                      <button
                        onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#A78BFA] font-medium transition-colors"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#A1A1B5] transition-colors"
                    >
                      Settings
                    </button>
                    <div className="border-t border-[#232331] mt-1 pt-1">
                      <button
                        onClick={() => {
                          switchRole(user.role === 'admin' ? 'user' : 'admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#A78BFA] transition-colors flex items-center justify-between"
                      >
                        <span>Toggle Admin Access</span>
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 border-b border-[#232331] text-[11px] text-[#A1A1B5]">
                      Browsing as Guest Voter
                    </div>
                    <button
                      onClick={() => { navigate('/login'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#F7F7FA] font-medium transition-colors"
                    >
                      Sign In / Register
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#1D1D27] text-[#A78BFA] transition-colors flex items-center justify-between"
                    >
                      <span>Explore as Admin</span>
                      <Shield className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
