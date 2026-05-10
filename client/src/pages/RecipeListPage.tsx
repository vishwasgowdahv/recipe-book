import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import type { IFrontendRecipe } from '../interfaces/recipe';
import RecipeCard from '../components/RecipeCard';
import { categories } from '../data/categories';
import { MagnifyingGlassIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'cookingTime', label: 'Cooking Time' },
];

const RecipeListPage: React.FC = () => {
  const [recipes, setRecipes] = useState<IFrontendRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 9;
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedRecipes = await recipeService.getRecipes(selectedCategory ?? undefined, debouncedSearchTerm);
        setRecipes(fetchedRecipes);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, [selectedCategory, debouncedSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortRef]);

  const sortedRecipes = useMemo(() => {
    let sorted = [...recipes];
    switch (sortOption) {
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'cookingTime':
        sorted.sort((a, b) => {
          const timeA = parseInt(a.time);
          const timeB = parseInt(b.time);
          return timeA - timeB;
        });
        break;
      case 'newest':
      default:
        break;
    }
    return sorted;
  }, [recipes, sortOption]);

  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage);
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = sortedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortOption('newest');
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl font-[Poppins] bg-neutral-50">
        👨‍🍳 Yum recipes await thee...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container font-[Poppins] mx-auto mt-10 mb-10 px-4 py-2 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedCategory(category.name)}
                className={`group transform transition-transform duration-200 focus:outline-none ${selectedCategory === category.name ? 'scale-110 ring-4 ring-orange-500 rounded-full' : 'hover:scale-105'}`}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              <p className="mt-3 text-sm md:text-base font-semibold text-gray-700 text-center">{category.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 mt-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="relative w-full md:w-3/4 max-w-xl">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Find your next meal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-full border-2 border-gray-300 text-gray-500 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors shadow-sm text-lg font-[Poppins] focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <XMarkIcon />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative z-10" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between px-6 py-3 border-2 border-orange-500 bg-white text-gray-700 font-[Poppins] rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-600 transition-colors w-40"
              >
                <span>{sortOptions.find(opt => opt.value === sortOption)?.label}</span>
                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSortOpen && (
                <ul className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {sortOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => {
                        setSortOption(option.value);
                        setIsSortOpen(false);
                      }}
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <span className={`${sortOption === option.value ? 'text-orange-500 font-bold' : 'text-gray-800'}`}>
                        {option.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {(selectedCategory || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-neutral-100 text-gray-600 font-semibold rounded-full hover:bg-neutral-100 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center mt-12">
        {currentRecipes.length === 0 && !loading ? (
          <div className="col-span-full text-center text-gray-300 text-xl">
            No recipes found. Try adjusting your search or filters.
          </div>
        ) : (
          currentRecipes.map((recipe) => (
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
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-gray-700 font-semibold">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeListPage;