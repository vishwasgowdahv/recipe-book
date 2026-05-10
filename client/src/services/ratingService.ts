import axios from 'axios';
import api from './api';
import type { IBackendRating, IRating, ICreateRatingData, IUpdateRatingData } from '../interfaces/rating';

const mapBackendRatingToFrontend = (backendRating: IBackendRating): IRating => ({
  id: backendRating._id,
  recipeId: backendRating.recipe,
  user: {
    _id: backendRating.user?._id || 'unknown',
    username: backendRating.user?.username || 'Unknown User',
  },
  value: backendRating.rating,
  comment: backendRating.comment,
  createdAt: new Date(backendRating.createdAt).toLocaleDateString()
});

const ratingService = {
  getRatingsForRecipe: async (recipeId: string): Promise<IRating[]> => {
    try {
      const response = await api.get<{ message: string; ratings: IBackendRating[] }>(`/api/ratings/${recipeId}`);
      return response.data.ratings.map(mapBackendRatingToFrontend);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Failed to fetch ratings for recipe ${recipeId}`);
      } else {
        throw new Error('An unexpected error occurred while fetching ratings.');
      }
    }
  },

  createRating: async (data: ICreateRatingData, token: string): Promise<IRating> => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await api.post<{ message: string; rating: IBackendRating }>('/api/ratings', data, config);
      return mapBackendRatingToFrontend(response.data.rating);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create rating.');
      } else {
        throw new Error('An unexpected error occurred while creating rating.');
      }
    }
  },

  updateRating: async (ratingId: string, data: IUpdateRatingData, token: string): Promise<IRating> => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await api.put<{ message: string; rating: IBackendRating }>(`/api/ratings/${ratingId}`, data, config);
      return mapBackendRatingToFrontend(response.data.rating);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Failed to update rating ${ratingId}.`);
      } else {
        throw new Error('An unexpected error occurred while updating rating.');
      }
    }
  },

  deleteRating: async (ratingId: string, token: string): Promise<void> => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.delete(`/api/ratings/${ratingId}`, config);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || `Failed to delete rating ${ratingId}.`);
      } else {
        throw new Error('An unexpected error occurred while deleting rating.');
      }
    }
  },
};

export default ratingService;