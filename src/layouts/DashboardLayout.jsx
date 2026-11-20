import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DemoSwitcher from '../components/common/DemoSwitcher';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Users,
  GraduationCap,
  ClipboardList,
  FileSpreadsheet,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Bell,
  CheckCircle,
  Clock,
  Layers,
  FileEdit,
  UserCheck,
  ChevronRight,
  ChevronDown,
  Flame,
  Home,
  Folder,
  FolderOpen
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, profile, logout, isAdmin, isFaculty, isStudent, isVerifiedFaculty } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsible state for folder groups
  const [festivalsExpanded, setFestivalsExpanded] = useState(true);
  const [directoryExpanded, setDirectoryExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-light-gray flex flex-col md:flex-row text-navy-text">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy-blue text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-soft">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-navy-blue-light text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-extrabold text-sm tracking-wide">
            {isAdmin ? 'SUPER ADMIN CONSOLE' : isFaculty ? 'FACULTY PORTAL' : 'STUDENT PORTAL'}
          </span>
        </div>
        <Link to="/" className="text-xs bg-primary-blue px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-blue text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-blue-light/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-blue flex items-center justify-center text-white shadow-soft">
              <Sparkles className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white leading-tight">
                ESPERENZA <span className="text-light-blue-300 font-light">&</span> AASHAYEIN
              </h2>
              <p className="text-[10px] font-semibold text-light-blue-200 tracking-wider uppercase">
                Festival Portal 2026–2027
              </p>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Persona Card */}
        <div className="p-4 mx-4 my-3 bg-navy-blue-light/60 rounded-2xl border border-navy-blue-light flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-blue/30 text-light-blue-200 flex items-center justify-center font-bold text-sm shrink-0">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs truncate text-white">{profile?.full_name || 'Coordinator'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-light-blue-200 uppercase font-bold tracking-wider">
                {profile?.role?.replace('_', ' ')}
              </span>
              {isFaculty && (
                isVerifiedFaculty ? (
                  <span title="Verified Faculty"><CheckCircle className="w-3 h-3 text-emerald-400" /></span>
                ) : (
                  <span title="Verification Pending"><Clock className="w-3 h-3 text-amber-400" /></span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items (Folder Hierarchical Structure) */}
        <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto text-xs">
          
          {/* SUPER ADMIN HIERARCHY */}
          {isAdmin && (
            <>
              {/* Dashboard Home */}
              <div>
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-primary-blue text-white shadow-soft'
                      : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-primary-blue-light" />
                  <span>Main Dashboard</span>
                </Link>
              </div>

              {/* FOLDER 1: FESTIVALS & EVENT HUBS */}
              <div className="space-y-1">
                <button
                  onClick={() => setFestivalsExpanded(!festivalsExpanded)}
                  className="w-full flex items-center justify-between px-3.5 py-1.5 text-[10px] font-extrabold text-light-blue-200/80 uppercase tracking-widest hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-primary-blue-light" />
                    <span>Festivals & Events</span>
                  </div>
                  {festivalsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {festivalsExpanded && (
                  <div className="space-y-1 pl-2 animate-fade-in">
                    {/* Aashayein */}
                    <Link
                      to="/admin/festival/aashayein"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                        location.pathname.startsWith('/admin/festival/aashayein')
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Aashayein (Cultural)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    {/* Esperenza */}
                    <Link
                      to="/admin/festival/esperanza"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                        location.pathname.startsWith('/admin/festival/esperanza')
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-light-blue-300" />
                        <span>Esperenza (Tech)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  </div>
                )}
              </div>

              {/* FOLDER 2: INSTITUTIONAL REPOSITORIES & REPORTS */}
              <div className="space-y-1">
                <button
                  onClick={() => setDirectoryExpanded(!directoryExpanded)}
                  className="w-full flex items-center justify-between px-3.5 py-1.5 text-[10px] font-extrabold text-light-blue-200/80 uppercase tracking-widest hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <span>Master Directory</span>
                  </div>
                  {directoryExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>

                {directoryExpanded && (
                  <div className="space-y-1 pl-2 animate-fade-in">
                    <Link
                      to="/admin/faculty"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/faculty'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span>Faculty Verification</span>
                    </Link>

                    <Link
                      to="/admin/students"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/students'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>Student Coordinators Roster</span>
                    </Link>

                    <Link
                      to="/admin/assignments"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/assignments'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      <span>All Assigned Duty Roster</span>
                    </Link>

                    <Link
                      to="/admin/participants"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/participants'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>All Participants Registry</span>
                    </Link>

                    <Link
                      to="/admin/reports"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/reports'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Master Reports (8 Sheets)</span>
                    </Link>

                    <Link
                      to="/admin/audit"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium transition-all ${
                        location.pathname === '/admin/audit'
                          ? 'bg-primary-blue text-white shadow-soft'
                          : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                      }`}
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Activity & Audit Trail</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* FACULTY PORTAL */}
          {isFaculty && (
            <div className="space-y-1">
              {[
                { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
                { name: 'My Assigned Events', path: '/faculty/events', icon: Calendar },
                { name: 'Student Coordinators', path: '/faculty/students', icon: Users },
                { name: 'Co-Coordinators', path: '/faculty/co-coordinators', icon: UserCheck },
                { name: 'Participant Management', path: '/faculty/participants', icon: ClipboardList },
                { name: 'Registration Form Builder', path: '/faculty/forms', icon: FileEdit },
                { name: 'Announcements', path: '/faculty/announcements', icon: Bell },
                { name: 'Profile', path: '/faculty/profile', icon: Settings },
              ].map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive ? 'bg-primary-blue text-white shadow-soft' : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* STUDENT PORTAL */}
          {isStudent && (
            <div className="space-y-1">
              {[
                { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
                { name: 'Assigned Events', path: '/student/events', icon: Calendar },
                { name: 'Participants Info', path: '/student/participants', icon: ClipboardList },
                { name: 'Profile', path: '/student/profile', icon: Settings },
              ].map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                      isActive ? 'bg-primary-blue text-white shadow-soft' : 'text-slate-300 hover:bg-navy-blue-light hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-navy-blue-light/50 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-navy-blue-light hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Verification Pending Banner for Faculty */}
        {isFaculty && !isVerifiedFaculty && (
          <div className="bg-amber-500 text-navy-blue px-6 py-3 font-semibold text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-navy-blue" />
              <span>
                Account Verification Pending: Your faculty registration has been submitted. A Super Admin must approve your credentials before you can configure participant registration forms or modify event coordinator teams.
              </span>
            </div>
            <span className="text-[11px] bg-navy-blue text-amber-300 px-2 py-0.5 rounded-md font-bold shrink-0">
              PENDING ADMIN VERIFICATION
            </span>
          </div>
        )}

        {/* Top Desktop Bar */}
        <header className="hidden md:flex bg-white border-b border-light-blue-200/80 px-8 py-4 items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-navy-blue">
              {isAdmin && 'Super Administrator Portal'}
              {isFaculty && 'Faculty Coordinator Hub'}
              {isStudent && 'Student Coordinator Dashboard'}
            </h1>
            <p className="text-xs text-slate-500">
              ESPERENZA & AASHAYEIN 2026–2027 College Festival Central Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-navy-blue bg-cream px-3 py-1.5 rounded-xl border border-light-blue-200 hover:bg-light-blue-50 transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-primary-blue" />
              <span>View Public Site</span>
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            <div className="text-right">
              <div className="text-xs font-bold text-navy-blue">{profile?.full_name}</div>
              <div className="text-[11px] text-slate-500">{profile?.department || profile?.email}</div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-light-blue-100 text-primary-blue font-bold flex items-center justify-center text-sm border border-light-blue-200">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation for Coordinators */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-light-blue-200 px-4 py-2 flex items-center justify-around shadow-soft">
        <Link
          to={isAdmin ? '/admin' : isFaculty ? '/faculty' : '/student'}
          className="flex flex-col items-center py-1 px-2 text-[10px] font-semibold text-primary-blue"
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </Link>
        {isAdmin && (
          <>
            <Link
              to="/admin/festival/aashayein"
              className="flex flex-col items-center py-1 px-2 text-[10px] font-semibold text-slate-600 hover:text-navy-blue"
            >
              <Flame className="w-5 h-5 mb-0.5 text-amber-500" />
              <span>Aashayein</span>
            </Link>
            <Link
              to="/admin/festival/esperanza"
              className="flex flex-col items-center py-1 px-2 text-[10px] font-semibold text-slate-600 hover:text-navy-blue"
            >
              <Layers className="w-5 h-5 mb-0.5 text-primary-blue" />
              <span>Esperenza</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex flex-col items-center py-1 px-2 text-[10px] font-semibold text-slate-600 hover:text-navy-blue"
            >
              <FileSpreadsheet className="w-5 h-5 mb-0.5 text-emerald-600" />
              <span>Reports</span>
            </Link>
          </>
        )}
      </div>

      <DemoSwitcher />
    </div>
  );
}
