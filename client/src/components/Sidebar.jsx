import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  Activity, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { name: 'Team', path: '/team', icon: <Users className="w-4 h-4" /> },
    { name: 'Activity', path: '/activity', icon: <Activity className="w-4 h-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-45 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex flex-col justify-between transition-all duration-300 lg:static ${
        isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
      }`}>
        
        {/* Workspace Brand Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            {isOpen && (
              <div className="text-left leading-none">
                <span className="font-display font-bold text-sm tracking-tight text-zinc-800 dark:text-zinc-100 truncate block w-32">
                  Startup Workspace
                </span>
                <span className="text-xxs text-zinc-400 font-medium">
                  {user?.role || 'Member'}
                </span>
              </div>
            )}
          </div>
          
          {/* Collapse Toggle button (desktop only) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
          >
            {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 select-none overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                // Auto close mobile drawer on path click
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-l-3 border-indigo-600' 
                  : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="flex-shrink-0 transition-transform group-hover:scale-105">{item.icon}</span>
              {isOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile info at Bottom */}
        {user && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name} 
                className="w-9 h-9 rounded-full bg-zinc-200 border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
              />
              {isOpen && (
                <div className="text-left overflow-hidden flex-1">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{user.name}</div>
                  <div className="text-xxs text-zinc-400 truncate">{user.email}</div>
                </div>
              )}
            </div>
            
            {/* Logout trigger button */}
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span>Sign Out</span>}
            </button>
          </div>
        )}

      </aside>
    </>
  );
}
