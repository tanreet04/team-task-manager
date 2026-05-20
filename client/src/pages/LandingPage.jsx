import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Layers, 
  BarChart3, 
  Zap, 
  Shield, 
  Sparkles, 
  Play,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Layers className="w-5 h-5 text-indigo-500" />,
      title: "Kanban Boards",
      description: "Manage tasks visually. Drag and drop cards from Todo to In Progress to Completed with zero friction."
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
      title: "Interactive Analytics",
      description: "Track team productivity using modern charts. Visualize status distribution and team efficiency."
    },
    {
      icon: <Users className="w-5 h-5 text-blue-500" />,
      title: "Team Collaboration",
      description: "Assign tasks, log project activities, invite team members, and leave comments in real time."
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: "Instant Updates",
      description: "Synchronize workflows immediately with optimistic UI updates and live activity logs."
    },
    {
      icon: <Shield className="w-5 h-5 text-violet-500" />,
      title: "Role-Based Access",
      description: "Protect resources by allocating Admin and Member permissions for tasks and workspace edits."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-rose-500" />,
      title: "Self-Healing Fallback",
      description: "Runs seamlessly in-memory if local databases are unavailable. Zero setup required."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-panel py-3 shadow-premium' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/30">
              T
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              TeamTask
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-indigo-500">Features</a>
            <a href="#stats" className="text-sm font-medium hover:text-indigo-500">Stats</a>
            <a href="#how-it-works" className="text-sm font-medium hover:text-indigo-500">How It Works</a>
            <a href="#pricing" className="text-sm font-medium hover:text-indigo-500">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <Link to="/dashboard" className="btn-premium btn-primary text-xs font-semibold py-2 px-4">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-indigo-500">
                  Login
                </Link>
                <Link to="/signup" className="btn-premium btn-primary text-xs font-semibold py-2.5 px-4 shadow-lg shadow-indigo-500/25">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
              <span className="text-xs font-semibold tracking-wide uppercase">Introducing TeamTask 2.0</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              Manage Projects & <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                Teams Without Chaos
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl">
              An elegant, full-stack collaborative platform built for fast-moving startup teams. Assign tasks, track progress on real-time Kanban boards, and monitor stats with rich dashboard analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to={user ? "/dashboard" : "/signup"} className="btn-premium btn-primary py-3 px-6 text-sm font-semibold justify-center">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <button 
                onClick={() => {
                  if (user) navigate('/dashboard');
                  else navigate('/login');
                }} 
                className="btn-premium btn-secondary py-3 px-6 text-sm font-semibold justify-center"
              >
                <Play className="mr-2 w-4 h-4 fill-current text-zinc-500" />
                Live Demo
              </button>
            </div>
          </div>

          {/* Hero Right Preview & Floating Cards */}
          <div className="lg:col-span-6 relative mt-10 lg:mt-0">
            {/* Dashboard Mockup Preview */}
            <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-900/50 p-2.5 shadow-premium-lg backdrop-blur-sm overflow-hidden">
              <div className="w-full h-80 rounded-xl bg-zinc-900 dark:bg-zinc-950 p-4 border border-zinc-200/20 dark:border-zinc-800/50 flex flex-col justify-between overflow-hidden">
                {/* Simulated Mock Window Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-zinc-500 text-xxs font-mono">localhost:3000/dashboard</div>
                  <div className="w-6"></div>
                </div>

                {/* Simulated Mock Kanban Board Column */}
                <div className="grid grid-cols-3 gap-3 flex-1 pt-4 text-left">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-2">
                    <div className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Todo (2)</div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60 text-xxs space-y-1">
                      <div className="font-semibold text-zinc-200">GraphQL API Gateway</div>
                      <div className="w-10 h-1 bg-amber-500 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-2">
                    <div className="text-xxs font-bold text-zinc-400 uppercase tracking-wider text-indigo-400">In Progress (1)</div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60 text-xxs space-y-1">
                      <div className="font-semibold text-zinc-200">Drag & Drop Kanban</div>
                      <div className="w-10 h-1 bg-indigo-500 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 space-y-2">
                    <div className="text-xxs font-bold text-zinc-400 uppercase tracking-wider text-emerald-400">Completed (3)</div>
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/60 text-xxs opacity-60 space-y-1">
                      <div className="font-semibold text-zinc-300 line-through">Brand Guidelines</div>
                      <div className="w-10 h-1 bg-emerald-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute top-8 -left-8 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-premium-lg flex items-center space-x-3 animate-float"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xxs text-zinc-400 font-medium">Completion Rate</div>
                  <div className="text-sm font-bold font-display">+86% Completed</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-10 -right-4 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-premium-lg flex items-center space-x-3"
                style={{ animation: 'float 6s ease-in-out infinite alternate' }}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xxs text-zinc-400 font-medium">Upcoming Deadline</div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">Brand mockups - 2 days</div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-y border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Premium Features</h2>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Everything Your Startup Needs to Execute
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              We ditched the heavy enterprise bloat to deliver a responsive workspace optimized for fast implementation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-2xl text-left space-y-4 hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h4 className="font-display font-semibold text-lg text-zinc-850 dark:text-zinc-200">{feat.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productivity Stats Section */}
      <section id="stats" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Productivity Metrics</h2>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Drive High-Velocity Team Performance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: "37%", label: "Faster Task Completion" },
              { num: "4.8x", label: "Better Team Transparency" },
              { num: "14 hrs", label: "Saved Weekly Per Member" },
              { num: "99.9%", label: "Uptime SLA Guarantee" }
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-8 rounded-2xl space-y-2 backdrop-blur-sm">
                <div className="font-display font-extrabold text-4xl sm:text-5xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Workflow</h2>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Three Simple Steps to Organize Work
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              { step: "01", title: "Create a Project Workspace", desc: "Define goals, schedule deadlines, select priority levels, and assign cross-functional team members." },
              { step: "02", title: "Organize tasks via Kanban", desc: "Decompose projects into tasks, drag them through workflows, and add comment details." },
              { step: "03", title: "Analyze Team Productivity", desc: "Observe visual analytics reports outlining completion speed, backlog tasks, and weekly output." }
            ].map((item, idx) => (
              <div key={idx} className="relative space-y-4 text-left p-6">
                <div className="font-display font-black text-6xl text-indigo-500/10 dark:text-indigo-500/5 absolute -top-8 left-2">
                  {item.step}
                </div>
                <h4 className="font-display font-bold text-xl pt-4">{item.title}</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-zinc-200 dark:border-zinc-900 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Success Stories</h2>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Loved by Fast-Growing Product Teams
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "TeamTask replaced three other disconnected tools for us. The interface is blazing fast and the drag-and-drop Kanban board just works.",
                author: "Sarah Chen",
                role: "VP of Product, CloudScale",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
              },
              {
                quote: "We were impressed that the dashboard gives us immediate productivity data. The charts are super sleek and don't lag.",
                author: "Marcus Brody",
                role: "Co-Founder, RetroFlow",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
              },
              {
                quote: "The MOCK DB mode saved us during client presentations when internet was down. Excellent developer architecture!",
                author: "Elena Petrova",
                role: "Engineering Director, DevSync",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"
              }
            ].map((testi, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-8 rounded-2xl text-left space-y-6 flex flex-col justify-between hover:shadow-premium duration-350">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic leading-relaxed">
                  "{testi.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <img src={testi.avatar} alt={testi.author} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800" />
                  <div>
                    <div className="text-sm font-bold">{testi.author}</div>
                    <div className="text-xs text-zinc-400">{testi.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-500 uppercase">Pricing Plans</h2>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Simple, Transparent Pricing
            </h3>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-8 rounded-2xl text-left flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h4 className="font-display font-bold text-xl">Starter Plan</h4>
                  <p className="text-xs text-zinc-400 mt-1">Perfect for individuals and small trials.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-display font-extrabold">$0</span>
                  <span className="text-xs text-zinc-400 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3.5 text-sm">
                  {["3 Active Projects", "Up to 5 Team Members", "In-memory database simulation", "Basic Kanban columns"].map((f, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400">
                      <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/signup" className="btn-premium btn-secondary w-full text-center justify-center mt-8">
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-500 p-8 rounded-2xl text-left flex flex-col justify-between relative shadow-premium-lg">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-500 text-white font-bold text-xxs uppercase tracking-wider">
                Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-display font-bold text-xl">SaaS Pro Plan</h4>
                  <p className="text-xs text-zinc-400 mt-1">For fast-scaling high performance teams.</p>
                </div>
                <div className="flex items-baseline">
                  <span className="text-4xl font-display font-extrabold">$12</span>
                  <span className="text-xs text-zinc-400 ml-1">/ user / mo</span>
                </div>
                <ul className="space-y-3.5 text-sm">
                  {["Unlimited Projects & Tasks", "Unlimited Team Invites", "MongoDB Cloud persistence", "Dashboard analytical metrics", "Custom Activity log feeds", "Priority 24/7 support"].map((f, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-zinc-850 dark:text-zinc-200">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/signup" className="btn-premium btn-primary w-full text-center justify-center mt-8 shadow-lg shadow-indigo-500/25">
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          
          <div className="md:col-span-6 space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
                T
              </div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                TeamTask
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Deliver project results faster with our streamlined and beautiful collaboration platform.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-8 text-sm">
            <span className="text-zinc-400 text-xs">© 2026 TeamTask Inc. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-indigo-500 text-xs">Terms</a>
              <a href="#" className="hover:text-indigo-500 text-xs">Privacy</a>
              <a href="#" className="hover:text-indigo-500 text-xs">Contact</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
