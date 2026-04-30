
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error,
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 border rounded-lg 
          bg-white dark:bg-neutral-700 
          text-neutral-800 dark:text-neutral-100 
          placeholder-neutral-400 dark:placeholder-neutral-500
          focus:ring-2 focus:ring-primary-500 focus:border-transparent 
          outline-none transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-neutral-300 dark:border-neutral-600'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
