import React from 'react';

interface RecipeCardProps {
  id: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  time: string;
  servings: string;
  ratingCount: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ image, title, author, rating, time, servings, ratingCount }) => {
  console.log(title, author)
  return (
    <div className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer relative w-full">
      <img src={image} alt={title} className="w-120 h-100 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      
      <div className="absolute bottom-0 p-4 w-full text-white flex flex-col justify-end">
        <h3 className="text-2xl font-bold line-clamp-2 drop-shadow-lg">{title}</h3>
       
        <div className="flex items-center text-sm pt-2 space-x-4">
          <div className="flex items-center">
            <span className="text-yellow-400 text-base">★</span>
            <span className="ml-1 font-medium drop-shadow-lg">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-200 ml-1 drop-shadow-lg">({ratingCount})</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-200 drop-shadow-lg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.25a.75.75 0 00-1.5 0v4.25h-3a.75.75 0 000 1.5h3.75a.75.75 0 00.75-.75V5.75z" clipRule="evenodd" />
            </svg>
            <span className="ml-1 text-gray-200 drop-shadow-lg">{time}</span>
          </div>
          <div className="flex items-center">
            <span role="img" aria-label="user" className="text-gray-200 mr-1 drop-shadow-lg">🍽️</span>
            <span className="text-gray-200 drop-shadow-lg">{servings}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;