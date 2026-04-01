import React, { useState } from 'react';
import { ChatMessageContent, ChatRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CopyIcon';
import Toast from './ui/Toast';

interface ChatMessageProps {
  message: ChatMessageContent;
  personaName: string;
  personaImageSeed: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, personaName, personaImageSeed }) => {
  const isUser = message.role === ChatRole.USER;
  const isSystem = message.role === ChatRole.SYSTEM;
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSystem) {
    return (
      <div className="text-center my-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 italic px-4 py-1 bg-neutral-100 dark:bg-neutral-700 rounded-full inline-block">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <>
      <Toast message="Copied to clipboard!" visible={showToast} onClose={() => setShowToast(false)} />
      <div className={`flex items-end space-x-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
        {!isUser && (
          <img 
            src={`https://picsum.photos/seed/${personaImageSeed}/40/40`} 
            alt={personaName} 
            className="w-8 h-8 rounded-full object-cover self-start"
          />
        )}
        <div className="relative">
          <div 
            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow ${
              isUser 
                ? 'bg-primary-500 text-white rounded-br-none' 
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`absolute top-1 ${isUser ? 'left-0 -translate-x-full ml-1' : 'right-0 translate-x-full -mr-1'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600`}
            aria-label="Copy message"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            )}
          </button>
          {message.timestamp && (
            <span 
              className={`absolute ${isUser ? 'right-0' : 'left-0'} -bottom-5 text-[10px] text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            >
              {formatTime(new Date(message.timestamp))}
            </span>
          )}
        </div>
        {isUser && (
          <UserIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-500 self-start" />
        )}
      </div>
    </>
  );
};

export default ChatMessage;
