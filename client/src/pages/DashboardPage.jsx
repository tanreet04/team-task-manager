import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI, activityAPI } from '../services/api';
import { motion } from 'framer-motion';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity as ActivityIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  
  // Charts formatted data
  const [statusChartData, setStatusChartData] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [teamChartData, setTeamChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch projects, tasks, and activities concurrently
        const [projRes, taskRes, actRes] = await Promise.all([
          projectAPI.getAll(),
          taskAPI.getAll(),
          activityAPI.getAll()
        ]);

        if (projRes.success && taskRes.success && actRes.success) {
          const projects = projRes.projects;
          const tasks = taskRes.tasks;
          const activities = actRes.activities;

          // 1. Calculate Stats
          const totalProjects = projects.length;
          const completedTasks = tasks.filter(t => t.status === 'Completed').length;
          const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
          
          const now = new Date();
          const overdueTasks = tasks.filter(t => {
            return t.status !== 'Completed' && new Date(t.dueDate) < now;
          }).length;

          setStats({
            totalProjects,
            completedTasks,
            pendingTasks,
            overdueTasks
          });

          // 2. Set Activities Feed (Top 5)
          setRecentActivities(activities.slice(0, 5));

          // 3. Set Upcoming Deadlines
          const deadlines = tasks
            .filter(t => t.status !== 'Completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 4);
          setUpcomingDeadlines(deadlines);

          // 4. Pie Chart: Task Status
          const todoCount = tasks.filter(t => t.status === 'Todo').length;
          const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
          setStatusChartData([
            { name: 'Todo', value: todoCount || 1, color: '#6366f1' }, // Indigo
            { name: 'In Progress', value: inProgressCount || 1, color: '#f59e0b' }, // Amber
            { name: 'Completed', value: completedTasks || 1, color: '#10b981' } // Emerald
          ]);

          // 5. Bar Chart: Weekly Productivity
          // Generate mock weekly task completions
          setWeeklyChartData([
            { day: 'Mon', completed: 2, created: 3 },
            { day: 'Tue', completed: 4, created: 4 },
            { day: 'Wed', completed: 3, created: 5 },
            { day: 'Thu', completed: 6, created: 3 },
            { day: 'Fri', completed: 5, created: 2 },
            { day: 'Sat', completed: 1, created: 0 },
            { day: 'Sun', completed: 2, created: 1 },
          ]);

          // 6. Line Chart: Team workload
          // Compute number of tasks per user
          const teamTasksMap = {};
          tasks.forEach(t => {
            const assigneeName = t.assignedTo?.name || 'Unassigned';
            if (!teamTasksMap[assigneeName]) {
              teamTasksMap[assigneeName] = { name: assigneeName, completed: 0, active: 0 };
            }
            if (t.status === 'Completed') {
              teamTasksMap[assigneeName].completed += 1;
            } else {
              teamTasksMap[assigneeName].active += 1;
            }
          });
          setTeamChartData(Object.values(teamTasksMap).slice(0, 6));

        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dynamic greeting based on current local hours
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Greeting Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {getGreeting()}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            {getFormattedDate()}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-3">
          <a href="/projects?create=true" className="btn-premium btn-secondary py-2 px-4 text-xs font-semibold">
            <Plus className="w-4 h-4 mr-1 text-zinc-500" />
            Create Project
          </a>
          <a href="/tasks" className="btn-premium btn-primary py-2 px-4 text-xs font-semibold shadow-md shadow-indigo-500/20">
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </a>
        </div>
      </div>

      {/* Dashboard Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Projects Card */}
        <div className="glass-panel p-6 rounded-2xl hover:shadow-premium hover:-translate-y-0.5 duration-250 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Total Projects</span>
            <div className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-100">{stats.totalProjects}</div>
            <div className="flex items-center text-xxs text-emerald-500 font-semibold pt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>+12% vs last month</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="glass-panel p-6 rounded-2xl hover:shadow-premium hover:-translate-y-0.5 duration-250 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-100">{stats.completedTasks}</div>
            <div className="flex items-center text-xxs text-emerald-500 font-semibold pt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>86% velocity rate</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="glass-panel p-6 rounded-2xl hover:shadow-premium hover:-translate-y-0.5 duration-250 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-100">{stats.pendingTasks}</div>
            <div className="flex items-center text-xxs text-zinc-400 font-semibold pt-1">
              <Clock className="w-3.5 h-3.5 mr-0.5" />
              <span>Backlog under control</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue Tasks Card */}
        <div className="glass-panel p-6 rounded-2xl hover:shadow-premium hover:-translate-y-0.5 duration-250 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider">Overdue Tasks</span>
            <div className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-100">{stats.overdueTasks}</div>
            <div className={`flex items-center text-xxs font-semibold pt-1 ${stats.overdueTasks > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              <AlertTriangle className="w-3.5 h-3.5 mr-0.5" />
              <span>{stats.overdueTasks > 0 ? 'Action required immediately' : 'All targets hit'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Recharts Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Productivity Bar Graph */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200">Weekly Productivity</h3>
              <p className="text-xxxxs text-zinc-400 mt-0.5">Tasks created vs resolved over days</p>
            </div>
            <span className="text-xxs font-bold text-indigo-500 flex items-center">
              Last 7 days
            </span>
          </div>
          <div className="w-full h-64 text-xxs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                    borderRadius: '12px'
                  }} 
                />
                <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} name="Created" barSize={16} />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200 mb-1">Task Status Ratio</h3>
          <p className="text-xxxxs text-zinc-400 mb-6">Distribution across backlog stages</p>
          
          <div className="w-full h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center justify-center leading-none">
              <span className="text-xl font-bold font-display">{stats.completedTasks + stats.pendingTasks}</span>
              <span className="text-xxxxs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">Tasks</span>
            </div>
          </div>

          {/* Custom Labels list */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-xxs pt-4 border-t border-zinc-100 dark:border-zinc-900">
            {statusChartData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="flex items-center text-zinc-400">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">{item.value === 1 && idx === 0 ? 0 : item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity Feed Timeline */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-8 flex flex-col text-left">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200">Recent Workspace Activity</h3>
              <p className="text-xxxxs text-zinc-400 mt-0.5">Chronological updates from project members</p>
            </div>
            <a href="/activity" className="text-xxs font-bold text-indigo-500 flex items-center hover:underline">
              Full Logs
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

          <div className="space-y-5 flex-1 select-none">
            {recentActivities.map((act, i) => (
              <div key={act.id} className="flex items-start space-x-3.5 relative">
                {/* Timeline Connector Line */}
                {i < recentActivities.length - 1 && (
                  <span className="absolute left-[15px] top-8 bottom-[-20px] w-0.5 bg-zinc-200 dark:bg-zinc-800"></span>
                )}
                
                {/* Avatar */}
                <img 
                  src={act.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(act.user?.name || '')}`} 
                  alt="" 
                  className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 flex-shrink-0 z-10"
                />

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-xxs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{act.user?.name}</span> {act.action}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-xxxxs text-zinc-400">
                    <span className="font-semibold text-indigo-500 uppercase tracking-widest">{act.project?.title || 'General'}</span>
                    <span>•</span>
                    <span>{new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div className="p-12 text-center text-zinc-400 text-xs">
                <ActivityIcon className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                No activity logs recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines Section */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-4 flex flex-col text-left">
          <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200 mb-1">Upcoming Deadlines</h3>
          <p className="text-xxxxs text-zinc-400 mb-6">Tasks needing review before delivery</p>

          <div className="space-y-3.5 flex-1">
            {upcomingDeadlines.map((task) => (
              <div 
                key={task.id} 
                className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900/60 rounded-xl flex items-center justify-between hover:shadow-premium transition duration-150"
              >
                <div className="space-y-1 max-w-[70%] text-left">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{task.title}</div>
                  <div className="flex items-center text-xxxxs text-zinc-400 space-x-1.5">
                    <span>{task.projectId?.title}</span>
                    <span>•</span>
                    <span className="font-semibold">{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Priority Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider ${
                    task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                    task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                  }`}>
                    {task.priority}
                  </span>

                  {/* Assignee Avatar */}
                  {task.assignedTo ? (
                    <img 
                      src={task.assignedTo.avatar} 
                      alt="" 
                      className="w-6 h-6 rounded-full bg-zinc-200 border border-zinc-200 dark:border-zinc-800" 
                      title={`Assigned to ${task.assignedTo.name}`}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-xxxxs font-semibold text-zinc-400" title="Unassigned">
                      ?
                    </div>
                  )}
                </div>
              </div>
            ))}

            {upcomingDeadlines.length === 0 && (
              <div className="p-8 text-center text-zinc-400 text-xs flex flex-col justify-center items-center h-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1.5" />
                <span>No pending deadlines!</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Team workload line graph */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200">Team Resource Workload</h3>
            <p className="text-xxxxs text-zinc-400 mt-0.5">Tasks assigned per active team member</p>
          </div>
        </div>
        <div className="w-full h-56 text-xxs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#a1a1aa' : '#71717a' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff', 
                  borderColor: theme === 'dark' ? '#27272a' : '#e4e4e7',
                  borderRadius: '12px'
                }} 
              />
              <Line type="monotone" dataKey="active" stroke="#f59e0b" strokeWidth={2.5} name="Active Tasks" dot={{ fill: '#f59e0b', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} name="Completed Tasks" dot={{ fill: '#10b981', strokeWidth: 1 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
