import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeService from '../services/recipeService';
import { type ICreateRecipeData } from '../interfaces/recipe';
import Spinner from '../components/Spinner';
import RecipeForm from '../components/RecipeForm';

const AddRecipePage: React.FC = () => {
  const { authToken, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ICreateRecipeData) => {
    if (!authToken) {
      setError('You must be logged in to add a recipe.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await recipeService.createRecipe(formData, authToken);
      navigate('/recipes');
    } catch (err: any) {
      setError(err.message || 'Failed to add recipe.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-red-500 text-xl font-[Poppins] bg-neutral-50">
        <p>You must be logged in to add a recipe.</p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-4 py-2 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition duration-300"
        >
          Login / Register
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-10 min-h-screen font-[Poppins] bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 text-center mb-8">Add New Recipe</h1>
        <RecipeForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitText="Add Recipe"
        />
      </div>
    </div>
  );
};

export default AddRecipePage;