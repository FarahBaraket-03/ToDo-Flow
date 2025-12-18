import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { validationResult } from 'express-validator';

// Get all projects for user
export const getProjects = async (req, res, next) => {
  try {
    const { includeTaskCount } = req.query;

    const projects = await Project.findAll({
      where: { userId: req.userId },
      order: [['position', 'ASC'], ['createdAt', 'DESC']],
      ...(includeTaskCount && {
        include: [{
          model: Task,
          as: 'tasks',
          attributes: []
        }],
        attributes: {
          include: [
            [Task.sequelize.fn('COUNT', Task.sequelize.col('tasks.id')), 'taskCount']
          ]
        },
        group: ['Project.id']
      })
    });

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

// Get single project
export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id, userId: req.userId },
      include: [{
        model: Task,
        as: 'tasks',
        order: [['position', 'ASC'], ['createdAt', 'DESC']]
      }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// Create new project
export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const projectData = {
      ...req.body,
      userId: req.userId
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id, userId: req.userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update(req.body);

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deleteTasksMode = 'unassign' } = req.query;

    const project = await Project.findOne({
      where: { id, userId: req.userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Handle tasks based on mode
    if (deleteTasksMode === 'delete') {
      // Delete all tasks in project
      await Task.destroy({
        where: { projectId: id, userId: req.userId }
      });
    } else {
      // Unassign tasks from project
      await Task.update(
        { projectId: null },
        { where: { projectId: id, userId: req.userId } }
      );
    }

    await project.destroy();

    res.json({ 
      message: 'Project deleted successfully',
      tasksDeleted: deleteTasksMode === 'delete'
    });
  } catch (error) {
    next(error);
  }
};

// Get project statistics
export const getProjectStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id, userId: req.userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const [total, completed, pending] = await Promise.all([
      Task.count({ where: { projectId: id, userId: req.userId } }),
      Task.count({ where: { projectId: id, userId: req.userId, status: 'completed' } }),
      Task.count({ where: { projectId: id, userId: req.userId, status: { [Op.ne]: 'completed' } } })
    ]);

    res.json({
      project,
      stats: {
        total,
        completed,
        pending
      }
    });
  } catch (error) {
    next(error);
  }
};
