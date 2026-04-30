import React, { memo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Persona } from '../types';
import { StarIcon } from './icons/StarIcon';
import Badge from './ui/Badge';

interface PersonaCardProps {
  persona: Persona;
  isFavorite: boolean;
  onToggleFavorite: (personaId: string) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(persona.id);
  };

  return (
    <ReactRouterDOM.Link 
      to={`/simulation/${persona.id}`} 
      className="block bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="relative">
        <img 
          src={`https://picsum.photos/seed/${persona.imageSeed}/400/200`} 
          alt={`Portrait of ${persona.name}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <Badge difficulty={persona.difficulty} />
          <button
            onClick={handleFavoriteClick}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-800/80 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <StarIcon className={`w-5 h-5 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-neutral-400'}`} />
          </button>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-2 truncate" title={persona.name}>
          {persona.name}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 h-10 overflow-hidden text-ellipsis" title={persona.description}>
          {persona.description}
        </p>
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>{persona.estimatedLength}</span>
          <span className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Start Simulation &rarr;
          </span>
        </div>
      </div>
    </ReactRouterDOM.Link>
  );
};

export default memo(PersonaCard);
