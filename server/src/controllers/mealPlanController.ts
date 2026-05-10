// server/src/controllers/mealPlanController.ts
import { Request, Response } from 'express';
import MealPlan from '../models/MealPlan';
import { IUser } from '../models/User'; 

interface AuthRequest extends Request {
    user?: IUser;
}

const getWeekEnd = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
};

export const getMealPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { weekStart } = req.query;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated.' });
            return;
        }

        const mealPlans = await MealPlan.find({ 
            userId,
            date: {
                $gte: new Date(weekStart as string),
                $lte: getWeekEnd(weekStart as string)
            }
        }).populate('recipeId');

        res.status(200).json(mealPlans);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch meal plan', error });
    }
};

export const saveMealPlanForWeek = async (req: AuthRequest, res: Response): Promise<void> => {
    const { weekStart, mealPlan } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }

    if (!weekStart || !mealPlan) {
        res.status(400).json({ message: 'Missing weekStart or mealPlan data.' });
        return;
    }

    try {
        // Step 1: Delete all existing meal plan entries for this user and week
        await MealPlan.deleteMany({
            userId,
            date: {
                $gte: new Date(weekStart),
                $lte: getWeekEnd(weekStart)
            }
        });

        // Step 2: Save all new meal plan entries
        const mealEntriesToSave = [];
        for (const date in mealPlan) {
            for (const mealType in mealPlan[date]) {
                const entry = mealPlan[date][mealType];
                if (entry && entry.recipeId) {
                    mealEntriesToSave.push({
                        userId,
                        recipeId: entry.recipeId,
                        date: new Date(date),
                        mealType,
                    });
                }
            }
        }

        if (mealEntriesToSave.length > 0) {
            await MealPlan.insertMany(mealEntriesToSave);
        }

        res.status(200).json({ message: 'Meal plan saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save meal plan', error });
    }
};

export const addMealToPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    const { recipeId, date, mealType } = req.body;
    try {
        const newMealPlan = new MealPlan({
            userId: req.user?._id,
            recipeId,
            date,
            mealType,
        });
        const savedMealPlan = await newMealPlan.save();
        res.status(201).json(savedMealPlan);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add meal to plan', error });
    }
};

export const removeMealFromPlan = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const mealPlan = await MealPlan.findByIdAndDelete(id);
        if (!mealPlan) {
            res.status(404).json({ message: 'Meal plan entry not found' });
            return;
        }
        res.status(200).json({ message: 'Meal plan entry removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove meal plan entry', error });
    }
};