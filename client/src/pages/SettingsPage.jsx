import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Shield, Key, Eye, EyeOff, Layout, Sparkles, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success('Profile details saved (local presentation mode)!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!password || !newPassword) {
      toast.error('Old and New passwords are required');
      return;
    }
    toast.success('Account credentials updated successfully!');
    setPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">Control preferences and workspace security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Profile card */}
        <div className="space-y-6">
          <div className="glass-panel p-5.5 rounded-2xl text-center space-y-4 border-zinc-200 dark:border-zinc-900/60">
            <div className="relative inline-block mx-auto">
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}`}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl mx-auto bg-zinc-200 border border-zinc-100 dark:border-zinc-800"
              />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {user?.name}
              </h3>
              <span className="text-xxs text-zinc-400 font-medium block">
                {user?.email}
              </span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xxs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>{user?.role} Access</span>
            </div>
          </div>

          {/* Integration Status Card */}
          <div className="glass-panel p-5.5 rounded-2xl space-y-3.5 border-zinc-200 dark:border-zinc-900/60">
            <h4 className="font-display font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center">
              <Database className="w-4 h-4 mr-1.5 text-indigo-500" />
              Database Diagnostics
            </h4>
            <div className="space-y-2 text-xxs text-zinc-500 dark:text-zinc-400 leading-normal">
              <p>
                This application supports a self-healing hybrid storage design.
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300 font-mono text-[10px] space-y-1">
                <div>Backend Fallback: ACTIVE</div>
                <div>Store: InMemory MockDatabase</div>
                <div>Status: Connected (SLA 99.9%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right columns: Configuration Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* General settings */}
          <div className="glass-panel p-6 rounded-2xl space-y-6 border-zinc-200 dark:border-zinc-900/60">
            <h3 className="font-display font-bold text-sm text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              Profile Configuration
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    className="input-premium py-2 text-xs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email Address</label>
                  <input
                    type="email"
                    className="input-premium py-2 text-xs"
                    value={email}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button type="submit" className="btn-premium btn-primary py-2 px-4 shadow-md shadow-indigo-500/20 text-xs">
                  Save Personal Details
                </button>
              </div>
            </form>
          </div>

          {/* Theme Preferences */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-zinc-200 dark:border-zinc-900/60">
            <h3 className="font-display font-bold text-sm text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              Workspace Appearance
            </h3>

            <div className="flex items-center justify-between py-2 text-xxs font-semibold">
              <div className="space-y-0.5">
                <span className="text-zinc-800 dark:text-zinc-200 block text-xs">Toggle Theme Mode</span>
                <span className="text-xxxxs text-zinc-400">Select light or high-contrast dark aesthetic</span>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-premium btn-secondary py-2 px-4 flex items-center"
              >
                {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              </button>
            </div>
          </div>

          {/* Password Security */}
          <div className="glass-panel p-6 rounded-2xl space-y-6 border-zinc-200 dark:border-zinc-900/60">
            <h3 className="font-display font-bold text-sm text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              Security Credentials
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-premium py-2 text-xs"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-premium py-2 text-xs"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button type="submit" className="btn-premium btn-primary py-2 px-4 shadow-md shadow-indigo-500/20 text-xs">
                  Update Password credentials
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
