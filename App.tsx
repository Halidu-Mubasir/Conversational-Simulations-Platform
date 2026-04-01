
import React, { useState, useEffect, lazy, Suspense } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { APP_TITLE } from './constants';
import { SunIcon, MoonIcon } from './components/icons/ThemeIcons';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const DashboardPage = lazy(() => import('./components/DashboardPage'));
const SimulationPage = lazy(() => import('./components/SimulationPage'));

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
    <ReactRouterDOM.HashRouter>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:ring-2 focus:ring-primary-500"
      >
        Skip to main content
      </a>

      <header className="bg-white dark:bg-neutral-800 shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <ReactRouterDOM.Link
            to="/"
            className="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1"
            aria-label="Go to homepage"
          >
            {APP_TITLE}
          </ReactRouterDOM.Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-neutral-600" />}
          </button>
        </nav>
      </header>
      
      <main id="main-content" className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/" element={<DashboardPage />} />
              <ReactRouterDOM.Route path="/simulation/:personaId" element={<SimulationPage />} />
            </ReactRouterDOM.Routes>
          </Suspense>
        </ErrorBoundary>
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
