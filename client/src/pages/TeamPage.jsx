import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { Users, Mail, Shield, UserCheck, Star, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getUsers();
        if (res.success) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load team directory');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Team Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Directory list of project members and administrators</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((usr) => (
            <div 
              key={usr._id || usr.id} 
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:shadow-premium duration-150 border-zinc-200 dark:border-zinc-900/60 text-left"
            >
              
              {/* Member Card Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <img 
                    src={usr.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(usr.name)}`} 
                    alt={usr.name} 
                    className="w-12 h-12 rounded-xl bg-zinc-200 border border-zinc-100 dark:border-zinc-800"
                  />
                  
                  {/* Role Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider flex items-center ${
                    usr.role === 'Admin' 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                      : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                  }`}>
                    <Shield className="w-2.5 h-2.5 mr-1" />
                    {usr.role}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {usr.name}
                  </h3>
                  <div className="flex items-center text-xxs text-zinc-400">
                    <Mail className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-zinc-500" />
                    <span className="truncate max-w-[180px]">{usr.email}</span>
                  </div>
                </div>
              </div>

              {/* Productivity Stat Widget */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between text-xxxxs font-bold text-zinc-400 uppercase tracking-wider">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-amber-500 mr-1" />
                  <span>Velocity Rating</span>
                </div>
                <span className="text-zinc-800 dark:text-zinc-200">
                  {usr.role === 'Admin' ? '98%' : '94%'} Efficiency
                </span>
              </div>

            </div>
          ))}

          {users.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-400 bg-white dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl">
              <Users className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
              <span>No workspace members found.</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
