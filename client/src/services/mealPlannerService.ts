import axios from 'axios';

const API_URL = `${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}/api/meal-planner`;

export interface MealPlanEntry {
  recipeId: string;
  recipeTitle: string;
}

export interface MealPlan {
  [date: string]: {
    [meal: string]: MealPlanEntry | null;
  };
}

export const getMealPlanForWeek = async (weekStart: string, authToken: string): Promise<MealPlan> => {
  try {
    const response = await axios.get(`${API_URL}?weekStart=${weekStart}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const backendData = response.data;
    const formattedData: MealPlan = {};
    if (Array.isArray(backendData)) {
      backendData.forEach(entry => {
        const dateKey = new Date(entry.date).toISOString().split('T')[0];
        if (!formattedData[dateKey]) {
          formattedData[dateKey] = {};
        }
        formattedData[dateKey][entry.mealType] = {
          recipeId: entry.recipeId._id,
          recipeTitle: entry.recipeId.title,
        };
      });
    }
    return formattedData;
  } catch (error) {
    console.error('Failed to fetch meal plan:', error);
    return {};
  }
};

export const saveMealPlan = async (weekStart: string, mealPlan: MealPlan, authToken: string): Promise<void> => {
  const mealPlanToSend: Record<string, any> = {};

  for (const date in mealPlan) {
    if (Object.prototype.hasOwnProperty.call(mealPlan, date)) {
        mealPlanToSend[date] = {};
        for (const mealType in mealPlan[date]) {
            if (Object.prototype.hasOwnProperty.call(mealPlan[date], mealType)) {
                const entry = mealPlan[date][mealType];
                if (entry) {
                    mealPlanToSend[date][mealType] = {
                        recipeId: entry.recipeId,
                    };
                }
            }
        }
    }
  }

  try {
    await axios.post(`${API_URL}/save-week`, { weekStart, mealPlan: mealPlanToSend }, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (error) {
    console.error('Failed to save meal plan:', error);
    throw error;
  }
};