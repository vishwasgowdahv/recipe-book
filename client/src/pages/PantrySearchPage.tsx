import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import type { IFrontendRecipe } from '../interfaces/recipe';
import recipeService from '../services/recipeService';

const PantrySearchPage: React.FC = () => {
  const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<IFrontendRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // <-- New state variable

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedIngredient = currentIngredient.trim();
    if (trimmedIngredient && !pantryIngredients.includes(trimmedIngredient)) {
      setPantryIngredients([...pantryIngredients, trimmedIngredient]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setPantryIngredients(pantryIngredients.filter(ingredient => ingredient !== ingredientToRemove));
  };

  const handleSearch = async () => {
    if (pantryIngredients.length === 0) {
      setError("Please add at least one ingredient to your pantry.");
      setSearchResults([]); // Clear old results
      setHasSearched(false); // Make sure this is false if no search happens
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true); // <-- Set to true when the search begins

    try {
      const results = await recipeService.searchRecipesByIngredients(pantryIngredients);
      setSearchResults(results);
    } catch (err) {
      setError("Failed to fetch recipes. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 font-[Poppins] bg-neutral-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold text-center mb-8">Pantry Search</h1>
        <p className="text-center text-lg font-medium text-gray-600 mb-8">
          Look for recipes with what you have.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <form onSubmit={handleAddIngredient} className="flex mt-10 mb-10 gap-2">
            <input
              type="text"
              placeholder="Add an ingredient (e.g., 'chicken')"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="submit"
              className="py-2 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition duration-300 font-semibold"
            >
              Add
            </button>
          </form>

          {pantryIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pantryIngredients.map(ingredient => (
                <div key={ingredient} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-medium">
                  <span>{ingredient}</span>
                  <button
                    onClick={() => handleRemoveIngredient(ingredient)}
                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className={`py-2 px-12 font-semibold rounded-lg transition duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isLoading ? 'Searching...' : 'Find Recipes'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-center my-4">{error}</p>}
        {isLoading && <Spinner />}

        {searchResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(recipe => (
                <div key={recipe.id} className="bg-neutral-50 rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800">{recipe.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {recipe.description.length > 100
                        ? `${recipe.description.substring(0, 100)}...`
                        : recipe.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && !isLoading && !error && hasSearched && (
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg text-gray-600">No recipes found matching your pantry ingredients.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PantrySearchPage;