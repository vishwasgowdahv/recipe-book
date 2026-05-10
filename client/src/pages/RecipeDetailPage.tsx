import React, { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import recipeService from '../services/recipeService';
import ratingService from '../services/ratingService';
import type { IFrontendRecipe } from '../interfaces/recipe';
import type { IRating, ICreateRatingData, IUpdateRatingData } from '../interfaces/rating';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import '../styles/RecipeDetailPage.css';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, authToken } = useAuth();

  const [recipe, setRecipe] = useState<IFrontendRecipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [ratings, setRatings] = useState<IRating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState<boolean>(true);
  const [ratingsError, setRatingsError] = useState<string | null>(null);

  const [newRatingValue, setNewRatingValue] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [submitRatingError, setSubmitRatingError] = useState<string | null>(null);

  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [editingRatingValue, setEditingRatingValue] = useState<number>(0);
  const [editingComment, setEditingComment] = useState<string>('');
  const [isUpdatingRating, setIsUpdatingRating] = useState<boolean>(false);
  const [updateRatingError, setUpdateRatingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError("Recipe ID is missing from URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedRecipe = await recipeService.getRecipeById(id);
        setRecipe(fetchedRecipe);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || error.message || 'Failed to fetch recipe details.');
        } else {
          setError('An unexpected error occurred while fetching recipe details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!id) return;

      setRatingsLoading(true);
      setRatingsError(null);
      try {
        const fetchedRatings = await ratingService.getRatingsForRecipe(id);
        setRatings(fetchedRatings);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setRatingsError(error.response?.data?.message || error.message || 'Failed to fetch ratings.');
        } else {
          setRatingsError('An unexpected error occurred while fetching ratings.');
        }
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatings();
  }, [id]);

  const handleRatingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !authToken) {
      setSubmitRatingError("You must be logged in to submit a rating.");
      return;
    }
    if (!id || newRatingValue === 0) {
      setSubmitRatingError("Please provide a rating and a comment (optional).");
      return;
    }

    setIsSubmittingRating(true);
    setSubmitRatingError(null);

    const ratingData: ICreateRatingData = {
      recipe: id,
      rating: newRatingValue,
      comment: newComment,
    };

    try {
      const createdRating = await ratingService.createRating(ratingData, authToken);
      setRatings(prevRatings => [createdRating, ...prevRatings]);
      setNewRatingValue(0);
      setNewComment('');
      if (recipe) {
        const updatedRecipe = await recipeService.getRecipeById(recipe.id);
        setRecipe(updatedRecipe);
      }

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSubmitRatingError(err.response?.data?.message || "Failed to submit rating.");
      } else {
        setSubmitRatingError("Failed to submit rating.");
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleEditClick = (ratingToEdit: IRating) => {
    setEditingRatingId(ratingToEdit.id);
    setEditingRatingValue(ratingToEdit.value);
    setEditingComment(ratingToEdit.comment);
  };

  const handleEditCancel = () => {
    setEditingRatingId(null);
    setEditingRatingValue(0);
    setEditingComment('');
    setUpdateRatingError(null);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !authToken || !editingRatingId) {
      setUpdateRatingError("Authentication error or no rating selected for update.");
      return;
    }
    if (editingRatingValue === 0) {
      setUpdateRatingError("Rating value cannot be 0.");
      return;
    }

    setIsUpdatingRating(true);
    setUpdateRatingError(null);

    const updateData: IUpdateRatingData = {
      rating: editingRatingValue,
      comment: editingComment,
    };

    try {
      const updatedRating = await ratingService.updateRating(editingRatingId, updateData, authToken);
      setRatings(prevRatings => prevRatings.map(r => 
        r.id === editingRatingId ? updatedRating : r
      ));
      handleEditCancel();
      if (recipe) {
        const updatedRecipe = await recipeService.getRecipeById(recipe.id);
        setRecipe(updatedRecipe);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setUpdateRatingError(err.response?.data?.message || "Failed to update rating.");
      } else {
        setUpdateRatingError("Failed to update rating.");
      }
    } finally {
      setIsUpdatingRating(false);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    if (!user || !authToken) {
      alert("You must be logged in to delete a rating.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this rating?")) {
      return;
    }

    try {
      await ratingService.deleteRating(ratingId, authToken);
      setRatings(prevRatings => prevRatings.filter(r => r.id !== ratingId));
      if (recipe) {
        const updatedRecipe = await recipeService.getRecipeById(recipe.id);
        setRecipe(updatedRecipe);
      }
      alert("Rating deleted successfully!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete rating.");
      } else {
        alert("Failed to delete rating.");
      }
    }
  };

  const handleDeleteRecipe = async () => {
    if (!user || !authToken || !id || recipe?.authorId !== user.id) { 
      alert("You are not authorized to delete this recipe.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    try {
      await recipeService.deleteRecipe(id, authToken);
      alert("Recipe deleted successfully!");
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to delete recipe.");
      } else {
        alert("Failed to delete recipe.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-xl">
        Loading recipe...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 text-xl p-4">
        <p className="mb-4">Error: {error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors duration-300"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 text-xl p-4">
        <p className="mb-4">Recipe not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors duration-300"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const ingredientsToDisplay = recipe.ingredients ?? [];
  const instructionsToDisplay = recipe.instructions ?? [];
  
  const isRecipeOwner = user && recipe.authorId === user.id;

  const midpoint = Math.ceil(ingredientsToDisplay.length / 2);
  const firstHalf = ingredientsToDisplay.slice(0, midpoint);
  const secondHalf = ingredientsToDisplay.slice(midpoint);

  return (
    <div className="min-h-screen font-[Poppins]">
      <div className="relative w-full h-[500px]">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center justify-center w-15 h-15 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300 font-semibold cursor-pointer"
            aria-label="Go back to recipes"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        </div>
        
        {isRecipeOwner && (
          <div className="absolute top-4 right-4 flex space-x-4">
          <Link to={`/edit-recipe/${recipe.id}`}
                className="px-4 py-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300 font-semibold cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </Link>

            <button
              onClick={handleDeleteRecipe}
              className="px-4 py-4 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-300 font-semibold cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold sm:text-5xl text-orange-400 leading-tight mb-2">{recipe.title}</h1>
              <p className="text-gray-500 text-lg mb-8 font-thin">by <span>{recipe.author}</span></p>
              <p className="text-gray-600 leading-relaxed text-lg italic">{recipe.description}</p>
            </div>
            <div className="lg:w-1/4 flex flex-col space-y-4 justify-center items-end text-lg text-gray-500">
              <div className="flex items-center gap-2">
                <StarRating value={recipe.rating || 0} readOnly />
                <span className="text-yellow-500 font-semibold">{recipe.rating?.toFixed(1) || 'N/A'}/5</span>
                <span>({recipe.ratingCount || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-amber-700">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.25a.75.75 0 00-1.5 0v4.25h-3a.75.75 0 000 1.5h3.75a.75.75 0 00.75-.75V5.75z" clipRule="evenodd" />
                </svg>
                <span>{recipe.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span role="img" aria-label="servings" className="text-amber-700 text-2xl">🍽️</span>
                <span>{recipe.servings}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl text-orange-500 mb-4">Ingredients</h2>
            <div className="ml-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {firstHalf.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {secondHalf.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl text-orange-500 mb-4">Instructions</h2>
            <ol className="ml-4 list-decimal list-inside text-gray-700 text-lg space-y-3">
              {instructionsToDisplay.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {user ? (
          <form onSubmit={handleRatingSubmit} className="mb-8 p-4 rounded-lg">
            <h3 className="text-xl text-stone-800 mb-4">Add Your Rating</h3>
            <div className="mb-4">
              <StarRating value={newRatingValue} onChange={setNewRatingValue} />
            </div>
            <div className="mb-4">
              <textarea
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="shadow appearance-none rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline resize-none"
                placeholder="Write your comment here..."
              ></textarea>
            </div>
            {submitRatingError && (
              <p className="text-red-500 text-sm mb-4">{submitRatingError}</p>
            )}
            <button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white py-2 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmittingRating || newRatingValue === 0}
            >
              {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        ) : (
          <p className="mb-8 text-gray-600 text-lg text-center">
            <Link to="/auth" className="text-amber-500 hover:underline">Log in</Link> to add your rating and comments!
          </p>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h3 className="text-xl text-stone-800 mb-4 pb-2">User Reviews ({ratings.length})</h3>
        {ratingsLoading ? (
          <p className="text-gray-600 text-center">Loading comments...</p>
        ) : ratingsError ? (
          <p className="text-red-500 text-center">Error loading comments: {ratingsError}</p>
        ) : ratings.length === 0 ? (
          <p className="text-gray-600 text-center">No comments yet. Be the first to add one!</p>
        ) : (
          <div className="space-y-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 p-4 rounded-lg shadow-sm">
                {editingRatingId === rating.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4">
                    <h4 className="text-base text-gray-800">Edit Your Rating</h4>
                    <div>
                      <StarRating value={editingRatingValue} onChange={setEditingRatingValue} />
                    </div>
                    <div>
                      <textarea
                        id="editComment"
                        value={editingComment}
                        onChange={(e) => setEditingComment(e.target.value)}
                        rows={3}
                        className="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                      ></textarea>
                    </div>
                    {updateRatingError && (
                      <p className="text-red-500 text-sm">{updateRatingError}</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-orange-400 hover:bg-orange-400 text-white py-2 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdatingRating}
                      >
                        {isUpdatingRating ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="bg-gray-500 hover:bg-gray-500 text-white py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <span className="text-gray-900 mr-2">{rating.user.username}</span>
                      <StarRating value={rating.value} readOnly />
                      <span className="text-gray-500 text-sm ml-auto">{rating.createdAt}</span>
                    </div>
                    <p className="text-gray-600 mb-5">{rating.comment}</p>
                    {user && rating.user._id === user.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(rating)}
                          className="text-blue-400 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRating(rating.id)}
                          className="text-red-400 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailPage;