import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import recipeService from '../services/recipeService';
import { getMealPlanForWeek, saveMealPlan } from '../services/mealPlannerService';
import type { IFrontendRecipe } from '../interfaces/recipe';
import type { MealPlan } from '../services/mealPlannerService';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const meals = ['Breakfast', 'Lunch', 'Dinner'];

const getWeekStart = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const MealPlannerPage: React.FC = () => {
  const { user, authToken, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [recipes, setRecipes] = useState<IFrontendRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<IFrontendRecipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mobileDayIndex, setMobileDayIndex] = useState(new Date().getDay());

  const currentDayIndex = new Date().getDay();

  useEffect(() => {
    if (user && authToken) {
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const fetchedRecipes = await recipeService.getRecipesByUser(user.id, authToken);
          setRecipes(fetchedRecipes);
          setFilteredRecipes(fetchedRecipes);
          
          const weekStartISO = currentDate.toISOString().split('T')[0];
          const fetchedMealPlan = await getMealPlanForWeek(weekStartISO, authToken);
          
          const enrichedMealPlan: MealPlan = {};
          
          for (const dateKey in fetchedMealPlan) {
            if (Object.prototype.hasOwnProperty.call(fetchedMealPlan, dateKey)) {
              enrichedMealPlan[dateKey] = {};
              for (const mealType in fetchedMealPlan[dateKey]) {
                if (Object.prototype.hasOwnProperty.call(fetchedMealPlan[dateKey], mealType)) {
                  const entry = fetchedMealPlan[dateKey][mealType];
                  if (entry) {
                    const recipe = fetchedRecipes.find(r => r.id === entry.recipeId);
                    enrichedMealPlan[dateKey][mealType] = {
                      recipeId: entry.recipeId,
                      recipeTitle: recipe ? recipe.title : 'Recipe not found',
                    };
                  }
                }
              }
            }
          }
          
          setMealPlan(enrichedMealPlan);
        } catch (err) {
          setError('Failed to fetch data.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [user, authToken, currentDate]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    setFilteredRecipes(
      recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [searchTerm, recipes]);

  const addRecipeToPlan = (recipe: IFrontendRecipe, date: string, meal: string) => {
    setMealPlan(prevPlan => ({
      ...prevPlan,
      [date]: {
        ...(prevPlan[date] || {}),
        [meal]: { recipeId: recipe.id, recipeTitle: recipe.title },
      },
    }));
  };

  const removeRecipeFromPlan = (date: string, meal: string) => {
    setMealPlan(prevPlan => {
      const newDayPlan = { ...prevPlan[date] };
      delete newDayPlan[meal];
      return {
        ...prevPlan,
        [date]: newDayPlan,
      };
    });
  };

  const handleSavePlan = async () => {
    if (!authToken) return;
    setIsSaving(true);
    setError(null);
    try {
      const weekStartISO = currentDate.toISOString().split('T')[0];
      await saveMealPlan(weekStartISO, mealPlan, authToken);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save meal plan.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeekDates = () => {
    const weekDates = [];
    const date = new Date(currentDate);
    for (let i = 0; i < 7; i++) {
      weekDates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const mobileCurrentDay = weekDates[mobileDayIndex];
  const mobileDateKey = mobileCurrentDay.toISOString().split('T')[0];

  if (authLoading || isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 flex flex-col items-center justify-center text-red-500 text-xl font-[Poppins] bg-neutral-50">
        <p>You must be logged in to use the meal planner.</p>
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
    <div className="min-h-screen px-4 py-8 font-[Poppins] bg-neutral-50 text-gray-800">
      <div className="mx-auto xl:px-8">
        <h1 className="text-4xl font-semibold text-center mb-8">Meal Planner</h1>
        
        {!isEditing && (
          <p className="text-center text-md font-medium text-gray-600 mb-6">
            Click Edit Plan to get started! Select a recipe from the list and then click on a day to add it to your plan.
          </p>
        )}

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
             {/* Week navigation and control buttons - Desktop View */}
            <div className="hidden lg:flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const previousWeek = new Date(currentDate);
                    previousWeek.setDate(previousWeek.getDate() - 7);
                    setCurrentDate(previousWeek);
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200"
                >
                  <ChevronLeftIcon className="h-6 w-6 stroke-orange-600" />
                </button>
                <div className="text-xl font-semibold">
                  {formattedDate(weekDates[0])} - {formattedDate(weekDates[6])}
                </div>
                <button
                  onClick={() => {
                    const nextWeek = new Date(currentDate);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setCurrentDate(nextWeek);
                  }}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200"
                >
                  <ChevronRightIcon className="h-6 w-6 stroke-orange-600" />
                </button>
              </div>
            </div>

            {/* Weekly Grid - Desktop View */}
            <div className="hidden lg:grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] gap-2 text-center w-full">
              <div className="p-4 bg-gray-100 rounded-lg font-semibold flex flex-col justify-center items-center h-20">Meal</div>
              
              {days.map((day, index) => (
                <div
                  key={day}
                  className={`p-4 rounded-lg font-semibold flex flex-col justify-center items-center h-20 ${index === currentDayIndex ? 'bg-orange-100' : 'bg-gray-100'}`}
                >
                  <div>{day}</div>
                  <div className="text-sm text-gray-500">{formattedDate(weekDates[index])}</div>
                </div>
              ))}

              {meals.map(meal => (
                <React.Fragment key={meal}>
                  <div className="p-4 bg-gray-100 rounded-lg font-semibold flex items-center justify-center h-40">{meal}</div>
                  
                  {weekDates.map((date, index) => {
                    const dateKey = date.toISOString().split('T')[0];
                    const entry = mealPlan[dateKey]?.[meal];
                    
                    const mealSlotClasses = `p-2 rounded-lg h-40 flex flex-col items-center justify-center transition duration-200 ${
                      entry ? 'border-2 border-solid border-orange-500' : 'border-2 border-dashed border-gray-300'
                    } ${isEditing ? 'cursor-pointer' : ''} ${index === currentDayIndex ? 'bg-orange-100' : ''}`;

                    return (
                      <div
                        key={`${dateKey}-${meal}`}
                        className={mealSlotClasses}
                        onClick={() => {
                          if (isEditing && selectedRecipeId) {
                            const recipeToAdd = recipes.find(r => r.id === selectedRecipeId);
                            if (recipeToAdd) {
                              addRecipeToPlan(recipeToAdd, dateKey, meal);
                            }
                          }
                        }}
                      >
                        {entry ? (
                          <div className="flex flex-col items-center justify-center w-full">
                            <span className="text-gray-700 font-medium text-sm text-center line-clamp-3">
                              {entry.recipeTitle}
                            </span>
                            {isEditing && (
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeRecipeFromPlan(dateKey, meal);
                                    setSelectedRecipeId(null);
                                }}
                                className="mt-2 text-xs text-red-500 hover:text-red-700 transition duration-200"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ) : isEditing ? (
                          <span className="text-gray-400 text-sm">
                            {selectedRecipeId ? 'Click to add' : 'Select a recipe'}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile View - Single Day */}
            <div className="lg:hidden">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setMobileDayIndex(Math.max(0, mobileDayIndex - 1))}
                  disabled={mobileDayIndex === 0}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-6 w-6 stroke-orange-600" />
                </button>
                <div className="text-xl font-semibold text-center">
                  <div>{days[mobileDayIndex]}</div>
                  <div className="text-sm text-gray-500">{formattedDate(weekDates[mobileDayIndex])}</div>
                </div>
                <button
                  onClick={() => setMobileDayIndex(Math.min(6, mobileDayIndex + 1))}
                  disabled={mobileDayIndex === 6}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-6 w-6 stroke-orange-600" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {meals.map(meal => {
                  const entry = mealPlan[mobileDateKey]?.[meal];
                  const mealSlotClasses = `p-4 rounded-lg flex flex-col items-center justify-center transition duration-200 ${
                    entry ? 'border-2 border-solid border-orange-500' : 'border-2 border-dashed border-gray-300'
                  } ${isEditing ? 'cursor-pointer' : ''} ${mobileDayIndex === currentDayIndex ? 'bg-orange-100' : 'bg-white'}`;
                  
                  return (
                    <div
                      key={`${mobileDateKey}-${meal}`}
                      className={mealSlotClasses}
                      onClick={() => {
                        if (isEditing && selectedRecipeId) {
                          const recipeToAdd = recipes.find(r => r.id === selectedRecipeId);
                          if (recipeToAdd) {
                            addRecipeToPlan(recipeToAdd, mobileDateKey, meal);
                          }
                        }
                      }}
                    >
                      <div className="font-semibold text-center text-lg mb-2">{meal}</div>
                      {entry ? (
                        <div className="flex flex-col items-center justify-center w-full">
                          <span className="text-gray-700 font-medium text-sm text-center line-clamp-3">
                            {entry.recipeTitle}
                          </span>
                          {isEditing && (
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  removeRecipeFromPlan(mobileDateKey, meal);
                                  setSelectedRecipeId(null);
                              }}
                              className="mt-2 text-xs text-red-500 hover:text-red-700 transition duration-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ) : isEditing ? (
                        <span className="text-gray-400 text-sm">
                          {selectedRecipeId ? 'Click to add' : 'Select a recipe'}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No recipe added</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:w-1/4">
            <div className="flex items-center justify-end space-x-2 mb-4">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="py-2 px-6 rounded-full font-semibold transition duration-300 bg-gray-200 hover:bg-gray-400 text-gray-800"
                  >
                    Edit Plan
                  </button>
                )}
                <button
                  onClick={handleSavePlan}
                  disabled={isSaving || !isEditing}
                  className={`py-2 px-6 rounded-full text-white font-semibold transition duration-300 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {isSaving ? 'Saving...' : 'Save Plan'}
                </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-xl h-fit sticky top-8">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredRecipes.length > 0 ? (
              <ul className="space-y-2 overflow-y-auto max-h-[31rem] pr-2">
                {filteredRecipes.map(recipe => (
                  <li
                    key={recipe.id}
                    className={`p-3 rounded-md cursor-pointer transition duration-150 ${selectedRecipeId === recipe.id ? 'bg-orange-100 border-2 border-orange-500' : 'bg-gray-100 hover:bg-gray-200'} ${!isEditing ? 'cursor-not-allowed' : ''}`}
                    onClick={() => isEditing && setSelectedRecipeId(recipe.id)}
                  >
                    <span className="font-medium text-gray-700">{recipe.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recipes found. <br /> <a href="/add-recipe" className="text-orange-500 hover:underline">Add one now!</a></p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerPage;