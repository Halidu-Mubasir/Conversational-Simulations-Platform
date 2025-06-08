
import React, { useState, useEffect } from 'react';
// Fix: Changed import to namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import SimulationPage from './components/SimulationPage';
import { APP_TITLE } from './constants';
import { SunIcon, MoonIcon } from './components/icons/ThemeIcons'; 

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    // Fix: Use ReactRouterDOM.HashRouter
    <ReactRouterDOM.HashRouter>
      {/* The parent div with h-full and flex flex-col is now #root in index.html */}
      <header className="bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Fix: Use ReactRouterDOM.Link */}
          <ReactRouterDOM.Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity">
            {APP_TITLE}
          </ReactRouterDOM.Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-neutral-600" />}
          </button>
        </nav>
      </header>
      
      {/* flex-grow ensures this section takes available space, pushing footer down */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fix: Use ReactRouterDOM.Routes and ReactRouterDOM.Route */}
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route path="/" element={<DashboardPage />} />
          <ReactRouterDOM.Route path="/simulation/:personaId" element={<SimulationPage />} />
        </ReactRouterDOM.Routes>
      </main>

      <footer className="bg-white dark:bg-neutral-800 text-center py-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
        </p>
      </footer>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
