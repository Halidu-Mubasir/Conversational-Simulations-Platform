
import React from 'react';
// Fix: Changed import to namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  const difficultyColor = 
    persona.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
    persona.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
    'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';

  return (
    // Fix: Use ReactRouterDOM.Link
    <ReactRouterDOM.Link 
      to={`/simulation/${persona.id}`} 
      className="block bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
    >
      <div className="relative">
        <img 
          src={`https://picsum.photos/seed/${persona.imageSeed}/400/200`} 
          alt={persona.name} 
          className="w-full h-48 object-cover" 
        />
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${difficultyColor}`}>
          {persona.difficulty}
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

export default PersonaCard;