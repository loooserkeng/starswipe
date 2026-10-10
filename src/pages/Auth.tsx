import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Shield, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../lib/brand.js';

interface AuthProps {
  initialMode?: 'login' | 'signup';
  navigate: (route: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'login', navigate }) => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email);
      } else {
        await signup(email, displayName);
      }
      navigate('/discover');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail);
      navigate('/discover');
    } catch (err: any) {
      setError(err.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-20 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F7FA] font-display">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-xs text-[#A1A1B5] mt-1">
          {isLogin
            ? 'Sign in to sync your votes and track portrait submissions.'
            : 'Join StarSwipe to shape community rankings.'}
        </p>
      </div>

      <div className="rounded-2xl bg-[#15151C] border border-[#232331] p-6 shadow-2xl flex flex-col gap-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F7F7FA]">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your username"
                className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#F7F7FA]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-[#0B0B0F] border border-[#262635] rounded-xl p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white hover:opacity-95 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-xs text-[#A1A1B5] pt-2 border-t border-[#232331]">
          <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[#A78BFA] font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Quick Demo Logins for Evaluation */}
        <div className="mt-2 pt-4 border-t border-[#232331] flex flex-col gap-2">
          <div className="text-[11px] text-[#71718A] uppercase font-mono tracking-wider text-center">
            Development Quick Demo Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('admin@starswipe.app')}
              className="p-2.5 rounded-xl bg-[#232331] hover:bg-[#2E2E42] text-xs font-semibold text-[#A78BFA] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
            <button
              onClick={() => handleDemoLogin('cinephile@starswipe.app')}
              className="p-2.5 rounded-xl bg-[#232331] hover:bg-[#2E2E42] text-xs font-semibold text-[#F7F7FA] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>User Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
