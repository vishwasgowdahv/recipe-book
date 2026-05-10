import { type IFrontendRecipe } from './recipe';

export interface IMealPlan {
    _id: string;
    userId: string;
    recipeId: string | IFrontendRecipe;
    date: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner';
    createdAt: string;
    updatedAt: string;
}