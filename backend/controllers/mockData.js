const bcrypt = require('bcryptjs');

// Mock Database Tables
let users = [
  {
    id: 'user_1',
    name: 'Tanreet Kaur',
    email: 'tanreet@company.com',
    password: '', // hashed below
    role: 'Admin',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Tanreet%20Kaur',
    assignedProjects: ['project_1', 'project_2'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'user_2',
    name: 'Rahul Sharma',
    email: 'rahul@company.com',
    password: '', // hashed below
    role: 'Member',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahul%20Sharma',
    assignedProjects: ['project_1'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'user_3',
    name: 'Karan Singh',
    email: 'karan@company.com',
    password: '', // hashed below
    role: 'Member',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Karan%20Singh',
    assignedProjects: ['project_1', 'project_2'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
];

// Hash mock passwords synchronously for convenience
const salt = bcrypt.genSaltSync(10);
users.forEach(u => {
  u.password = bcrypt.hashSync('password123', salt);
});

let projects = [
  {
    id: 'project_1',
    title: 'Acme Brand Refresh',
    description: 'Rebrand company logo, styling guide, website mockup design, and messaging hierarchy for 2026 launch.',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'Active',
    teamMembers: ['user_1', 'user_2', 'user_3'],
    progress: 66,
    createdBy: 'user_1',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'project_2',
    title: 'GraphQL API Gateway',
    description: 'Design and build the unified frontend API gateway linking backend microservices with GraphQL resolver queries.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 'Medium',
    status: 'Active',
    teamMembers: ['user_1', 'user_3'],
    progress: 33,
    createdBy: 'user_1',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
];

let tasks = [
  {
    id: 'task_1',
    title: 'Finalize brand guidelines doc',
    description: 'Create stylesheet representing brand guidelines: primary, secondary, status colors, and dark mode specs.',
    assignedTo: 'user_3',
    projectId: 'project_1',
    status: 'Completed',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    comments: [
      { id: 'c1', user: 'user_1', text: 'This looks fantastic! Great color palette selection.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 'c2', user: 'user_3', text: 'Thanks Tanreet, incorporating the indigo accents now.', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_2',
    title: 'Review landing page Figma design mockups',
    description: 'Audit layouts, typography sizes, and floating card responsiveness with the product design team.',
    assignedTo: 'user_1',
    projectId: 'project_1',
    status: 'Completed',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    comments: [],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_3',
    title: 'Implement drag-and-drop Kanban interface',
    description: 'Integrate custom animations and state-level drag events so cards can move fluidly between columns.',
    assignedTo: 'user_2',
    projectId: 'project_1',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    comments: [
      { id: 'c3', user: 'user_2', text: 'Making progress using Framer Motion. Almost ready for code review.', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'task_4',
    title: 'Setup GraphQL schema definitions',
    description: 'Outline mutations, queries, query arguments, and type entities for task resources.',
    assignedTo: 'user_3',
    projectId: 'project_2',
    status: 'Todo',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    comments: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

let activities = [
  {
    id: 'act_1',
    user: 'user_3',
    action: 'moved task "Finalize brand guidelines doc" to Completed',
    project: 'project_1',
    task: 'task_1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'act_2',
    user: 'user_1',
    action: 'commented on task "Finalize brand guidelines doc": "This looks fantastic! Great..."',
    project: 'project_1',
    task: 'task_1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'act_3',
    user: 'user_2',
    action: 'commented on task "Implement drag-and-drop Kanban interface": "Making progress using..."',
    project: 'project_1',
    task: 'task_3',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// Helper to recalculate projects progress
const recalcProgress = (projectId) => {
  const projTasks = tasks.filter(t => t.projectId === projectId);
  if (projTasks.length === 0) return 0;
  const completed = projTasks.filter(t => t.status === 'Completed').length;
  return Math.round((completed / projTasks.length) * 100);
};

// Map database items with user models format (populate emulation)
const populateUser = (userId) => {
  const u = users.find(x => x.id === userId);
  if (!u) return null;
  return { id: u.id, _id: u.id, name: u.name, email: u.email, avatar: u.avatar, role: u.role };
};

const populateProject = (projectId) => {
  const p = projects.find(x => x.id === projectId);
  if (!p) return null;
  return { id: p.id, _id: p.id, title: p.title };
};

// Exported mock database operations
module.exports = {
  // Users Operations
  users: {
    find: async () => users.map(u => ({ id: u.id, _id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar })),
    findOne: async ({ email }) => users.find(u => u.email === email.toLowerCase()),
    findById: async (id) => users.find(u => u.id === id),
    create: async (data) => {
      const newUser = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email.toLowerCase(),
        password: bcrypt.hashSync(data.password, 10),
        role: data.role || 'Member',
        avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
        assignedProjects: [],
        createdAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    }
  },

  // Projects Operations
  projects: {
    find: async (query = {}) => {
      let filtered = [...projects];
      if (query.$or) {
        const creatorId = query.$or[0].createdBy;
        const memberId = query.$or[1].teamMembers;
        filtered = projects.filter(p => p.createdBy === creatorId || p.teamMembers.includes(memberId));
      }
      return filtered.map(p => ({
        ...p,
        _id: p.id,
        progress: recalcProgress(p.id),
        createdBy: populateUser(p.createdBy),
        teamMembers: p.teamMembers.map(populateUser)
      }));
    },
    findById: async (id) => {
      const p = projects.find(x => x.id === id);
      if (!p) return null;
      return {
        ...p,
        _id: p.id,
        progress: recalcProgress(p.id),
        createdBy: populateUser(p.createdBy),
        teamMembers: p.teamMembers.map(populateUser)
      };
    },
    create: async (data, creatorId) => {
      const id = `project_${Date.now()}`;
      const newProj = {
        id,
        title: data.title,
        description: data.description || '',
        deadline: new Date(data.deadline),
        priority: data.priority || 'Medium',
        status: 'Active',
        teamMembers: data.teamMembers || [creatorId],
        progress: 0,
        createdBy: creatorId,
        createdAt: new Date(),
      };
      projects.push(newProj);
      return {
        ...newProj,
        _id: newProj.id,
        createdBy: populateUser(creatorId),
        teamMembers: newProj.teamMembers.map(populateUser)
      };
    },
    update: async (id, data) => {
      const idx = projects.findIndex(p => p.id === id);
      if (idx === -1) return null;
      
      const updated = {
        ...projects[idx],
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : projects[idx].deadline
      };
      projects[idx] = updated;
      return {
        ...updated,
        _id: updated.id,
        createdBy: populateUser(updated.createdBy),
        teamMembers: updated.teamMembers.map(populateUser)
      };
    },
    delete: async (id) => {
      projects = projects.filter(p => p.id !== id);
      tasks = tasks.filter(t => t.projectId !== id);
      return true;
    }
  },

  // Tasks Operations
  tasks: {
    find: async (query = {}) => {
      let filtered = [...tasks];
      
      if (query.projectId) {
        filtered = filtered.filter(t => t.projectId === query.projectId);
      } else if (query.projectId && query.projectId.$in) {
        const ids = query.projectId.$in;
        filtered = filtered.filter(t => ids.includes(t.projectId));
      }
      
      if (query.assignedTo) {
        filtered = filtered.filter(t => t.assignedTo === query.assignedTo);
      }
      if (query.status) {
        filtered = filtered.filter(t => t.status === query.status);
      }
      if (query.priority) {
        filtered = filtered.filter(t => t.priority === query.priority);
      }
      if (query.title && query.title.$regex) {
        const regex = new RegExp(query.title.$regex, 'i');
        filtered = filtered.filter(t => regex.test(t.title));
      }

      return filtered.map(t => ({
        ...t,
        _id: t.id,
        assignedTo: populateUser(t.assignedTo),
        projectId: populateProject(t.projectId)
      }));
    },
    findById: async (id) => {
      const t = tasks.find(x => x.id === id);
      if (!t) return null;
      return {
        ...t,
        _id: t.id,
        assignedTo: populateUser(t.assignedTo),
        projectId: populateProject(t.projectId),
        comments: t.comments.map(c => ({
          ...c,
          user: populateUser(c.user)
        }))
      };
    },
    create: async (data, creatorId) => {
      const id = `task_${Date.now()}`;
      const newTask = {
        id,
        title: data.title,
        description: data.description || '',
        assignedTo: data.assignedTo || null,
        projectId: data.projectId,
        status: data.status || 'Todo',
        priority: data.priority || 'Medium',
        dueDate: new Date(data.dueDate),
        comments: [],
        createdAt: new Date(),
      };
      tasks.push(newTask);
      return {
        ...newTask,
        _id: newTask.id,
        assignedTo: populateUser(newTask.assignedTo)
      };
    },
    update: async (id, data) => {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;

      const updated = {
        ...tasks[idx],
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : tasks[idx].dueDate
      };
      tasks[idx] = updated;
      return {
        ...updated,
        _id: updated.id,
        assignedTo: populateUser(updated.assignedTo),
        projectId: populateProject(updated.projectId)
      };
    },
    delete: async (id) => {
      tasks = tasks.filter(t => t.id !== id);
      return true;
    },
    addComment: async (id, text, userId) => {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      
      const newComment = {
        id: `comment_${Date.now()}`,
        user: userId,
        text,
        createdAt: new Date()
      };
      tasks[idx].comments.push(newComment);
      
      return tasks[idx].comments.map(c => ({
        ...c,
        user: populateUser(c.user)
      }));
    }
  },

  // Activities Operations
  activities: {
    find: async (query = {}) => {
      let filtered = [...activities];
      if (query.project && query.project.$in) {
        const ids = query.project.$in;
        filtered = filtered.filter(act => ids.includes(act.project));
      }
      return filtered
        .sort((a,b) => b.createdAt - a.createdAt)
        .map(act => ({
          ...act,
          _id: act.id,
          user: populateUser(act.user),
          project: populateProject(act.project),
          task: act.task ? { id: act.task, _id: act.task, title: (tasks.find(t=>t.id===act.task)||{}).title || 'Task' } : null
        }));
    },
    create: async (userId, action, projectId = null, taskId = null) => {
      const newAct = {
        id: `act_${Date.now()}`,
        user: userId,
        action,
        project: projectId,
        task: taskId,
        createdAt: new Date()
      };
      activities.unshift(newAct);
      return newAct;
    }
  }
};
