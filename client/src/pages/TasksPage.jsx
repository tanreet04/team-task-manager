import React, { useEffect, useState } from 'react';
import { taskAPI, projectAPI, authAPI } from '../services/api';
import { 
  CheckSquare, 
  Search, 
  Grid, 
  List, 
  Calendar, 
  User, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState('Table'); // Table, Grid

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const taskRes = await taskAPI.getAll();
      if (taskRes.success) {
        setTasks(taskRes.tasks);
      }
      const projRes = await projectAPI.getAll();
      if (projRes.success) {
        setProjects(projRes.projects);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskAPI.update(taskId, { status: newStatus });
      if (res.success) {
        toast.success(`Task marked as ${newStatus}`);
        fetchTasksData();
      }
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Filters logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesProject = projectFilter === 'All' || t.projectId?.id === projectFilter || t.projectId?._id === projectFilter || (t.projectId === projectFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Tasks Repository
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Filter, audit, and modify task parameters</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('Table')}
            className={`p-1.5 rounded-lg flex items-center text-xxs font-semibold ${
              viewMode === 'Table'
                ? 'bg-white dark:bg-zinc-950 text-indigo-500 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            Table View
          </button>
          <button
            onClick={() => setViewMode('Grid')}
            className={`p-1.5 rounded-lg flex items-center text-xxs font-semibold ${
              viewMode === 'Grid'
                ? 'bg-white dark:bg-zinc-950 text-indigo-500 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Grid className="w-3.5 h-3.5 mr-1" />
            Grid View
          </button>
        </div>
      </div>

      {/* Filter and Search Layout */}
      <div className="glass-panel p-4.5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-zinc-200 dark:border-zinc-900/60">
        
        {/* Search */}
        <div className="space-y-1.5 text-left">
          <label className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400">Search Title</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search title..."
              className="input-premium pl-9 py-1.5 text-xxs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Project Filter */}
        <div className="space-y-1.5 text-left">
          <label className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400">Filter Project</label>
          <select
            className="input-premium py-1.5 text-xxs text-zinc-700 dark:text-zinc-300"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5 text-left">
          <label className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400">Filter Status</label>
          <select
            className="input-premium py-1.5 text-xxs text-zinc-700 dark:text-zinc-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1.5 text-left">
          <label className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400">Filter Priority</label>
          <select
            className="input-premium py-1.5 text-xxs text-zinc-700 dark:text-zinc-300"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-44 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      ) : (
        <>
          {viewMode === 'Table' ? (
            /* TABLE VIEW */
            <div className="glass-panel rounded-2xl overflow-hidden shadow-premium border-zinc-200 dark:border-zinc-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-xxxxs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-250 dark:border-zinc-900/60">
                      <th className="p-4">Task Name</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Assigned To</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Due Date</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xxs font-medium">
                    {currentTasks.map((t) => (
                      <tr key={t._id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition duration-150">
                        <td className="p-4 text-zinc-900 dark:text-zinc-100 font-bold max-w-[200px] truncate" title={t.title}>
                          {t.title}
                        </td>
                        <td className="p-4 text-zinc-500 dark:text-zinc-400 font-semibold truncate max-w-[120px]">
                          {t.projectId?.title || 'General'}
                        </td>
                        <td className="p-4">
                          {t.assignedTo ? (
                            <div className="flex items-center space-x-2">
                              <img src={t.assignedTo.avatar} alt="" className="w-5 h-5 rounded-full bg-zinc-200" />
                              <span className="truncate max-w-[100px]">{t.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider ${
                            t.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                            t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 dark:text-zinc-400 font-semibold flex items-center mt-2.5">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                          {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <select
                            className={`px-2 py-1 rounded-lg border text-xxxxs font-bold uppercase tracking-wider bg-transparent outline-none cursor-pointer ${
                              t.status === 'Completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                              t.status === 'In Progress' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                              'border-indigo-500/30 text-indigo-500 bg-indigo-500/5'
                            }`}
                            value={t.status}
                            onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          >
                            <option value="Todo" className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">Todo</option>
                            <option value="In Progress" className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">In Progress</option>
                            <option value="Completed" className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {currentTasks.length === 0 && (
                <div className="py-12 text-center text-zinc-400">
                  No tasks matching selected filter configurations.
                </div>
              )}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentTasks.map((t) => (
                <div 
                  key={t._id} 
                  className="glass-panel p-4.5 rounded-2xl flex flex-col justify-between hover:shadow-premium transition duration-150 text-left border-zinc-200 dark:border-zinc-900/60"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.5 rounded text-xxxxs font-bold uppercase tracking-wider ${
                        t.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                        t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {t.priority}
                      </span>
                      <span className="text-xxxxs text-zinc-400 truncate max-w-[100px]" title={t.projectId?.title}>
                        {t.projectId?.title || 'General'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-8">
                      {t.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-xxxxs text-zinc-400">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    <select
                      className={`px-1.5 py-0.5 rounded border text-xxxxs font-bold bg-transparent outline-none cursor-pointer ${
                        t.status === 'Completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                        t.status === 'In Progress' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                        'border-indigo-500/30 text-indigo-500 bg-indigo-500/5'
                      }`}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    >
                      <option value="Todo" className="bg-white dark:bg-zinc-950 text-zinc-850">Todo</option>
                      <option value="In Progress" className="bg-white dark:bg-zinc-950 text-zinc-850">In Progress</option>
                      <option value="Completed" className="bg-white dark:bg-zinc-950 text-zinc-850">Completed</option>
                    </select>
                  </div>
                </div>
              ))}

              {currentTasks.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-400 bg-white dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl">
                  No tasks found
                </div>
              )}
            </div>
          )}

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xxs text-zinc-400 font-semibold">
                Showing {indexOfFirstTask + 1} - {Math.min(indexOfLastTask, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
