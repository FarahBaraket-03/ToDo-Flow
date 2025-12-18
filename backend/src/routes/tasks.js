import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  getTaskStats
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { createTaskValidator, updateTaskValidator } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.post('/', createTaskValidator, createTask);
router.put('/:id', updateTaskValidator, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleComplete);

export default router;
