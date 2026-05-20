import React, { useEffect, useState } from 'react';
import { activityAPI } from '../services/api';
import { Activity, Clock, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await activityAPI.getAll();
      if (res.success) {
        setActivities(res.activities);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Activity Timeline
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Chronological record of workspace edits and project comments</p>
        </div>

        <button 
          onClick={fetchActivities}
          className="btn-premium btn-secondary py-2 px-3 text-xs font-semibold flex items-center shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
          Refresh Timeline
        </button>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border-zinc-200 dark:border-zinc-900/60 max-w-4xl">
          <div className="space-y-8 select-none">
            {activities.map((act, idx) => (
              <div key={act.id} className="flex items-start space-x-4 relative">
                {/* Connector Line */}
                {idx < activities.length - 1 && (
                  <span className="absolute left-[18px] top-9 bottom-[-32px] w-0.5 bg-zinc-200 dark:bg-zinc-800"></span>
                )}

                {/* Avatar with z-index to stay on top of the line */}
                <img 
                  src={act.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user?.name || '')}`} 
                  alt="" 
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 flex-shrink-0 z-10"
                />

                {/* Event Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{act.user?.name}</span> {act.action}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-xxxxs text-zinc-400 font-semibold">
                    <span className="text-indigo-500 uppercase tracking-wider">{act.project?.title || 'General'}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {new Date(act.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="py-12 text-center text-zinc-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                <span>No workspace logs have been created yet.</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
