import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | string;
}

export function StarRating({ rating }: StarRatingProps) {
  const ratingNum =
    typeof rating === "string" ? Number.parseFloat(rating) : rating;
  const filledStars = Math.floor(ratingNum);
  const hasHalfStar = ratingNum % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < filledStars;
        const isHalf = i === filledStars && hasHalfStar;
        return (
          <Star
            key={i}
            size={14}
            className={`${
              isFilled || isHalf
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            aria-hidden="true"
          />
        );
      })}
      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
        {ratingNum.toFixed(1)}
      </span>
    </div>
  );
}
