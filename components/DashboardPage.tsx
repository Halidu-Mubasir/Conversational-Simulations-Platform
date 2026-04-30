
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PERSONAS } from '../constants';
import PersonaCard from './PersonaCard';
import { SparklesIcon } from './icons/SparklesIcon';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { StarIcon } from './icons/StarIcon';
import { Persona } from '../types';
import { useDebounce } from '../hooks/useDebounce';

const FAVORITES_KEY = 'simulation-favorites';

const DashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  const toggleFavorite = useCallback((personaId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(personaId)) {
        next.delete(personaId);
      } else {
        next.add(personaId);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(PERSONAS.map(p => p.category));
    return Array.from(categories).sort();
  }, []);

  const difficultyLevels: Persona['difficulty'][] = ['Easy', 'Medium', 'Hard'];

  const filteredPersonas = useMemo(() => {
    return PERSONAS.filter(persona => {
      const matchesSearchTerm = debouncedSearchTerm.toLowerCase() === '' ||
        persona.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        persona.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        persona.scenario.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        persona.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesDifficulty = selectedDifficulty === '' || persona.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === '' || persona.category === selectedCategory;
      const matchesFavorite = !showFavoritesOnly || favorites.has(persona.id);

      return matchesSearchTerm && matchesDifficulty && matchesCategory && matchesFavorite;
    });
  }, [debouncedSearchTerm, selectedDifficulty, selectedCategory, showFavoritesOnly, favorites]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDifficulty(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setShowFavoritesOnly(false);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center justify-center space-x-2">
          <SparklesIcon className="w-8 h-8 text-primary-500" aria-hidden="true" />
          <span>Choose Your Simulation</span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Select a persona to begin a conversational simulation. Practice your skills, explore ideas, or engage in unique training scenarios.
        </p>
      </div>

      <section aria-label="Search and filter controls">
        <div className="bg-neutral-100 dark:bg-neutral-900 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-0 sm:flex sm:space-x-4 items-end">
            <div className="flex-grow">
              <label htmlFor="search-persona" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Search Personas
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search-persona"
                  id="search-persona"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search by name, topic, category..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="sm:w-auto min-w-[150px]">
              <label htmlFor="difficulty-filter" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Difficulty
              </label>
              <select
                id="difficulty-filter"
                name="difficulty-filter"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-10 py-2.5 text-base border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
              >
                <option value="">All Levels</option>
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="sm:w-auto min-w-[200px]">
              <label htmlFor="category-filter" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                name="category-filter"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-10 py-2.5 text-base border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                showFavoritesOnly
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
            >
              <StarIcon className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favorites.size > 0 && (
                <span className={`text-xs ${showFavoritesOnly ? 'text-white/80' : 'text-neutral-500'}`}>
                  ({favorites.size})
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
      
      {filteredPersonas.length > 0 ? (
        <section aria-label="Available simulations">
          <h2 className="sr-only">Available Simulations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {filteredPersonas.map(persona => (
              <PersonaCard 
                key={persona.id} 
                persona={persona} 
                isFavorite={favorites.has(persona.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="text-center py-12">
          <FilterIcon className="mx-auto h-12 w-12 text-neutral-400" aria-hidden="true" />
          <h3 className="mt-2 text-lg font-medium text-neutral-800 dark:text-neutral-100">No simulations match your criteria</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {showFavoritesOnly ? 'You have no favorite simulations yet.' : 'Try adjusting your search or filter selections.'}
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 min-h-[44px]"
            aria-label="Clear all filters"
          >
            <RefreshIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
