import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 font-sans text-center transition-colors duration-300">
      
      <div className="space-y-6 max-w-md">
        
        {/* Glow icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto animate-float">
          <HelpCircle className="w-8 h-8" />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="text-xxs font-bold text-indigo-500 uppercase tracking-widest flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Resource Unreachable</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl text-zinc-900 dark:text-zinc-100">
            404
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            The page you are looking for has been moved, renamed, or doesn't exist in our project workspace registry.
          </p>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <Link 
            to="/"
            className="btn-premium btn-primary py-2.5 px-5 text-xs font-semibold shadow-md shadow-indigo-500/20 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Return to Homepage
          </Link>
        </div>

      </div>

    </div>
  );
}
