import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Sparkles, User, LogIn, Shield, Calendar, Award, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, logout, isAdmin, isFaculty, isStudent } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (isAdmin) return '/admin';
    if (isFaculty) return '/faculty';
    if (isStudent) return '/student';
    return '/login';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Esperenza (Tech)', path: '/esperanza' },
    { name: 'Aashayein (Cultural)', path: '/aashayein' },
    { name: 'Schedule', path: '/schedule' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-light-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-blue via-primary-blue to-light-blue-300 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-cream" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-navy-blue flex items-center gap-1.5">
                ESPERENZA <span className="text-primary-blue font-light">&</span> AASHAYEIN
              </span>
              <p className="text-xs font-semibold text-primary-blue tracking-widest uppercase">
                College Festival 2026–2027
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-light-blue-100 text-primary-blue shadow-sm'
                      : 'text-navy-text hover:text-primary-blue hover:bg-cream-200/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-blue text-white text-sm font-semibold shadow-soft hover:bg-navy-blue-light transition-all"
                >
                  <Shield className="w-4 h-4 text-primary-blue-light" />
                  <span>Dashboard ({profile?.role?.replace('_', ' ')})</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs font-semibold text-navy-text hover:text-red-600 rounded-lg hover:bg-cream-200/60 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-navy-blue hover:text-primary-blue hover:bg-light-blue-50 rounded-xl transition-all"
                >
                  Coordinator Login
                </Link>
                <Link
                  to="/coordinator-signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-blue hover:bg-primary-blue-hover rounded-xl shadow-soft transition-all"
                >
                  Register as Coordinator
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-navy-blue hover:bg-light-blue-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-light-blue-200 bg-cream-100 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-navy-text hover:bg-light-blue-100 hover:text-primary-blue"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="pt-3 border-t border-cream-300 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-navy-blue text-white text-sm font-semibold shadow-soft"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-primary-blue text-primary-blue text-sm font-semibold"
                >
                  Coordinator Login
                </Link>
                <Link
                  to="/coordinator-signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-primary-blue text-white text-sm font-semibold shadow-soft"
                >
                  Register as Coordinator
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
