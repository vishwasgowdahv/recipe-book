// server/src/routes/authRoutes.ts
import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,      
  updateUserProfile,   
  updatePassword,      
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware

const router = Router();

// Public routes
router.post('/register', registerUser); // POST /api/auth/register
router.post('/login', loginUser);       // POST /api/auth/login

// Protected routes for user profile management
router.get('/profile', protect, getUserProfile);         // GET /api/auth/profile
router.put('/profile', protect, updateUserProfile);      // PUT /api/auth/profile
router.put('/update-password', protect, updatePassword); // PUT /api/auth/update-password

export default router;