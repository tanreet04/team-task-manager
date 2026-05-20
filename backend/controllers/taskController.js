const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mockDb = require('./mockData');

// Helper to recalculate project progress percentage
const updateProjectProgress = async (projectId) => {
  if (process.env.MOCK_DB === 'true') {
    return;
  }
  const totalTasks = await Task.countDocuments({ projectId });
  if (totalTasks === 0) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return 0;
  }
  const completedTasks = await Task.countDocuments({ projectId, status: 'Completed' });
  const progress = Math.round((completedTasks / totalTasks) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
  return progress;
};

// @desc    Get all tasks (with filters & search)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId, assignedTo, status, priority, search } = req.query;

    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      let query = {};
      if (projectId) {
        query.projectId = projectId;
      } else {
        if (req.user.role !== 'Admin') {
          const userProjects = await mockDb.projects.find({
            $or: [
              { createdBy: req.user.id },
              { teamMembers: req.user.id }
            ]
          });
          const projectIds = userProjects.map(p => p.id);
          query.projectId = { $in: projectIds };
        }
      }
      if (assignedTo) query.assignedTo = assignedTo;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) query.title = { $regex: search };

      const tasksList = await mockDb.tasks.find(query);
      return res.status(200).json({
        success: true,
        count: tasksList.length,
        tasks: tasksList,
      });
    }

    let query = {};

    // Filter by project
    if (projectId) {
      query.projectId = projectId;
    } else {
      // If no project filter is passed, filter tasks by projects the user has access to
      if (req.user.role !== 'Admin') {
        const userProjects = await Project.find({
          $or: [
            { createdBy: req.user.id },
            { teamMembers: req.user.id }
          ]
        }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        query.projectId = { $in: projectIds };
      }
    }

    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Text search on title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar role')
      .populate('projectId', 'title')
      .sort('dueDate');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving tasks',
    });
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const task = await mockDb.tasks.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      return res.status(200).json({
        success: true,
        task,
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar role')
      .populate('projectId', 'title teamMembers createdBy')
      .populate('comments.user', 'name email avatar role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify user has access to this project
    const project = task.projectId;
    const isMember = project.teamMembers.some(
      (mId) => mId.toString() === req.user.id
    );
    const isCreator = project.createdBy.toString() === req.user.id;

    if (req.user.role !== 'Admin' && !isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access tasks for this project',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving task details',
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, status, priority, dueDate } = req.body;

    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const project = await mockDb.projects.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      const task = await mockDb.tasks.create(req.body, req.user.id);
      
      let activityText = `created task "${title}"`;
      if (assignedTo) {
        const assignedUser = await mockDb.users.findById(assignedTo);
        if (assignedUser) {
          activityText += ` and assigned it to ${assignedUser.name}`;
        }
      }
      await mockDb.activities.create(req.user.id, activityText, projectId, task.id);

      return res.status(201).json({
        success: true,
        task,
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      projectId,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
    });

    // Recalculate project progress
    await updateProjectProgress(projectId);

    // Log Activity
    let activityText = `created task "${title}"`;
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser) {
        activityText += ` and assigned it to ${assignedUser.name}`;
      }
    }
    await Activity.create({
      user: req.user.id,
      action: activityText,
      project: projectId,
      task: task._id,
    });

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email avatar role');

    res.status(201).json({
      success: true,
      task: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task',
    });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      let task = await mockDb.tasks.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      const oldStatus = task.status;
      const oldAssignee = task.assignedTo ? task.assignedTo.id : null;

      task = await mockDb.tasks.update(req.params.id, req.body);

      // Log activity
      let activitiesList = [];
      if (req.body.status && req.body.status !== oldStatus) {
        activitiesList.push(`moved task "${task.title}" to ${req.body.status}`);
      }
      if (req.body.assignedTo !== undefined && req.body.assignedTo !== oldAssignee) {
        if (req.body.assignedTo) {
          const assignedUser = await mockDb.users.findById(req.body.assignedTo);
          if (assignedUser) {
            activitiesList.push(`assigned task "${task.title}" to ${assignedUser.name}`);
          }
        } else {
          activitiesList.push(`unassigned task "${task.title}"`);
        }
      }
      for (const act of activitiesList) {
        await mockDb.activities.create(req.user.id, act, task.projectId.id, task.id);
      }

      return res.status(200).json({
        success: true,
        task,
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email avatar role');

    // Recalculate project progress
    await updateProjectProgress(task.projectId);

    // Log Activity based on what changed
    let activities = [];
    if (req.body.status && req.body.status !== oldStatus) {
      activities.push(`moved task "${task.title}" to ${req.body.status}`);
    }
    if (req.body.assignedTo !== undefined && req.body.assignedTo !== oldAssignee) {
      if (req.body.assignedTo) {
        const assignedUser = await User.findById(req.body.assignedTo);
        if (assignedUser) {
          activities.push(`assigned task "${task.title}" to ${assignedUser.name}`);
        }
      } else {
        activities.push(`unassigned task "${task.title}"`);
      }
    }
    if (req.body.title && req.body.title !== task.title) {
      activities.push(`renamed task to "${req.body.title}"`);
    }

    // Log all tracked activities
    for (const act of activities) {
      await Activity.create({
        user: req.user.id,
        action: act,
        project: task.projectId,
        task: task._id,
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task',
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const task = await mockDb.tasks.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      const pId = task.projectId.id;
      const title = task.title;

      await mockDb.tasks.delete(req.params.id);
      await mockDb.activities.create(req.user.id, `deleted task "${title}"`, pId);
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const projectId = task.projectId;
    const title = task.title;

    await Task.findByIdAndDelete(req.params.id);

    // Recalculate project progress
    await updateProjectProgress(projectId);

    // Log Activity
    await Activity.create({
      user: req.user.id,
      action: `deleted task "${title}"`,
      project: projectId,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting task',
    });
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addTaskComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const task = await mockDb.tasks.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }
      const comments = await mockDb.tasks.addComment(req.params.id, text, req.user.id);
      await mockDb.activities.create(req.user.id, `commented on task "${task.title}": "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`, task.projectId.id, task.id);
      return res.status(200).json({
        success: true,
        comments,
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    // Log Activity
    await Activity.create({
      user: req.user.id,
      action: `commented on task "${task.title}": "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      project: task.projectId,
      task: task._id,
    });

    // Populate comments user info to return
    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.user', 'name email avatar role');

    res.status(200).json({
      success: true,
      comments: updatedTask.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding comment',
    });
  }
};

// @desc    Get recent activity logs
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      let query = {};
      if (req.user.role !== 'Admin') {
        const userProjects = await mockDb.projects.find({
          $or: [
            { createdBy: req.user.id },
            { teamMembers: req.user.id }
          ]
        });
        const projectIds = userProjects.map(p => p.id);
        query.project = { $in: projectIds };
      }
      const activitiesList = await mockDb.activities.find(query);
      return res.status(200).json({
        success: true,
        count: activitiesList.length,
        activities: activitiesList,
      });
    }

    let query = {};

    // Non-admins only see activity related to their projects
    if (req.user.role !== 'Admin') {
      const userProjects = await Project.find({
        $or: [
          { createdBy: req.user.id },
          { teamMembers: req.user.id }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar role')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(50); // Get latest 50 logs

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving activity logs',
    });
  }
};
