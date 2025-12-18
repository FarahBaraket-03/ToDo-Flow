import { body } from 'express-validator';

// Auth validators
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Task validators
export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority value'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed']).withMessage('Invalid status value'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('projectId')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    }).withMessage('Invalid project ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority value'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed']).withMessage('Invalid status value'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date'),
  body('projectId')
    .optional()
    .isUUID().withMessage('Invalid project ID')
];

// Project validators
export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
];

export const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .trim()
];
