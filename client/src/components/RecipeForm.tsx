import React, { useEffect, useState } from 'react';
import type { IUpdateRecipeData, ICreateRecipeData } from '../interfaces/recipe';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Breakfast',
  'Soup',
  'Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Pizza',
  'Dessert',
  'Beverages',
];

interface RecipeFormProps {
  initialData?: IUpdateRecipeData | ICreateRecipeData;
  onSubmit: (formData: IUpdateRecipeData | ICreateRecipeData) => void;
  loading: boolean;
  error: string | null;
  submitText: string;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ initialData, onSubmit, loading, error, submitText }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IUpdateRecipeData | ICreateRecipeData>(initialData || {
    name: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cookingTime: 0,
    servings: 1,
    image: '',
    category: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "cookingTime" || name === "servings") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, field: 'ingredients' | 'instructions') => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'ingredients' | 'instructions') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index: number, field: 'ingredients' | 'instructions') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedFormData = {
      ...formData,
      ingredients: formData.ingredients.filter(item => item.trim() !== ''),
      instructions: formData.instructions.filter(item => item.trim() !== ''),
    };
    onSubmit(cleanedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-xl space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
          placeholder="e.g., Spicy Chicken Curry"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 bg-white"
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
          placeholder="http://example.com/image.jpg"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
          placeholder="A delicious and easy-to-make chicken curry..."
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleArrayChange(e, index, 'ingredients')}
              placeholder={`Ingredient ${index + 1}`}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
            />
            {formData.ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'ingredients')}
                className="p-2 text-red-600 hover:text-red-800 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('ingredients')}
          className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
        >
          + Add Ingredient
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        {formData.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <textarea
              value={instruction}
              onChange={(e) => handleArrayChange(e, index, 'instructions')}
              placeholder={`Step ${index + 1}`}
              rows={2}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
            ></textarea>
            {formData.instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'instructions')}
                className="p-2 text-red-600 hover:text-red-800 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm3 3a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('instructions')}
          className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium"
        >
          + Add Step
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (minutes)</label>
          <input
            type="number"
            id="cookingTime"
            name="cookingTime"
            value={formData.cookingTime === 0 ? '' : formData.cookingTime}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={formData.servings === 0 ? '' : formData.servings}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-500"
            placeholder="e.g., 4"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-center">{error}</p>}

      <div className="flex justify-end gap-4 mt-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="py-3 px-6 rounded-full bg-gray-200 text-gray-700 font-semibold transition duration-300 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`py-3 px-6 rounded-full text-white font-semibold transition duration-300 ${
            loading ? 'bg-orange-500 opacity-70 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;