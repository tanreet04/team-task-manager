import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  // Demo Credentials helper
  const loadDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('tanreet@company.com');
      setPassword('password123');
    } else {
      setEmail('rahul@company.com');
      setPassword('password123');
    }
    toast.success(`Demo ${role} credentials loaded!`);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
      
      {/* Left Column: Visual Illustration & Copy */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-zinc-950 p-12 flex-col justify-between text-left relative overflow-hidden border-r border-indigo-900/30">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl"></div>

        {/* Header Logo */}
        <div className="flex items-center space-x-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            TeamTask
          </span>
        </div>

        {/* Feature Teaser */}
        <div className="space-y-6 relative z-10 max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Cloud Sync Enabled</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-zinc-100 tracking-tight leading-tight">
            Bring clarity to your development cycle.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign in to access your projects Kanban, delegate tasks, verify progress, and track daily timeline activities.
          </p>
        </div>

        {/* Mini stats footer */}
        <div className="border-t border-zinc-800/80 pt-6 relative z-10 flex justify-between text-zinc-400 text-xs">
          <span>Active Users: 12k+</span>
          <span>Version 2.0.4</span>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 text-left bg-white dark:bg-zinc-900/40 p-8 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-850/60 shadow-premium backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="font-display font-bold text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              New to TeamTask?{' '}
              <Link to="/signup" className="text-indigo-500 font-semibold hover:text-indigo-600">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo Login Quick Actions */}
          <div className="p-4 rounded-xl bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 space-y-2.5">
            <div className="text-xxs font-bold text-zinc-400 uppercase tracking-widest">Quick Demo Access</div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => loadDemoCredentials('admin')}
                className="py-1.5 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 text-xxs font-semibold transition duration-150"
              >
                Login as Admin
              </button>
              <button 
                type="button"
                onClick={() => loadDemoCredentials('member')}
                className="py-1.5 px-3 rounded-lg bg-zinc-200/60 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-xxs font-semibold transition duration-150"
              >
                Login as Member
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className={`input-premium pl-10 ${errors.email ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && <span className="text-xxs font-semibold text-rose-500">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Password
                </label>
                <a href="#" className="text-xxs font-semibold text-indigo-500 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-premium pl-10 pr-10 ${errors.password ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xxs font-semibold text-rose-500">{errors.password}</span>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded border-zinc-300 dark:border-zinc-800 text-indigo-600"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-zinc-500 dark:text-zinc-400 select-none">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium btn-primary w-full shadow-lg shadow-indigo-500/25 flex items-center justify-center py-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}
