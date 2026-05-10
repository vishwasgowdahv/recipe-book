import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import recipeService from '../services/recipeService';
import type { IFrontendRecipe } from '../interfaces/recipe';
import HomePageBanner from '../assets/HomePageBanner.jpeg';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowLeftIcon, ArrowRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="absolute top-1/2 left-4 z-10 cursor-pointer p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
    onClick={onClick}
  >
    <ArrowLeftIcon className="h-6 w-6" />
  </div>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className="absolute top-1/2 right-4 z-10 cursor-pointer p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
    onClick={onClick}
  >
    <ArrowRightIcon className="h-6 w-6" />
  </div>
);

const HomePage: React.FC = () => {
  const [recipes, setRecipes] = useState<IFrontendRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedRecipes = async () => {
      try {
        const fetchedRecipes = await recipeService.getFeaturedRecipes();
        setRecipes(fetchedRecipes);
      } catch (err) {
        setError('Failed to fetch recipes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedRecipes();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 text-xl font-[Poppins] bg-neutral-50">
        👨‍🍳 Yum recipes await thee...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-xl font-[Poppins] bg-neutral-50">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full font-[Poppins] min-h-screen bg-neutral-50">
      <div className="w-full relative">
        <img
          src={HomePageBanner}
          alt="Food banner"
          className="w-full h-[30rem] md:h-[55rem] object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="font-bold text-gray-600 text-2xl md:text-4xl font-[Poppins] drop-shadow-md p-4 mt-24 lg:mb-32 leading-relaxed tracking-wide">
            Your ultimate guide to recipes,<br /> meal planning, and culinary inspiration.
          </p>
          <Link to="/recipes">
            <button className="mt-8 px-8 py-4 text-lg md:text-xl font-bold bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105">
              Explore Recipes
            </button>
          </Link>
        </div>
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[12rem]">
            <CalendarDaysIcon className="h-12 w-12 text-orange-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Meal Planning
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Schedule your meals and avoid decision fatigue.
            </p>
            <Link to="/meal-planner" className="mt-auto">
              <button className="px-6 py-2 text-md font-bold text-orange-500 border-2 border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300">
                Start
              </button>
            </Link>
          </div>
          <div className="group flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[12rem]">
            <MagnifyingGlassIcon className="h-12 w-12 text-orange-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Pantry Search
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Find recipes with what you have on hand.
            </p>
            <Link to="/pantry-search" className="mt-auto">
              <button className="px-6 py-2 text-md font-bold text-orange-500 border-2 border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300">
                Search
              </button>
            </Link>
          </div>
          <div className="group flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-h-[12rem]">
            <PlusIcon className="h-12 w-12 text-orange-500 mb-4 transition-transform duration-300 group-hover:scale-110" />
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Add a Recipe
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Share your culinary creations with the world.
            </p>
            <Link to="/add-recipe" className="mt-auto">
              <button className="px-6 py-2 text-md font-bold text-orange-500 border-2 border-orange-500 rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-300">
                Add New
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full mb-16 px-4">
        {recipes.length > 0 ? (
          <Slider {...sliderSettings}>
            {recipes.map((recipe) => (
              <div key={recipe.id} className="px-4">
                <Link to={`/recipes/${recipe.id}`}>
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-80 object-cover rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-110"
                  />
                </Link>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-center text-lg">No recipes found. Be the first to add one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;