import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';

// Get all tasks for user
export const getTasks = async (req, res, next) => {
  try {
    const { 
      status, 
      priority, 
      projectId, 
      dueDate,
      search,
      limit = 100,
      offset = 0
    } = req.query;

    const where = { userId: req.userId };

    // Filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    
    if (dueDate === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueDate = { [Op.between]: [today, tomorrow] };
    } else if (dueDate === 'week') {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.dueDate = { [Op.between]: [today, nextWeek] };
    } else if (dueDate === 'overdue') {
      where.dueDate = { [Op.lt]: new Date() };
      where.status = { [Op.ne]: 'completed' };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'color', 'icon'] },
        { model: Task, as: 'subtasks', attributes: ['id', 'title', 'status'] }
      ],
      order: [['position', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Task.count({ where });

    res.json({ 
      tasks,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// Get single task
export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.userId },
      include: [
        { model: Project, as: 'project' },
        { model: Task, as: 'subtasks' },
        { model: Task, as: 'parentTask', attributes: ['id', 'title'] }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// Create new task
export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    const taskData = {
      ...req.body,
      userId: req.userId
    };

    // Clean up empty strings
    if (taskData.dueDate === '' || taskData.dueDate === null) {
      taskData.dueDate = null;
    }
    if (taskData.projectId === '' || taskData.projectId === null) {
      taskData.projectId = null;
    }

    // Verify project belongs to user if projectId is provided
    if (taskData.projectId) {
      const project = await Project.findOne({
        where: { id: taskData.projectId, userId: req.userId }
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    const task = await Task.create(taskData);
    
    // Fetch task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'color', 'icon'] }
      ]
    });

    res.status(201).json({
      message: 'Task created successfully',
      task: createdTask
    });
  } catch (error) {
    next(error);
  }
};

// Update task
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify project belongs to user if projectId is being updated
    if (req.body.projectId) {
      const project = await Project.findOne({
        where: { id: req.body.projectId, userId: req.userId }
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    await task.update(req.body);

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'color', 'icon'] }
      ]
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle task completion
export const toggleComplete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: { id, userId: req.userId }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = task.status === 'completed' ? 'todo' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();

    res.json({
      message: 'Task status updated',
      task
    });
  } catch (error) {
    next(error);
  }
};

// Get task statistics
export const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const [total, completed, pending, overdue] = await Promise.all([
      Task.count({ where: { userId } }),
      Task.count({ where: { userId, status: 'completed' } }),
      Task.count({ where: { userId, status: { [Op.ne]: 'completed' } } }),
      Task.count({ 
        where: { 
          userId, 
          status: { [Op.ne]: 'completed' },
          dueDate: { [Op.lt]: new Date() }
        } 
      })
    ]);

    res.json({
      stats: {
        total,
        completed,
        pending,
        overdue
      }
    });
  } catch (error) {
    next(error);
  }
};
