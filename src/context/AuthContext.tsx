import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../lib/types.js';
import { api } from '../lib/api.js';

interface AuthContextType {
  user: UserProfile | null;
  voterId: string;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (email: string, displayName: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'starswipe_guest_id';
const USER_KEY = 'starswipe_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestId, setGuestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize or load guest voter identifier
    let storedGuest = localStorage.getItem(GUEST_KEY);
    if (!storedGuest) {
      storedGuest = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(GUEST_KEY, storedGuest);
    }
    setGuestId(storedGuest);

    // Check stored user session
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const loggedIn = await api.login(email);
      setUser(loggedIn);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedIn));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, displayName: string) => {
    setIsLoading(true);
    try {
      const created = await api.signup(email, displayName);
      setUser(created);
      localStorage.setItem(USER_KEY, JSON.stringify(created));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const switchRole = async (role: Role) => {
    if (!user) {
      // If guest wants to test admin, log them into admin demo profile
      await login('admin@starswipe.app');
      return;
    }
    const updated = await api.switchRole(user.id, role);
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  const voterId = user ? user.id : guestId;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <AuthContext.Provider
      value={{
        user,
        voterId,
        isAdmin,
        isStaff,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
