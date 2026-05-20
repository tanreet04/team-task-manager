import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  MessageSquare, 
  Clock, 
  UserPlus, 
  Settings, 
  Check, 
  X, 
  Send, 
  AlertCircle,
  Paperclip,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SingleProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState([]);

  // Modal control states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Comment input
  const [commentText, setCommentText] = useState('');

  // Project configuration controls
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);

  const fetchProjectData = async () => {
    try {
      const projRes = await projectAPI.getById(id);
      if (projRes.success) {
        setProject(projRes.project);
      }
      
      const tasksRes = await taskAPI.getAll({ projectId: id });
      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      toast.error('Error fetching project data');
      navigate('/projects');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRes = await authAPI.getUsers();
      if (usersRes.success) {
        setUsersList(usersRes.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProjectData(), fetchUsers()]).finally(() => setLoading(false));
  }, [id]);

  // Recalculates progress in local state to avoid server roundtrip lag
  const recalculateLocalProgress = (updatedTasks) => {
    if (updatedTasks.length === 0) return 0;
    const completed = updatedTasks.filter(t => t.status === 'Completed').length;
    return Math.round((completed / updatedTasks.length) * 100);
  };

  // --- KANBAN DRAG & DROP EVENT HANDLERS ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const taskToMove = tasks.find(t => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    // OPTIMISTIC UPDATE: Update UI immediately
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map(t => 
      t._id === taskId ? { ...t, status: targetStatus } : t
    );
    setTasks(updatedTasks);
    
    // update project progress locally
    if (project) {
      setProject(prev => ({
        ...prev,
        progress: recalculateLocalProgress(updatedTasks)
      }));
    }

    try {
      const res = await taskAPI.update(taskId, { status: targetStatus });
      if (res.success) {
        toast.success(`Task status updated to ${targetStatus}`);
        // Refresh to fetch fresh log activities in navbar
        fetchProjectData();
      } else {
        throw new Error('Status update unsuccessful');
      }
    } catch (err) {
      console.error('Failed to drop task card:', err);
      toast.error('Could not move task card');
      // Rollback on failure
      setTasks(previousTasks);
      if (project) {
        setProject(prev => ({
          ...prev,
          progress: recalculateLocalProgress(previousTasks)
        }));
      }
    }
  };

  // --- TASK ACTIONS ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) {
      toast.error('Task title and due date are required');
      return;
    }

    try {
      const taskData = {
        title: taskTitle,
        description: taskDesc,
        assignedTo: taskAssignee || null,
        projectId: id,
        status: 'Todo',
        priority: taskPriority,
        dueDate: taskDueDate
      };

      const res = await taskAPI.create(taskData);
      if (res.success) {
        toast.success('Task created!');
        setIsTaskModalOpen(false);
        // Clear fields
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
        setTaskPriority('Medium');
        setTaskAssignee('');
        
        // Refresh project and board
        fetchProjectData();
      }
    } catch (err) {
      console.error('Task creation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddTaskComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      const res = await taskAPI.addComment(selectedTask._id, commentText);
      if (res.success) {
        toast.success('Comment added');
        setCommentText('');
        // Update selected task comments in local state
        const updatedTaskRes = await taskAPI.getById(selectedTask._id);
        if (updatedTaskRes.success) {
          setSelectedTask(updatedTaskRes.task);
        }
        // Refresh board task details list comment counter
        fetchProjectData();
      }
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateTaskStatus = async (newStatus) => {
    if (!selectedTask) return;

    try {
      const res = await taskAPI.update(selectedTask._id, { status: newStatus });
      if (res.success) {
        toast.success('Status updated');
        // Update selected task in modal
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
        fetchProjectData();
      }
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await taskAPI.delete(taskId);
      if (res.success) {
        toast.success('Task deleted successfully');
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        fetchProjectData();
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleInviteMembers = async (e) => {
    e.preventDefault();
    // In our simplified logic, we update the project teamMembers list
    if (!project) return;
    
    setIsInviteSubmitting(true);
    try {
      const updatedMembers = [...project.teamMembers.map(m=>m._id || m.id)];
      
      // Let's find members checked in checklist
      const checkedBoxes = document.querySelectorAll('input[name="invite-member"]:checked');
      checkedBoxes.forEach(box => {
        if (!updatedMembers.includes(box.value)) {
          updatedMembers.push(box.value);
        }
      });

      const res = await projectAPI.update(id, { teamMembers: updatedMembers });
      if (res.success) {
        toast.success('Workspace team members updated!');
        setIsInviteModalOpen(false);
        fetchProjectData();
      }
    } catch (err) {
      console.error(err);
      toast.error('Only Admins or Creators can update team memberships');
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  // Helper to open details modal
  const handleOpenTaskDetails = async (task) => {
    try {
      const res = await taskAPI.getById(task._id);
      if (res.success) {
        setSelectedTask(res.task);
      } else {
        setSelectedTask(task);
      }
    } catch (err) {
      setSelectedTask(task);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return <div className="text-center p-12">Project workspace not found.</div>;

  const now = new Date();

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Back button and Header details */}
      <div className="space-y-4">
        <button 
          onClick={() => navigate('/projects')}
          className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects List
        </button>

        {/* Project Header Widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-zinc-200 dark:border-zinc-900/60">
          <div className="space-y-2 flex-1 text-left">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider ${
                project.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                project.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
              }`}>
                {project.priority} Priority
              </span>
              <span className="text-xxs text-zinc-400 font-semibold flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Milestone Deadline: {new Date(project.deadline).toLocaleDateString([], { dateStyle: 'medium' })}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              {project.title}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>

            {/* Progress metrics */}
            <div className="flex items-center space-x-3 pt-2 max-w-xs">
              <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <span className="text-xxs font-bold text-zinc-900 dark:text-zinc-200">{project.progress}% Complete</span>
            </div>
          </div>

          {/* Quick workspace actions */}
          <div className="flex items-center space-x-3 self-start md:self-center">
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="btn-premium btn-secondary py-2 px-4 text-xs font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-1 text-zinc-500" />
              Invite Teammate
            </button>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="btn-premium btn-primary py-2 px-4 text-xs font-semibold shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Task Card
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Todo', 'In Progress', 'Completed'].map((columnStatus) => {
          const columnTasks = tasks.filter(t => t.status === columnStatus);

          return (
            <div 
              key={columnStatus}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
              className="bg-zinc-100/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900/60 p-4 rounded-2xl flex flex-col min-h-80"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-900/50">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    columnStatus === 'Todo' ? 'bg-indigo-500' :
                    columnStatus === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                  <h3 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    {columnStatus}
                  </h3>
                </div>
                <span className="text-xxxxs font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-900 text-zinc-500">
                  {columnTasks.length}
                </span>
              </div>

              {/* Column tasks scrollable items */}
              <div className="kanban-column-scroll space-y-3 flex-1">
                {columnTasks.map((t) => {
                  const isOverdue = t.status !== 'Completed' && new Date(t.dueDate) < now;

                  return (
                    <div
                      key={t._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t._id)}
                      onClick={() => handleOpenTaskDetails(t)}
                      className={`p-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-premium cursor-grab hover:scale-[1.01] hover:border-indigo-400 dark:hover:border-zinc-700/80 active:cursor-grabbing text-left transition-all ${
                        isOverdue 
                          ? 'border-rose-500 dark:border-rose-950 bg-rose-500/5' 
                          : 'border-zinc-200 dark:border-zinc-850'
                      }`}
                    >
                      {/* Priority Badges */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-xxxxs font-bold uppercase tracking-wider ${
                          t.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                          t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {t.priority}
                        </span>

                        {isOverdue && (
                          <span className="text-xxxxs font-bold text-rose-500 flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {/* Task title */}
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2 leading-snug line-clamp-2">
                        {t.title}
                      </h4>

                      {/* Card meta row */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60 text-xxxxs text-zinc-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-zinc-500" />
                          {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>

                        <div className="flex items-center space-x-2">
                          {t.comments?.length > 0 && (
                            <span className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-0.5 text-zinc-500" />
                              {t.comments.length}
                            </span>
                          )}
                          
                          {/* Assignee initials badge or avatar */}
                          {t.assignedTo ? (
                            <img 
                              src={t.assignedTo.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.assignedTo.name)}`} 
                              alt={t.assignedTo.name} 
                              className="w-5.5 h-5.5 rounded-full bg-zinc-200 border border-zinc-100 dark:border-zinc-950" 
                              title={`Assigned to ${t.assignedTo.name}`}
                            />
                          ) : (
                            <span className="w-5.5 h-5.5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-400 font-bold" title="Unassigned">?</span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="py-12 text-center text-zinc-400/80 border border-dashed border-zinc-200 dark:border-zinc-900/50 rounded-xl text-xxxxs">
                    Drag card here
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 w-full max-w-md rounded-2xl shadow-premium-lg overflow-hidden flex flex-col">
            
            <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/10">
              <h3 className="font-display font-bold text-sm tracking-tight text-zinc-850 dark:text-zinc-250">
                Create Project Task
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5.5 space-y-4 text-left">
              
              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Implement drag-and-drop Kanban"
                  className="input-premium py-2"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Description</label>
                <textarea
                  placeholder="Deconstruct task specifications..."
                  rows="2"
                  className="input-premium py-2 text-xs"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Assign To</label>
                <select
                  className="input-premium py-2 text-xs text-zinc-700 dark:text-zinc-300"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                >
                  <option value="">Unassigned (Open list)</option>
                  {project.teamMembers?.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Due Date *</label>
                  <input
                    type="date"
                    className="input-premium py-2 text-xs"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Priority</label>
                  <select
                    className="input-premium py-2 text-xs text-zinc-700 dark:text-zinc-300"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-150 dark:border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="btn-premium btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-premium btn-primary py-2 px-4 shadow-md shadow-indigo-500/20"
                >
                  Create Task
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TEAM MEMBERS INVITATION MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 w-full max-w-sm rounded-2xl shadow-premium-lg overflow-hidden flex flex-col">
            
            <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/10">
              <h3 className="font-display font-bold text-sm tracking-tight">
                Invite Team Members
              </h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleInviteMembers} className="p-5.5 space-y-4 text-left">
              <p className="text-xxs text-zinc-400 leading-normal mb-1">
                Select from registered directory members to add them to this project workspace board.
              </p>
              
              <div className="max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 border border-zinc-150 dark:border-zinc-900 rounded-xl p-2.5 bg-zinc-50/30">
                {usersList.map((usr) => {
                  const isAlreadyMember = project.teamMembers?.some(m => m.id === usr._id || m._id === usr._id || m.id === usr.id);
                  return (
                    <div key={usr._id} className="flex items-center justify-between py-1.5 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <img src={usr.avatar} alt="" className="w-5 h-5 rounded-full bg-zinc-200" />
                        <span className="text-xxs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-28">{usr.name}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        name="invite-member" 
                        value={usr._id} 
                        defaultChecked={isAlreadyMember}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-150 dark:border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="btn-premium btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviteSubmitting}
                  className="btn-premium btn-primary py-2 px-4 shadow-md shadow-indigo-500/20"
                >
                  {isInviteSubmitting ? 'Updating...' : 'Update Board'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TASK DETAILS MODAL (COMMENT FEED, DESCRIPTIONS AND DISCUSSIONS) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 w-full max-w-2xl rounded-2xl shadow-premium-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-150 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/10">
              <div className="flex items-center space-x-3">
                <span className="font-display font-semibold text-xxs text-zinc-400">TASK DETAIL / #{selectedTask._id?.substring(18)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xxxxs font-bold uppercase tracking-wider ${
                  selectedTask.priority === 'High' ? 'bg-rose-500/10 text-rose-500' :
                  selectedTask.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-indigo-500/10 text-indigo-500'
                }`}>
                  {selectedTask.priority}
                </span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col md:flex-row gap-6 overflow-y-auto flex-1 text-left">
              
              {/* Left Column: Title, Description, Attachments, Comments */}
              <div className="flex-1 space-y-6 md:max-w-[65%]">
                <div className="space-y-2">
                  <h2 className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
                    {selectedTask.title}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* Attachments Section mock UI */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Attachments UI</h4>
                  <div className="flex items-center space-x-2.5 p-2.5 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xxs text-zinc-400">
                    <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Upload project blueprints or documentation (drag PDF here)</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t border-zinc-150 dark:border-zinc-900/60">
                  <h3 className="font-display font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-500" />
                    Comments ({selectedTask.comments?.length || 0})
                  </h3>

                  {/* List of comments */}
                  <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                    {selectedTask.comments?.map((comment) => (
                      <div key={comment._id || comment.id} className="flex space-x-3 text-xxs">
                        <img 
                          src={comment.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.user?.name || 'U')}`}
                          alt="" 
                          className="w-7 h-7 rounded-full bg-zinc-200 border border-zinc-200 dark:border-zinc-850 flex-shrink-0"
                        />
                        <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-900/60 p-2.5 rounded-xl text-left space-y-1">
                          <div className="flex justify-between items-center font-bold text-zinc-800 dark:text-zinc-200">
                            <span>{comment.user?.name}</span>
                            <span className="text-xxxxs text-zinc-400 font-medium">
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-350 leading-relaxed leading-normal">{comment.text}</p>
                        </div>
                      </div>
                    ))}

                    {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                      <div className="p-4 text-center text-zinc-400 text-xxs bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl">
                        No discussion comments yet. Be the first to note updates.
                      </div>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddTaskComment} className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      placeholder="Ask a question or leave feedback..."
                      className="input-premium py-2 text-xxs flex-1"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn-premium btn-primary py-2 px-3 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column: Status and Metadata settings */}
              <div className="w-full md:w-[35%] bg-zinc-100/40 dark:bg-zinc-950/20 border border-zinc-200/60 dark:border-zinc-900/50 p-4.5 rounded-2xl space-y-4">
                
                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400">Task Status</label>
                  <select
                    className="input-premium py-2 text-xxs text-zinc-700 dark:text-zinc-300 font-bold bg-white dark:bg-zinc-950"
                    value={selectedTask.status}
                    onChange={(e) => handleUpdateTaskStatus(e.target.value)}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Due date */}
                <div className="space-y-1">
                  <span className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400 block">Due Date</span>
                  <div className="flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-350">
                    <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" />
                    {new Date(selectedTask.dueDate).toLocaleDateString([], { dateStyle: 'medium' })}
                  </div>
                </div>

                {/* Assignee details */}
                <div className="space-y-1.5">
                  <span className="text-xxxxs font-bold uppercase tracking-wider text-zinc-400 block">Assignee</span>
                  {selectedTask.assignedTo ? (
                    <div className="flex items-center space-x-2.5">
                      <img src={selectedTask.assignedTo.avatar} alt="" className="w-7 h-7 rounded-full bg-zinc-200" />
                      <div className="leading-none text-left">
                        <span className="text-xxs font-bold block text-zinc-800 dark:text-zinc-200">{selectedTask.assignedTo.name}</span>
                        <span className="text-xxxxs text-zinc-400">{selectedTask.assignedTo.role}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xxs font-semibold text-zinc-400 italic">No team member assigned</span>
                  )}
                </div>

                {/* Danger actions */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900/60 space-y-2">
                  <button
                    onClick={() => handleDeleteTask(selectedTask._id)}
                    className="btn-premium btn-secondary border-rose-500/20 text-rose-500 hover:bg-rose-500/10 w-full text-xxs font-semibold py-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete Task Card
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
