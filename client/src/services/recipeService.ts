import axios from 'axios';
import api from './api';
import type { IBackendRecipe, IFrontendRecipe, ICreateRecipeData, IUpdateRecipeData } from '../interfaces/recipe';

const mapBackendRecipeToFrontend = (backendRecipe: IBackendRecipe): IFrontendRecipe => ({
  id: backendRecipe._id,
  image: backendRecipe.image,
  title: backendRecipe.name,
  author: backendRecipe.owner?.username || 'Unknown Author',
  authorId: backendRecipe.owner?._id || '',
  rating: backendRecipe.averageRating,
  time: `${backendRecipe.cookingTime} min`,
  servings: `${backendRecipe.servings} servings`,
  description: backendRecipe.description,
  ingredients: backendRecipe.ingredients,
  instructions: backendRecipe.instructions,
  ratingCount: backendRecipe.ratingCount,
  category: backendRecipe.category,
  createdAt: backendRecipe.createdAt,
});

export const getRecipes = async (category?: string, searchTerm?: string, authorId?: string): Promise<IFrontendRecipe[]> => {
  try {
    const params: { category?: string; search?: string; authorId?: string } = {};
    if (category) {
      params.category = category;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }
    if (authorId) {
      params.authorId = authorId;
    }
    const response = await api.get<{ message: string; count: number; recipes: IBackendRecipe[] }>('/api/recipes', { params });
    return response.data.recipes.map(mapBackendRecipeToFrontend);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recipes');
    } else {
      throw new Error('An unexpected error occurred while fetching recipes');
    }
  }
};

export const getRecipesByUser = async (userId: string, authToken: string): Promise<IFrontendRecipe[]> => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
    const response = await api.get<{ message: string; count: number; recipes: IBackendRecipe[] }>(`/api/recipes?authorId=${userId}`, config);
    return response.data.recipes.map(mapBackendRecipeToFrontend);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user recipes');
    } else {
      throw new Error('An unexpected error occurred while fetching user recipes');
    }
  }
};

export const getRecipeById = async (id: string): Promise<IFrontendRecipe> => {
  try {
    const response = await api.get<{ message: string; recipe: IBackendRecipe }>(`/api/recipes/${id}`);
    const mappedRecipe = mapBackendRecipeToFrontend(response.data.recipe);
    return mappedRecipe;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Failed to fetch recipe with ID ${id}`);
    } else {
        throw new Error(`An unexpected error occurred while fetching recipe with ID ${id}`);
    }
  }
};

export const createRecipe = async (recipeData: ICreateRecipeData, authToken?: string): Promise<IFrontendRecipe> => {
  try {
    const config = authToken ? {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    } : {};

    const response = await api.post<IBackendRecipe>('/api/recipes', recipeData, config);
    return mapBackendRecipeToFrontend(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create recipe');
    } else {
      throw new Error('An unexpected error occurred while creating recipe');
    }
  }
};

export const updateRecipe = async (
  recipeId: string, 
  recipeData: IUpdateRecipeData, 
  token: string
): Promise<IFrontendRecipe> => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await api.put<IBackendRecipe>(`/api/recipes/${recipeId}`, recipeData, config);
    return mapBackendRecipeToFrontend(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || `Failed to update recipe ${recipeId}.`);
    } else {
      throw new Error('An unexpected error occurred while updating recipe.');
    }
  }
};

export const deleteRecipe = async (recipeId: string, token: string): Promise<void> => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    await api.delete(`/api/recipes/${recipeId}`, config);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || `Failed to delete recipe ${recipeId}.`);
    } else {
      throw new Error('An unexpected error occurred while deleting recipe.');
    }
  }
};

export const searchRecipesByIngredients = async (ingredients: string[]): Promise<IFrontendRecipe[]> => {
  try {
    const params = new URLSearchParams();
    if (ingredients.length > 0) {
      params.append('ingredients', ingredients.join(','));
    }
    const response = await api.get<{ message: string; count: number; recipes: IBackendRecipe[] }>('/api/recipes/search', { params });
    return response.data.recipes.map(mapBackendRecipeToFrontend);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to search for recipes by ingredients.');
    } else {
      throw new Error('An unexpected error occurred while searching recipes.');
    }
  }
};

export const getFeaturedRecipes = async (): Promise<IFrontendRecipe[]> => {
  try {
    const response = await api.get<{ message: string; count: number; recipes: IBackendRecipe[] }>('/api/recipes?featured=true');
    return response.data.recipes.map(mapBackendRecipeToFrontend);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured recipes.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const recipeService = {
  getRecipes,
  getRecipesByUser,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  searchRecipesByIngredients,
  getFeaturedRecipes
};

export default recipeService;