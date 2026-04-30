import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PERSONAS } from '../constants';
import { TrashIcon } from './icons/TrashIcon';
import { UserIcon } from './icons/UserIcon';
import { ClockIcon } from './icons/ClockIcon';

export interface ConversationRecord {
  id: string;
  personaId: string;
  timestamp: number;
}

const RECENT_CONVERSATIONS_KEY = 'recentConversations';
const MAX_RECENT_CONVERSATIONS = 20;

const getRecentConversations = (): ConversationRecord[] => {
  try {
    const stored = localStorage.getItem(RECENT_CONVERSATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentConversations = (conversations: ConversationRecord[]) => {
  localStorage.setItem(RECENT_CONVERSATIONS_KEY, JSON.stringify(conversations));
};

export const addToRecentConversations = (personaId: string) => {
  const conversations = getRecentConversations();
  const filtered = conversations.filter(c => c.personaId !== personaId);
  const newRecord: ConversationRecord = {
    id: `${personaId}-${Date.now()}`,
    personaId,
    timestamp: Date.now(),
  };
  const updated = [newRecord, ...filtered].slice(0, MAX_RECENT_CONVERSATIONS);
  saveRecentConversations(updated);
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  } else {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

const RecentConversations: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(getRecentConversations());
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveRecentConversations(updated);
  }, [conversations]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Recent
        </h2>
      </div>

      <div className="flex-grow overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
            No recent conversations
          </div>
        ) : (
          <ul className="py-2">
            {conversations.map((conv) => {
              const persona = PERSONAS.find(p => p.id === conv.personaId);
              if (!persona) return null;

              return (
                <li
                  key={conv.id}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <ReactRouterDOM.Link
                    to={`/simulation/${conv.personaId}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-grow">
                      <img
                        src={`https://picsum.photos/seed/${persona.imageSeed}/40/40`}
                        alt={persona.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-grow">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                          {persona.name}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(conv.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center`}
                      aria-label={`Delete conversation with ${persona.name}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </ReactRouterDOM.Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="User profile"
        >
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">Guest User</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">View profile</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RecentConversations;
