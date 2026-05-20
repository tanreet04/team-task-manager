import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { activityAPI } from '../services/api';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function Navbar({ onMenuClick, onSearchChange, searchValue }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3); // default mock counter

  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch activities to populate notification items
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityAPI.getAll();
        if (data.success) {
          // Take top 5 for notifications
          setActivities(data.activities.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    if (user) {
      fetchActivities();
    }
  }, [user, showNotifications]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-zinc-200 dark:border-zinc-900 px-6 py-3 flex items-center justify-between">
      
      {/* Search Bar & Mobile Menu Drawer trigger */}
      <div className="flex items-center space-x-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative max-w-md w-full hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Quick search projects and tasks..."
            className="input-premium pl-9 py-1.5 bg-zinc-50/50 dark:bg-zinc-950/20"
            value={searchValue || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Top Navbar Actions */}
      <div className="flex items-center space-x-3.5">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationClick}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-premium-lg overflow-hidden py-1">
              <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/10">
                <span className="font-bold text-xs tracking-tight">Recent Updates</span>
                <span className="text-xxs font-semibold text-indigo-500 uppercase tracking-widest cursor-pointer" onClick={() => setUnreadCount(0)}>
                  Mark read
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <div key={act.id} className="p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex space-x-2.5">
                      <img 
                        src={act.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user?.name || '')}`} 
                        alt="" 
                        className="w-7 h-7 rounded-full bg-zinc-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xxs font-semibold text-zinc-900 dark:text-zinc-100 leading-normal">
                          <span className="font-bold">{act.user?.name}</span> {act.action}
                        </p>
                        <span className="text-xxxxs text-zinc-400 block mt-0.5">
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-zinc-400 text-xs">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-zinc-500" />
                    No recent notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-900 text-center bg-zinc-50/50 dark:bg-zinc-950/10">
                <a href="/activity" className="text-xxs font-bold text-indigo-500 hover:underline">
                  View all activity logs
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 border border-zinc-200 dark:border-zinc-800 p-1 pr-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition duration-150"
          >
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`} 
              alt={user?.name} 
              className="w-7 h-7 rounded-lg bg-zinc-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-premium-lg py-1.5 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 text-left">
                <div className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{user?.name}</div>
                <div className="text-xxs text-zinc-400 truncate">{user?.role}</div>
              </div>
              <a href="/settings" className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </a>
              <a href="/settings" className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </a>
              <button 
                onClick={logout}
                className="flex items-center space-x-2.5 w-full text-left px-4 py-2 text-xs font-medium hover:bg-rose-500/10 text-rose-500 border-t border-zinc-100 dark:border-zinc-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
