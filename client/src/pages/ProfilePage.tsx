import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import type { IFrontendRecipe } from '../interfaces/recipe';
import RecipeCard from '../components/RecipeCard';

const ProfilePage: React.FC = () => {
  const { user, authToken, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [userRecipes, setUserRecipes] = useState<IFrontendRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState<boolean>(true);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const fetchUserRecipes = async () => {
      if (user && authToken) {
        setRecipesLoading(true);
        setRecipesError(null);
        try {
          const fetchedRecipes = await recipeService.getRecipes(undefined, undefined, user.id);
          setUserRecipes(fetchedRecipes);
        } catch (err: any) {
          setRecipesError(err.message || 'Failed to fetch your recipes.');
        } finally {
          setRecipesLoading(false);
        }
      }
    };

    fetchUserRecipes();
  }, [user, authToken, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-white text-xl bg-black">
        {authLoading ? (
          <p>Loading user profile...</p>
        ) : (
          <>
            <p>You must be logged in to view your profile.</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 py-2 px-6 bg-amber-800 hover:bg-amber-900 text-white rounded-md transition duration-300"
            >
              Login / Register
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 min-h-screen font-[Poppins] bg-neutral-50">
      <div className="max-w-5xl mx-auto py-8 px-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-500 mb-2">
          Hello, {user.username}!
        </h1>
        <p className="text-gray-600 text-lg sm:text-xl font-thin mb-8">
          Welcome to your personal recipe hub.
        </p>

        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 border-b-2 border-orange-400 pb-2 mb-6">
          Your Recipes
        </h2>
        
        {recipesLoading ? (
          <div className="text-center text-gray-400 text-xl py-12">Loading your recipes...</div>
        ) : recipesError ? (
          <div className="text-center text-red-500 text-xl py-12">Error: {recipesError}</div>
        ) : userRecipes.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">
            You haven't created any recipes yet. <Link to="/add-recipe" className="text-amber-500 hover:underline">Add your first one!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {userRecipes.map((recipe) => (
              <Link to={`/recipes/${recipe.id}`} key={recipe.id} className="block">
                <RecipeCard
                  id={recipe.id}
                  image={recipe.image}
                  title={recipe.title}
                  author={recipe.author}
                  rating={recipe.rating}
                  time={recipe.time}
                  servings={recipe.servings}
                  ratingCount={recipe.ratingCount}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;