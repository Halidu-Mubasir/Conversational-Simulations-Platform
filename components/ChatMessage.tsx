
import React from 'react';
import { ChatMessageContent, ChatRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon'; // Generic bot icon

interface ChatMessageProps {
  message: ChatMessageContent;
  personaName: string;
  personaImageSeed: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, personaName, personaImageSeed }) => {
  const isUser = message.role === ChatRole.USER;
  const isSystem = message.role === ChatRole.SYSTEM;

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
    <div className={`flex items-end space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img 
          src={`https://picsum.photos/seed/${personaImageSeed}/40/40`} 
          alt={personaName} 
          className="w-8 h-8 rounded-full object-cover self-start"
        />
      )}
      <div 
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-xl shadow ${
          isUser 
            ? 'bg-primary-500 text-white rounded-br-none' 
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUser && (
         <UserIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-500 self-start" />
      )}
    </div>
  );
};

export default ChatMessage;
