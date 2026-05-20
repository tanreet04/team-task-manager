const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const mockDb = require('./mockData');

// Helper to update project progress percentage
const updateProjectProgress = async (projectId) => {
  if (process.env.MOCK_DB === 'true') {
    // Progress calculation is already handled inside mockDb methods
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

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      let query = {};
      if (req.user.role !== 'Admin') {
        query = {
          $or: [
            { createdBy: req.user.id },
            { teamMembers: req.user.id }
          ]
        };
      }
      const projectsList = await mockDb.projects.find(query);
      return res.status(200).json({
        success: true,
        count: projectsList.length,
        projects: projectsList,
      });
    }

    let query = {};

    // Non-admins can only see projects they created or are part of
    if (req.user.role !== 'Admin') {
      query = {
        $or: [
          { createdBy: req.user.id },
          { teamMembers: req.user.id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role')
      .sort('-createdAt');

    // Dynamically update progress for accuracy
    for (let proj of projects) {
      proj.progress = await updateProjectProgress(proj._id);
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving projects',
    });
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const project = await mockDb.projects.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      // Access check
      const isMember = project.teamMembers.some((m) => m.id === req.user.id);
      const isCreator = project.createdBy.id === req.user.id;
      if (req.user.role !== 'Admin' && !isMember && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this project',
        });
      }
      return res.status(200).json({
        success: true,
        project,
      });
    }

    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Access check
    const isMember = project.teamMembers.some(
      (member) => member._id.toString() === req.user.id
    );
    const isCreator = project.createdBy._id.toString() === req.user.id;

    if (req.user.role !== 'Admin' && !isMember && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    // Refresh progress
    project.progress = await updateProjectProgress(project._id);

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving project details',
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { title, description, deadline, priority, teamMembers } = req.body;

    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const project = await mockDb.projects.create(req.body, req.user.id);
      await mockDb.activities.create(req.user.id, `created project "${title}"`, project.id);
      return res.status(201).json({
        success: true,
        project,
      });
    }

    // Default creator as team member
    const members = teamMembers || [];
    if (!members.includes(req.user.id)) {
      members.push(req.user.id);
    }

    const project = await Project.create({
      title,
      description,
      deadline,
      priority: priority || 'Medium',
      teamMembers: members,
      createdBy: req.user.id,
    });

    // Log activity
    await Activity.create({
      user: req.user.id,
      action: `created project "${title}"`,
      project: project._id,
    });

    // Populate created project info
    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    res.status(201).json({
      success: true,
      project: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      let project = await mockDb.projects.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      const isCreator = project.createdBy.id === req.user.id;
      if (req.user.role !== 'Admin' && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to edit project details',
        });
      }
      project = await mockDb.projects.update(req.params.id, req.body);
      await mockDb.activities.create(req.user.id, `updated project details for "${project.title}"`, project.id);
      return res.status(200).json({
        success: true,
        project,
      });
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Access check: only Admin or creator can edit project details
    const isCreator = project.createdBy.toString() === req.user.id;
    if (req.user.role !== 'Admin' && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit project details',
      });
    }

    // Calculate progress on update
    const progress = await updateProjectProgress(project._id);
    req.body.progress = progress;

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email avatar')
      .populate('teamMembers', 'name email avatar role');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    // Fallback for Mock Database
    if (process.env.MOCK_DB === 'true') {
      const project = await mockDb.projects.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      const isCreator = project.createdBy.id === req.user.id;
      if (req.user.role !== 'Admin' && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this project',
        });
      }
      await mockDb.projects.delete(req.params.id);
      await mockDb.activities.create(req.user.id, `deleted project "${project.title}"`);
      return res.status(200).json({
        success: true,
        message: 'Project and all associated tasks deleted successfully',
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Access check: only Admin or creator can delete project
    const isCreator = project.createdBy.toString() === req.user.id;
    if (req.user.role !== 'Admin' && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    // Remove all tasks associated with this project
    await Task.deleteMany({ projectId: project._id });

    // Remove project
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting project',
    });
  }
};
