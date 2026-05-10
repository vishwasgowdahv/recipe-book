import { Schema, model, Document, Types, PopulatedDoc } from 'mongoose';
import { IUser } from './User';
import { IRating } from './Rating';

export const recipeCategories = ['Breakfast', 'Soup', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Pizza', 'Dessert', 'Beverages'];

export interface IRecipe extends Document {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image: string;
  category: string;
  owner: Types.ObjectId | PopulatedDoc<IUser>;
  ratings: Types.ObjectId[] | IRating[];
  averageRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true,
    minlength: [3, 'Recipe name must be at least 3 characters long'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
  },
  ingredients: {
    type: [String],
    required: [true, 'Ingredients are required'],
    validate: {
      validator: (v: string[]) => Array.isArray(v) && v.length > 0,
      message: 'At least one ingredient is required',
    },
  },
  instructions: {
    type: [String],
    required: [true, 'Instructions are required'],
    validate: {
      validator: (v: string[]) => Array.isArray(v) && v.length > 0,
      message: 'At least one instruction step is required',
    },
  },
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute'],
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1'],
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: recipeCategories,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe must have an owner'],
  },
  ratings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Rating',
    },
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

RecipeSchema.pre<IRecipe>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Recipe = model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;