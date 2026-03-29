import React, { useState } from 'react';

const StarRating = ({ initialScore = 0, readOnly = false, onChange }) => {
 const [hoverScore, setHoverScore] = useState(0);
 const [score, setScore] = useState(initialScore);

 const handleClick = (val) => {
 if (readOnly) return;
 setScore(val);
 if (onChange) onChange(val);
 };

 const currentScore = hoverScore || score;

 return (
 <div className="flex items-center gap-1" role="radiogroup">
 {[1, 2, 3, 4, 5].map((star) => (
 <svg
 key={star}
 onMouseEnter={() => !readOnly && setHoverScore(star)}
 onMouseLeave={() => !readOnly && setHoverScore(0)}
 onClick={() => handleClick(star)}
 className={`w-6 h-6 ${readOnly ? '' : 'cursor-pointer transition-transform hover:scale-110'} ${
 star <= currentScore ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' : 'text-gray-300 dark:text-gray-600 fill-transparent'
 }`}
 viewBox="0 0 24 24"
 stroke="currentColor"
 strokeWidth="1.5"
 strokeLinecap="round"
 strokeLinejoin="round"
 >
 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
 </svg>
 ))}
 </div>
 );
};

export default StarRating;
