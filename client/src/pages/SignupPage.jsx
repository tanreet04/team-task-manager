import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, User, Shield, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength calculations
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { label: 'Empty', color: 'bg-zinc-200 dark:bg-zinc-800', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
      case 3:
        return { label: 'Good', color: 'bg-indigo-500', width: 'w-3/4' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    }
  };

  const strength = calculatePasswordStrength(password);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
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
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await signup(name, email, password, role);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
      
      {/* Left Column: Visual Illustration */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-zinc-950 p-12 flex-col justify-between text-left relative overflow-hidden border-r border-indigo-900/30">
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

        {/* Info Box */}
        <div className="space-y-6 relative z-10 max-w-sm">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scale Up Your Delivery Speeds</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-zinc-100 tracking-tight leading-tight">
            Built for scaling startup workflows.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Create an account, select your role (Admin to oversee projects, Member to resolve tasks), and invite your teammates.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 pt-6 relative z-10 flex justify-between text-zinc-400 text-xs">
          <span>Collaboration SLA: 99.9%</span>
          <span>Version 2.0.4</span>
        </div>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 text-left bg-white dark:bg-zinc-900/40 p-8 sm:p-10 rounded-2xl border border-zinc-200 dark:border-zinc-850/60 shadow-premium backdrop-blur-sm">
          <div className="space-y-2">
            <h1 className="font-display font-bold text-3xl tracking-tight text-zinc-900 dark:text-zinc-100">
              Create an account
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Tanreet Kaur"
                  className={`input-premium pl-10 ${errors.name ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                />
              </div>
              {errors.name && <span className="text-xxs font-semibold text-rose-500">{errors.name}</span>}
            </div>

            {/* Email Address */}
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

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Account Workspace Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                  <Shield className="w-4 h-4" />
                </span>
                <select
                  id="role"
                  className="input-premium pl-10 appearance-none bg-no-repeat bg-right text-zinc-700 dark:text-zinc-300"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Member">Member (View & resolve tasks)</option>
                  <option value="Admin">Admin (Full project configuration)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Password
              </label>
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
              
              {/* Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xxs font-medium">
                    <span className="text-zinc-400">Password Strength</span>
                    <span className={`font-semibold ${
                      strength.label === 'Strong' ? 'text-emerald-500' : 
                      strength.label === 'Good' ? 'text-indigo-500' : 
                      strength.label === 'Fair' ? 'text-amber-500' : 'text-rose-500'
                    }`}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              )}
              {errors.password && <span className="text-xxs font-semibold text-rose-500">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`input-premium pl-10 ${errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                />
              </div>
              {errors.confirmPassword && <span className="text-xxs font-semibold text-rose-500">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium btn-primary w-full shadow-lg shadow-indigo-500/25 flex items-center justify-center py-3 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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
