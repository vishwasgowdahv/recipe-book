import React, { useState, useMemo } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, maxStars = 5 }) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const roundedValue = Math.round(value * 2) / 2;
  const displayRating = hoverRating ?? roundedValue;

  const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.565-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z";

  const stars = useMemo(() => {
    return Array.from({ length: maxStars }).map((_, i) => {
      const starValue = i + 1;
      const isFull = starValue <= displayRating;
      const isHalf = displayRating > i && displayRating < i + 1;

      return (
        <span
          key={i}
          className={`relative inline-block w-5 h-5 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          onClick={() => !readOnly && onChange && onChange(starValue)}
          onMouseEnter={() => !readOnly && setHoverRating(starValue)}
          onMouseLeave={() => !readOnly && setHoverRating(null)}
        >
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d={starPath} className={`transition-colors duration-200 ${isFull || isHalf ? 'text-yellow-500' : 'text-gray-300'}`} />
          </svg>
          {isHalf && (
            <svg
              className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={starPath} className="text-yellow-500" />
            </svg>
          )}
        </span>
      );
    });
  }, [displayRating, maxStars, onChange, readOnly]);

  return (
    <div className="flex items-center">
      {stars}
    </div>
  );
};

export default StarRating;