import express from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateProfile,
  changePassword 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidator, loginValidator } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
