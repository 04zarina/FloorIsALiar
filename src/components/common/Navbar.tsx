import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from './Button';
import { 
  Gamepad2, 
  LayoutDashboard, 
  Trophy, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Disc3,
  LogIn,
  UserPlus
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, signOut, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Signed out. See you back on the dance floor!', 'info');
      navigate('/');
    } catch {
      addToast('Error signing out', 'error');
    }
  };

  const navLinks = [
    { name: 'The Floor', path: '/game', icon: Gamepad2, protected: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, protected: true },
    { name: 'History', path: '/history', icon: History, protected: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, protected: false },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b-2 border-disco-border bg-disco-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Mirror ball / Disco ball icon badge */}
            <div className="w-12 h-12 rounded-2xl bg-disco-mustard border-2 border-disco-border flex items-center justify-center shadow-retro group-hover:-translate-y-0.5 group-hover:shadow-retro-lg transition-transform duration-150">
              <Disc3 className="w-7 h-7 text-disco-border animate-disco-spin" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl md:text-2xl text-disco-cream tracking-wide">
                FloorIsALiar
              </span>
              {/* Fun playful 1970s tagline replacing old neon text */}
              <span className="text-xs font-display text-disco-mustard tracking-wider">
                Don&apos;t trust the floor
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold font-display tracking-wide transition-transform duration-150 border-2 ${
                    isActive
                      ? 'bg-disco-mustard text-disco-border border-disco-border shadow-retro-sm translate-y-[-1px]'
                      : 'border-transparent text-disco-cream hover:bg-disco-surface hover:border-disco-border hover:shadow-retro-xs hover:-translate-y-0.5'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Right Action Area (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {!isConfigured && (
              <span className="text-xs px-3 py-1 rounded-xl border-2 border-disco-border bg-disco-orange text-white font-bold shadow-retro-xs">
                Offline
              </span>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l-2 border-disco-border/40">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border-2 border-disco-border bg-disco-surface hover:bg-disco-elevated shadow-retro-sm hover:-translate-y-0.5 transition-transform"
                >
                  <div className="w-7 h-7 rounded-xl bg-disco-pink border border-disco-border text-white flex items-center justify-center font-bold font-display text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-disco-cream max-w-[120px] truncate">
                    {profile?.display_name || user.email?.split('@')[0] || 'Dancer'}
                  </span>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label="Sign Out"
                  className="text-disco-cream-muted hover:text-disco-pink"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  leftIcon={<LogIn className="w-4 h-4" />}
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Get On Floor
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl border-2 border-disco-border bg-disco-surface text-disco-cream shadow-retro-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 border-disco-border bg-disco-surface px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold font-display tracking-wide border-2 ${
                    isActive
                      ? 'bg-disco-mustard text-disco-border border-disco-border shadow-retro-sm'
                      : 'border-transparent text-disco-cream hover:bg-disco-elevated'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-disco-border/30">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-disco-elevated border-2 border-disco-border text-disco-cream shadow-retro-sm"
                >
                  <User className="w-5 h-5 text-disco-pink" />
                  <span className="font-bold">{profile?.display_name || user.email}</span>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full justify-center text-disco-pink border-disco-pink"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full justify-center"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                  className="w-full justify-center"
                >
                  Get On Floor
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
