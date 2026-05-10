// server/src/routes/mealPlanRoutes.ts
import express from 'express';
import { getMealPlan, addMealToPlan, removeMealFromPlan, saveMealPlanForWeek } from '../controllers/mealPlanController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getMealPlan);

router.route('/').post(protect, addMealToPlan);
router.route('/:id').delete(protect, removeMealFromPlan);
router.route('/save-week').post(protect, saveMealPlanForWeek);

export default router;