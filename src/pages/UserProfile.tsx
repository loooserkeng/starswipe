import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, Shield, LogOut, CheckCircle, Image, Sparkles } from 'lucide-react';

interface UserProfileProps {
  navigate: (route: string) => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ navigate }) => {
  const { user, logout, switchRole, isStaff } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-display text-[#F7F7FA]">You are currently a Guest</h2>
        <p className="text-xs text-[#A1A1B5] mt-2">
          Sign in or create an account to view your profile and manage submissions.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8B5CF6] text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#232331]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F7F7FA] font-display">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1B5] mt-1">
            Account settings and platform privileges.
          </p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/discover');
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#15151C] border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#15151C] border border-[#232331] p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center text-white font-display font-extrabold text-2xl shadow-lg">
            {user.display_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-bold font-display text-[#F7F7FA] flex items-center gap-2">
              <span>{user.display_name}</span>
              {user.role === 'admin' && (
                <span className="text-xs font-mono font-medium text-[#A78BFA] bg-[#232331] px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
            </div>
            <div className="text-xs text-[#A1A1B5] mt-0.5">{user.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#232331]">
          <div className="p-4 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="text-xs text-[#71718A]">Assigned Role</div>
            <div className="text-sm font-semibold text-[#F7F7FA] mt-1 capitalize">{user.role}</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0B0F] border border-[#232331]">
            <div className="text-xs text-[#71718A]">Account Status</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 capitalize">{user.status}</div>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="pt-4 border-t border-[#232331] flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/my-submissions')}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#232331] hover:bg-[#2E2E42] text-[#F7F7FA] flex items-center gap-2"
          >
            <Image className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>My Submitted Portraits</span>
          </button>
          {isStaff && (
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#232331] hover:bg-[#2E2E42] text-[#A78BFA] flex items-center gap-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}
          <button
            onClick={() => switchRole(user.role === 'admin' ? 'user' : 'admin')}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-[#232331] hover:bg-[#2E2E42] text-[#F59E0B] flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Switch to {user.role === 'admin' ? 'User' : 'Admin'} Role</span>
          </button>
        </div>
      </div>
    </div>
  );
};
