// server/src/controllers/ratingController.ts
import { Request, Response, NextFunction } from 'express';
import Rating from '../models/Rating';
import Recipe from '../models/Recipe'; // We need to access the Recipe model
import { Types } from 'mongoose';

// Helper function to recalculate average rating for a recipe
async function updateRecipeAverageRating(recipeId: Types.ObjectId) { // Function parameter type
  const objectIdRecipeId = (typeof recipeId === 'string' && Types.ObjectId.isValid(recipeId)) 
                           ? new Types.ObjectId(recipeId) 
                           : recipeId;
  const stats = await Rating.aggregate([
    {
      $match: { recipe: objectIdRecipeId }, // Use the potentially converted ID here
    },
    {
      $group: {
        _id: '$recipe', 
        averageRating: { $avg: '$rating' }, 
        ratingCount: { $sum: 1 }, 
      },
    },
  ]);

  console.log("DEBUG: Aggregation stats value-->", stats);

  if (stats.length > 0) {
    const { averageRating, ratingCount } = stats[0];
    await Recipe.findByIdAndUpdate(
      recipeId,
      {
        averageRating: parseFloat(averageRating.toFixed(1)), // Round to 1 decimal place
        ratingCount,
      },
      { new: true, runValidators: true }
    );
  } else {
    // If no ratings exist (e.g., all deleted), reset averageRating and ratingCount
    await Recipe.findByIdAndUpdate(
      recipeId,
      { averageRating: 0, ratingCount: 0 },
      { new: true, runValidators: true }
    );
  }
}

// @desc    Submit a new rating for a recipe
// @route   POST /api/ratings
// @access  Private
export const createRating = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_no_user_in_request') });
  }

  const { recipe: recipeId, rating, comment } = req.body; // 'recipe' field in body is the recipe ID

  if (!recipeId || !rating) {
    return res.status(400).json({ message: res.__('please_provide_recipe_id_rating') });
  }

  if (!Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: res.__('invalid_recipe_id_format') });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: res.__('invalid_rating_value') });
  }

  try {
    // Check if the recipe actually exists
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).json({ message: res.__('recipe_not_found_general') });
    }

    // Check if user has already rated this recipe (thanks to unique compound index)
    const existingRating = await Rating.findOne({
      recipe: recipeId,
      user: req.user._id as Types.ObjectId,
    });

    if (existingRating) {
      return res.status(409).json({ message: res.__('rating_already_submitted') });
    }

    const newRating = await Rating.create({
      recipe: recipeId,
      user: req.user._id as Types.ObjectId, // User's ID from middleware
      rating,
      comment,
    });

    // Recalculate and update the recipe's average rating
    await updateRecipeAverageRating(recipeId);

    res.status(201).json({
      message: res.__('rating_submitted_successfully'),
      rating: newRating,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    // Handle potential duplicate key error from the unique compound index
    if (error.code === 11000) {
      return res.status(409).json({ message: res.__('rating_already_submitted') });
    }
    console.error(error);
    res.status(500).json({ message: res.__('server_error_rating_submission') });
  }
};

// @desc    Get all ratings for a specific recipe
// @route   GET /api/ratings/:recipeId
// @access  Public
export const getRecipeRatings = async (req: Request, res: Response) => {
  const { recipeId } = req.params;

  if (!Types.ObjectId.isValid(recipeId)) {
    return res.status(400).json({ message: res.__('invalid_recipe_id_format') });
  }

  try {
    const ratings = await Rating.find({ recipe: recipeId })
      .populate('user', 'username'); // Populate user who gave the rating, only username

    if (ratings.length === 0) {
      return res.status(200).json({ message: res.__('no_ratings_found'), ratings: [] });
    }

    res.status(200).json({
      message: res.__('ratings_fetched_successfully'),
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: res.__('server_error_fetching_ratings') });
  }
};

// @desc    Update an existing rating
// @route   PUT /api/ratings/:ratingId
// @access  Private (User who created the rating only)
export const updateRating = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_no_user_in_request') });
  }

  const { ratingId } = req.params;
  const { rating, comment } = req.body;

  if (!Types.ObjectId.isValid(ratingId)) {
    return res.status(400).json({ message: res.__('invalid_rating_id_format') }); // New key needed
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({ message: res.__('invalid_rating_value') });
  }

  try {
    let existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
      return res.status(404).json({ message: res.__('rating_not_found') });
    }

    // Ensure the logged-in user is the owner of this rating
    if (existingRating.user.toString() !== (req.user._id as Types.ObjectId).toString()) {
      return res.status(403).json({ message: res.__('not_authorized_update_rating') });
    }

    // Only update fields that are provided
    if (rating !== undefined) existingRating.rating = rating;
    if (comment !== undefined) existingRating.comment = comment;

    await existingRating.save(); // Using .save() will trigger the pre('save') hook for updatedAt

    // Recalculate and update the recipe's average rating
    await updateRecipeAverageRating(existingRating.recipe as Types.ObjectId); // Cast for type safety

    res.status(200).json({
      message: res.__('rating_updated_successfully'),
      rating: existingRating,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return res.status(400).json({ message: res.__('validation_error_prefix') + messages.join(', ') });
    }
    console.error(error);
    res.status(500).json({ message: res.__('server_error_rating_update') });
  }
};

// @desc    Delete an existing rating
// @route   DELETE /api/ratings/:ratingId
// @access  Private (User who created the rating only)
export const deleteRating = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: res.__('not_authorized_no_user_in_request') });
  }

  const { ratingId } = req.params;

  if (!Types.ObjectId.isValid(ratingId)) {
    return res.status(400).json({ message: res.__('invalid_rating_id_format') }); // Reusing new key
  }

  try {
    const ratingToDelete = await Rating.findById(ratingId);

    if (!ratingToDelete) {
      return res.status(404).json({ message: res.__('rating_not_found') });
    }

    // Ensure the logged-in user is the owner of this rating
    if (ratingToDelete.user.toString() !== (req.user._id as Types.ObjectId).toString()) {
      return res.status(403).json({ message: res.__('not_authorized_delete_rating') });
    }

    const recipeIdToUpdate = ratingToDelete.recipe as Types.ObjectId; // Store recipe ID before deleting

    await Rating.deleteOne({ _id: ratingId });

    // Recalculate and update the recipe's average rating after deletion
    await updateRecipeAverageRating(recipeIdToUpdate);

    res.status(200).json({ message: res.__('rating_deleted_successfully') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: res.__('server_error_rating_deletion') });
  }
};