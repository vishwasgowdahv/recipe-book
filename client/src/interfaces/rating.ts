import { type IUserLite } from './user';

export interface IBackendRating {
  _id: string;
  recipe: string;
  user?: IUserLite;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRating {
  id: string;
  recipeId: string;
  user: IUserLite;
  value: number;
  comment: string;
  createdAt: string;
}

export interface ICreateRatingData {
  recipe: string;
  rating: number;
  comment: string;
}

export interface IUpdateRatingData {
  rating?: number;
  comment?: string;
}