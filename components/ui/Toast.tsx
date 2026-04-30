
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-800 px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
        {message}
      </div>
    </div>
  );
};

export default Toast;
