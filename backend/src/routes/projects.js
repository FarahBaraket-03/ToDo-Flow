import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { createProjectValidator, updateProjectValidator } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Project routes
router.get('/', getProjects);
router.get('/:id', getProject);
router.get('/:id/stats', getProjectStats);
router.post('/', createProjectValidator, createProject);
router.put('/:id', updateProjectValidator, updateProject);
router.delete('/:id', deleteProject);

export default router;
