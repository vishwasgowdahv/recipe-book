import { type IUserLite } from './user';

export interface IBackendRecipe {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image: string;
  owner?: IUserLite;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  category: string;
}

export interface IFrontendRecipe {
  id: string;
  image: string;
  title: string;
  author: string;
  authorId: string;
  rating: number;
  time: string;
  servings: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  ratingCount: number;
  category: string;
  createdAt: string;
}

export interface ICreateRecipeData {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image: string;
  category: string;
}

export interface IUpdateRecipeData {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image: string;
  category: string;
}