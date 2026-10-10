import React from 'react';
import { Flame, Trophy, PlusSquare, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface BottomNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, navigate }) => {
  const { isStaff, user } = useAuth();

  const tabs = [
    { label: 'Discover', path: '/discover', icon: Flame },
    { label: 'Rankings', path: '/leaderboard', icon: Trophy },
    { label: 'Upload', path: '/upload', icon: PlusSquare },
    isStaff
      ? { label: 'Admin', path: '/admin', icon: Shield }
      : { label: user ? 'Profile' : 'Sign In', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#15151C]/95 backdrop-blur-lg border-t border-[#232331] h-16">
      <div className="grid grid-cols-4 h-full items-center">
        {tabs.map((tab) => {
          const isActive = currentRoute === tab.path || (tab.path === '/admin' && currentRoute.startsWith('/admin'));
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors group"
            >
              <Icon
                className={`w-5 h-5 transition-transform group-active:scale-90 ${
                  isActive ? 'text-[#A78BFA]' : 'text-[#A1A1B5]'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 ${
                  isActive ? 'text-[#F7F7FA]' : 'text-[#A1A1B5]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
