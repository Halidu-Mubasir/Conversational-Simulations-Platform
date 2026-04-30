
import React from 'react';

type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface BadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ difficulty, className = '' }) => {
  const colorClasses: Record<DifficultyLevel, string> = {
    Easy: 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100',
    Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100',
    Hard: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100',
  };

  return (
    <span 
      className={`
        inline-block px-2 py-1 text-xs font-semibold rounded-full
        ${colorClasses[difficulty]}
        ${className}
      `}
    >
      {difficulty}
    </span>
  );
};

export default Badge;
