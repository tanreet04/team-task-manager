import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectAPI, authAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Calendar, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Active, Completed, High Priority

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Check query params to auto-open creation modal if redirected from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true') {
      setIsModalOpen(true);
    }
  }, [location]);

  // Fetch projects and users list
  const fetchData = async () => {
    setLoading(true);
    try {
      const projRes = await projectAPI.getAll();
      if (projRes.success) {
        setProjects(projRes.projects);
      }
      
      const usersRes = await authAPI.getUsers();
      if (usersRes.success) {
        setUsersList(usersRes.users);
      }
    } catch (err) {
      console.error('Failed to load projects data:', err);
      toast.error('Error loading projects list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      toast.error('Title and Deadline are required fields');
      return;
    }

    try {
      const newProj = {
        title,
        description,
        deadline,
        priority,
        teamMembers: selectedMembers,
      };

      const res = await projectAPI.create(newProj);
      if (res.success) {
        toast.success('Project created successfully!');
        setIsModalOpen(false);
        // Clear fields
        setTitle('');
        setDescription('');
        setDeadline('');
        setPriority('Medium');
        setSelectedMembers([]);
        
        // Refresh list
        fetchData();
      }
    } catch (err) {
      console.error('Project creation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}" and all its tasks? This action is irreversible.`)) {
      return;
    }

    try {
      const res = await projectAPI.delete(id);
      if (res.success) {
        toast.success('Project deleted');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Only project creators or Admins can delete projects');
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) => 
      prev.includes(userId) 
        ? prev.filter((id) => id !== userId) 
        : [...prev, userId]
    );
  };

  // Filter and search logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filter === 'Active') return p.status === 'Active';
    if (filter === 'Completed') return p.status === 'Completed';
    if (filter === 'High Priority') return p.priority === 'High';
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Workspace Projects
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manage tasks collections and milestones</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium btn-primary py-2.5 px-4 text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center justify-center self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project Workspace
        </button>
      </div>

      {/* Filters and search layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-900">
        
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search projects..."
            className="input-premium pl-9 py-1.5 bg-white dark:bg-zinc-900/60"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center space-x-2 overflow-x-auto self-start sm:self-auto py-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 mr-1 flex-shrink-0" />
          {['All', 'Active', 'Completed', 'High Priority'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xxs font-semibold tracking-wide border transition-all ${
                filter === cat
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Projects list catalog grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-60 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const isCreator = p.createdBy?.id === user?.id || p.createdBy?._id === user?.id;
            const canDelete = user?.role === 'Admin' || isCreator;

            return (
              <div 
                key={p._id} 
                className="glass-panel p-5.5 rounded-2xl flex flex-col justify-between hover:shadow-premium hover:-translate-y-0.5 duration-200 border-zinc-200 dark:border-zinc-900/60"
              >
                {/* Header: Title and Priority badge */}
                <div className="space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider ${
                      p.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      p.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                    }`}>
                      {p.priority} Priority
                    </span>
                    <span className="text-xxxxs text-zinc-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-zinc-400" />
                      Due {new Date(p.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-zinc-850 dark:text-zinc-100 group-hover:text-indigo-500 line-clamp-1">
                    {p.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-8">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mt-5 text-left">
                  <div className="flex justify-between items-center text-xxs font-semibold">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-zinc-900 dark:text-zinc-200">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer: User avatars and Actions */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
                  {/* Assigned members avatars list */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {p.teamMembers?.slice(0, 4).map((member, i) => (
                      <img
                        key={member.id || member._id || i}
                        src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || '')}`}
                        alt={member.name}
                        className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-zinc-950 bg-zinc-200"
                        title={member.name}
                      />
                    ))}
                    {p.teamMembers?.length > 4 && (
                      <div className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-zinc-950 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xxxxs font-bold">
                        +{p.teamMembers.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-2">
                    {canDelete && (
                      <button 
                        onClick={() => handleDeleteProject(p._id, p.title)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-400 hover:border-rose-500/20"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/projects/${p._id}`)}
                      className="btn-premium btn-primary py-1.5 px-3 text-xxs font-semibold flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Open Board
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-400 bg-white dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl flex flex-col items-center justify-center">
              <FolderKanban className="w-8 h-8 text-zinc-500 mb-2.5" />
              <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">No projects found</h3>
              <p className="text-xxs text-zinc-500 mt-1">Try updating search query or category filters</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 w-full max-w-lg rounded-2xl shadow-premium-lg overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/10">
              <h3 className="font-display font-bold text-sm tracking-tight text-zinc-800 dark:text-zinc-100 flex items-center">
                <FolderKanban className="w-4 h-4 mr-1.5 text-indigo-500" />
                Initialize Project Workspace
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5.5 space-y-4 flex-1 text-left overflow-y-auto max-h-[75vh]">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Brand Refresh"
                  className="input-premium py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Description</label>
                <textarea
                  placeholder="Summarize the core targets of this workspace..."
                  rows="3"
                  className="input-premium py-2 text-xs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Deadline & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Deadline Date *</label>
                  <input
                    type="date"
                    className="input-premium py-2 text-xs"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Priority Level</label>
                  <select
                    className="input-premium py-2 text-xs text-zinc-700 dark:text-zinc-300"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Assign team members */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Assign Team Members</label>
                <div className="border border-zinc-200 dark:border-zinc-900 rounded-xl p-3 max-h-36 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 space-y-1 bg-zinc-50/50 dark:bg-zinc-950/20">
                  {usersList.map((usr) => (
                    <div 
                      key={usr._id} 
                      onClick={() => toggleMemberSelection(usr._id)}
                      className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 rounded-lg cursor-pointer transition duration-100"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img src={usr.avatar} alt="" className="w-5.5 h-5.5 rounded-full bg-zinc-200" />
                        <div className="text-left">
                          <span className="text-xxs font-bold block text-zinc-800 dark:text-zinc-200">{usr.name}</span>
                          <span className="text-xxxxs text-zinc-400">{usr.role}</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedMembers.includes(usr._id)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-800'
                      }`}>
                        {selectedMembers.includes(usr._id) && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-150 dark:border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-premium btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-premium btn-primary py-2 px-4 shadow-md shadow-indigo-500/20"
                >
                  Create Project
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
