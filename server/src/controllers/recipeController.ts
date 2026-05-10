import { Request, Response } from 'express';
import Recipe, { IRecipe } from '../models/Recipe';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

export const createRecipe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') });
  }

  const { name, description, ingredients, instructions, cookingTime, servings, image, category } = req.body;

  if (!name || !description || !ingredients || !instructions || !cookingTime || !servings || !category) {
    return res.status(400).json({ message: res.__('please_include_all_required_recipe_fields') });
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: res.__('ingredients_must_be_array') });
  }
  if (!Array.isArray(instructions) || instructions.length === 0) {
    return res.status(400).json({ message: res.__('instructions_must_be_array') });
  }

  try {
    const recipe = await Recipe.create({
      owner: new Types.ObjectId(req.user._id),
      name,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      image,
      category,
    });

    res.status(201).json({
      message: res.__('recipe_created_successfully'),
      recipe,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(400).json({ message: res.__('duplicate_field_error', field, value) });
    }
    res.status(500).json({ message: res.__('server_error_recipe_creation') });
  }
};

export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const { category, search, featured } = req.query;
    let filter: any = {};

    if (category && typeof category === 'string') {
      filter.category = category;
    }

    if (search && typeof search === 'string') {
      filter.name = { $regex: search, $options: 'i' };
    }

    // New logic to filter by featured status
    if (featured && featured === 'true') {
      filter.isFeatured = true;
    }

    const recipes = await Recipe.find(filter)
      .populate('owner', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: res.__('recipes_fetched_successfully'),
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    res.status(500).json({ message: res.__('server_error_fetching_recipes') });
  }
};

export const searchRecipesByIngredients = async (req: Request, res: Response) => {
  const { ingredients } = req.query;

  if (!ingredients || typeof ingredients !== 'string') {
    return res.status(400).json({ message: 'Invalid ingredients parameter. Must be a comma-separated string.' });
  }

  const ingredientList = ingredients.split(',').map(item => new RegExp(item.trim(), 'i'));

  try {
    const recipes = await Recipe.find({
      ingredients: { $in: ingredientList }
    });

    res.status(200).json({
      message: 'Recipes fetched successfully based on ingredients',
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while searching for recipes.' });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: res.__('invalid_recipe_id_format') });
  }

  try {
    const recipe = await Recipe.findById(id)
      .populate('owner', ['username', 'email'])
      .populate({
        path: 'ratings',
        populate: {
          path: 'user',
          select: 'username',
        }
      });
    if (!recipe) {
      return res.status(404).json({ message: res.__('recipe_not_found') });
    }

    res.status(200).json({
      message: res.__('recipe_fetched_successfully'),
      recipe,
    });
  } catch (error) {
    res.status(500).json({ message: res.__('server_error_fetching_recipe') });
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') });
  }

  const { id } = req.params;
  const { name, description, ingredients, instructions, cookingTime, servings, image, category } = req.body;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: res.__('invalid_recipe_id_format') });
  }

  try {
    let recipe = await Recipe.findById(id).select('+user');

    if (!recipe) {
      return res.status(404).json({ message: res.__('recipe_not_found') });
    }

    if (!(recipe.owner as Types.ObjectId).equals(req.user._id as Types.ObjectId)) {
      return res.status(403).json({ message: res.__('not_authorized_update_recipe') });
    }

    if (name) recipe.name = name;
    if (description) recipe.description = description;
    if (ingredients) {
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: res.__('ingredients_must_be_array') });
      }
      recipe.ingredients = ingredients;
    }
    if (instructions) {
      if (!Array.isArray(instructions) || instructions.length === 0) {
        return res.status(400).json({ message: res.__('instructions_must_be_array') });
      }
      recipe.instructions = instructions;
    }
    if (cookingTime) recipe.cookingTime = cookingTime;
    if (servings) recipe.servings = servings;
    if (image) recipe.image = image;
    if (category) recipe.category = category;

    await recipe.save({ validateBeforeSave: true });

    res.status(200).json({
      message: res.__('recipe_updated_successfully'),
      recipe,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    res.status(500).json({ message: res.__('server_error_recipe_update') });
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_user_not_found') });
  }

  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: res.__('invalid_recipe_id_format') });
  }

  try {
    const recipe = await Recipe.findById(id).select('+user');

    if (!recipe) {
      return res.status(404).json({ message: res.__('recipe_not_found') });
    }

    if (!(recipe.owner as Types.ObjectId).equals(req.user._id as Types.ObjectId)) {
      return res.status(403).json({ message: res.__('not_authorized_delete_recipe') });
    }

    await Recipe.deleteOne({ _id: id });

    res.status(200).json({ message: res.__('recipe_deleted_successfully') });
  } catch (error) {
    res.status(500).json({ message: res.__('server_error_recipe_deletion') });
  }
};