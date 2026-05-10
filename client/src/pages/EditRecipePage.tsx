import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { IFrontendRecipe, IUpdateRecipeData } from '../interfaces/recipe';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import RecipeForm from '../components/RecipeForm';
import recipeService from '../services/recipeService';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { authToken, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<IUpdateRecipeData | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError("Recipe ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const fetchedRecipe: IFrontendRecipe = await recipeService.getRecipeById(id);
        setRecipe({
          name: fetchedRecipe.title,
          description: fetchedRecipe.description,
          ingredients: fetchedRecipe.ingredients,
          instructions: fetchedRecipe.instructions,
          cookingTime: parseInt(fetchedRecipe.time),
          servings: parseInt(fetchedRecipe.servings),
          image: fetchedRecipe.image,
          category: fetchedRecipe.category,
        });
      } catch (err) {
        setError(`Failed to fetch recipe: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (formData: IUpdateRecipeData) => {
    if (!id || !authToken) return;
    setLoading(true);
    setError(null);
    try {
      await recipeService.updateRecipe(id, formData, authToken);
    } catch (err) {
      setError(`Failed to update recipe: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10 text-xl font-[Poppins]">{error}</div>;
  }

  if (!recipe) {
    return <div className="text-center mt-10 text-xl font-[Poppins]">Recipe not found or data not loaded.</div>;
  }

  return (
    <div className="w-full p-10 min-h-screen font-[Poppins] bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 text-center mb-8">Edit Recipe</h1>
        <h2 className="text-xl md:text-2xl font-bold text-orange-500 text-center mb-8">{recipe.name}</h2>
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitText="Update Recipe"
        />
      </div>
    </div>
  );
};

export default EditRecipePage;