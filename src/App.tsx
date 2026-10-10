import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { BottomNav } from './components/BottomNav.js';
import { Footer } from './components/Footer.js';

// Pages
import { Home } from './pages/Home.js';
import { Discover } from './pages/Discover.js';
import { Leaderboard } from './pages/Leaderboard.js';
import { Trending } from './pages/Trending.js';
import { Categories } from './pages/Categories.js';
import { CategoryDetail } from './pages/CategoryDetail.js';
import { ActressProfile } from './pages/ActressProfile.js';
import { Search } from './pages/Search.js';
import { Upload } from './pages/Upload.js';
import { MySubmissions } from './pages/MySubmissions.js';
import { Auth } from './pages/Auth.js';
import { UserProfileView } from './pages/UserProfile.js';
import { Settings } from './pages/Settings.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Privacy, Terms, CommunityGuidelines, Copyright } from './pages/LegalPages.js';
import { Contact } from './pages/Contact.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderRoute = () => {
    const path = currentPath.split('?')[0];

    if (path === '/') return <Home navigate={navigate} />;
    if (path === '/discover') return <Discover navigate={navigate} />;
    if (path === '/leaderboard') return <Leaderboard navigate={navigate} />;
    if (path === '/trending') return <Trending navigate={navigate} />;
    if (path === '/categories') return <Categories navigate={navigate} />;
    if (path.startsWith('/categories/')) {
      const slug = path.replace('/categories/', '');
      return <CategoryDetail slug={slug} navigate={navigate} />;
    }
    if (path.startsWith('/actress/')) {
      const slug = path.replace('/actress/', '');
      return <ActressProfile slug={slug} navigate={navigate} />;
    }
    if (path === '/search') return <Search navigate={navigate} />;
    if (path === '/upload') return <Upload navigate={navigate} />;
    if (path === '/my-submissions') return <MySubmissions navigate={navigate} />;
    if (path === '/login') return <Auth initialMode="login" navigate={navigate} />;
    if (path === '/signup') return <Auth initialMode="signup" navigate={navigate} />;
    if (path === '/profile') return <UserProfileView navigate={navigate} />;
    if (path === '/settings') return <Settings navigate={navigate} />;
    if (path.startsWith('/admin')) return <AdminDashboard navigate={navigate} />;
    if (path === '/privacy') return <Privacy />;
    if (path === '/terms') return <Terms />;
    if (path === '/community-guidelines') return <CommunityGuidelines />;
    if (path === '/copyright') return <Copyright />;
    if (path === '/contact') return <Contact />;

    // Fallback default
    return <Home navigate={navigate} />;
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#0B0B0F] text-[#F7F7FA] font-sans antialiased">
        <Navbar currentRoute={currentPath} navigate={navigate} />
        <main className="flex-1 w-full">{renderRoute()}</main>
        <Footer navigate={navigate} />
        <BottomNav currentRoute={currentPath} navigate={navigate} />
      </div>
    </AuthProvider>
  );
}
