import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PERSONAS } from '../constants';
import { Persona } from '../types';
import PersonaCard from './PersonaCard';
import { SearchIcon } from './icons/SearchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { StarIcon } from './icons/StarIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const cats = Array.from(new Set(PERSONAS.map(p => p.category))).sort();
    return cats;
  }, []);

  const favorites = useMemo(() => {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getPersonasByCategory = (category: string): Persona[] => {
    return PERSONAS.filter(p => p.category === category && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredPersonas = useMemo(() => {
    return PERSONAS.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || favorites.includes(p.id);
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [searchTerm, selectedCategory, showFavoritesOnly, favorites]);

  const getCategoryCount = (category: string): number => {
    const filtered = showFavoritesOnly
      ? getPersonasByCategory(category).filter(p => favorites.includes(p.id))
      : getPersonasByCategory(category);
    return filtered.length;
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back</h1>
        <p className="text-primary-100 text-lg">Explore conversations with historical icons</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search personas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              showFavoritesOnly
                ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <StarIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Favorites</span>
            {favorites.length > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {showFavoritesOnly && favorites.length === 0 && (
        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <StarIcon className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            No favorites yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Star personas you like to see them here
          </p>
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse All Personas
          </button>
        </div>
      )}

      {showFavoritesOnly && favorites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Your Favorites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPersonas
              .filter(p => favorites.includes(p.id))
              .map(persona => (
                <PersonaCard key={persona.id} persona={persona} />
              ))}
          </div>
        </div>
      )}

      {!showFavoritesOnly && (
        <>
          {selectedCategory ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedCategory}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPersonas.map(persona => (
                  <PersonaCard key={persona.id} persona={persona} />
                ))}
              </div>
              {filteredPersonas.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">No personas found in this category</p>
                </div>
              )}
            </div>
          ) : (
            categories.map(category => {
              const categoryPersonas = getPersonasByCategory(category);
              const isExpanded = expandedCategories.has(category);
              
              return (
                <div key={category} className="space-y-4">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 group"
                  >
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {category}
                    </h2>
                    <ChevronDownIcon className={`w-5 h-5 text-neutral-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      ({getCategoryCount(category)})
                    </span>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px]' : 'max-h-[320px]'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryPersonas.map(persona => (
                        <PersonaCard key={persona.id} persona={persona} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
