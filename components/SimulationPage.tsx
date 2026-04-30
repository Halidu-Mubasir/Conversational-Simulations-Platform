import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Persona, ChatMessageContent, ChatRole } from '../types';
import { PERSONAS, API_KEY_ERROR_MESSAGE } from '../constants';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
import { sendChatMessage, initializeChatSession, ChatSession } from '../services/geminiService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { WifiOffIcon } from './icons/WifiOffIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { Bars3Icon } from './icons/Bars3Icon';
import { addToRecentConversations } from './RecentConversations';

interface MessageWithRetry extends ChatMessageContent {
  canRetry?: boolean;
  retryHandler?: () => void;
}

const SimulationPage: React.FC = () => {
  const { personaId } = ReactRouterDOM.useParams<{ personaId: string }>();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<MessageWithRetry[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingMessageRef = useRef<{ text: string; id: string } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setError('You have lost internet connection. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const toggleButton = document.getElementById('sidebar-toggle');
        if (toggleButton && !toggleButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const initChat = useCallback(async (persona: Persona) => {
    setIsLoading(true);
    setError(null);
    setMessages([]);
    try {
      const systemPrompt = persona.systemInstruction || 
        `You are ${persona.name}, ${persona.description}. Your goal is to help the user through the scenario: "${persona.scenario}".
         Your tone should be ${persona.tone}. Never break character.
         The user's success in this scenario might involve achieving: ${persona.goals.join(', ')}.
         Keep your responses concise and engaging for a chat simulation. Do not refer to yourself as an AI or language model. Fully embody ${persona.name}.`;
      
      const initialSystemMessage: MessageWithRetry = {
        id: `system-init-${Date.now()}`,
        role: ChatRole.SYSTEM,
        text: `Connecting with ${persona.name}... Scenario: ${persona.scenario}. Focus on achieving your goals.`,
        timestamp: new Date(),
      };
      setMessages([initialSystemMessage]);

      const session = await initializeChatSession(systemPrompt);
      setChatSession(session);

    } catch (e: unknown) {
      console.error("Initialization error:", e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      const displayMessage = errorMessage.includes('API_KEY') ? API_KEY_ERROR_MESSAGE : `Failed to connect: ${errorMessage}`;
      setError(displayMessage);
      setMessages(prev => [...prev, {
        id: `error-init-${Date.now()}`,
        role: ChatRole.SYSTEM,
        text: displayMessage,
        timestamp: new Date(),
        canRetry: true,
        retryHandler: () => initChat(persona)
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const persona = PERSONAS.find(p => p.id === personaId);
    if (persona) {
      setCurrentPersona(persona);
      addToRecentConversations(persona.id);
      initChat(persona);
    } else {
      setError("Persona not found.");
    }
  }, [personaId, initChat]);

  const handleRetryMessage = useCallback(async () => {
    if (!pendingMessageRef.current || !chatSession || !currentPersona) return;

    const { text, id } = pendingMessageRef.current;
    setFailedMessageId(null);
    setIsLoading(true);
    setError(null);

    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, canRetry: false } : m
    ));

    try {
      let fullModelResponse = "";
      const streamHandler = (chunkText: string, isFinal: boolean) => {
        fullModelResponse += chunkText;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role !== ChatRole.MODEL || isFinal) {
            if (prev.find(m => m.id === `model-stream-${id.replace('user-','').substring(0,10)}`)) {
              return prev.map(m => 
                m.id === `model-stream-${id.replace('user-','').substring(0,10)}` 
                ? {...m, text: m.text + chunkText, timestamp: new Date()} 
                : m
              );
            }
            return [...prev, { 
              id: `model-stream-${id.replace('user-','').substring(0,10)}`,
              role: ChatRole.MODEL, 
              text: chunkText, 
              timestamp: new Date() 
            }];
          } else {
            return prev.map(m => 
              m.id === lastMessage.id 
              ? {...m, text: m.text + chunkText } 
              : m
            );
          }
        });

        if (isFinal) {
          setIsLoading(false);
          setMessages(prev => prev.map(m => 
            m.id === `model-stream-${id.replace('user-','').substring(0,10)}` 
            ? {...m, id: `model-${Date.now()}-final`, text: fullModelResponse }
            : m
          ));
        }
      };
      
      await sendChatMessage(chatSession, text, streamHandler);
      pendingMessageRef.current = null;
      
    } catch (e: unknown) {
      console.error("Retry message error:", e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      const displayMessage = errorMessage.includes('API_KEY') ? API_KEY_ERROR_MESSAGE : `Failed to send message: ${errorMessage}`;
      setError(displayMessage);
      setFailedMessageId(id);
      setMessages(prev => [...prev, {
        id: `error-retry-${Date.now()}`,
        role: ChatRole.SYSTEM,
        text: displayMessage,
        timestamp: new Date(),
        canRetry: true,
        retryHandler: () => handleRetryMessage()
      }]);
      setIsLoading(false);
    }
  }, [chatSession, currentPersona]);

  const handleSendMessage = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !chatSession || !currentPersona) return;

    const messageText = inputValue;
    const messageId = `user-${Date.now()}`;
    
    const userMessage: MessageWithRetry = {
      id: messageId,
      role: ChatRole.USER,
      text: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setFailedMessageId(null);
    pendingMessageRef.current = { text: messageText, id: messageId };

    try {
      let fullModelResponse = "";
      const streamHandler = (chunkText: string, isFinal: boolean) => {
        fullModelResponse += chunkText;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role !== ChatRole.MODEL || isFinal) {
            if (prev.find(m => m.id === `model-stream-${messageId.replace('user-','').substring(0,10)}`)) {
              return prev.map(m => 
                m.id === `model-stream-${messageId.replace('user-','').substring(0,10)}` 
                ? {...m, text: m.text + chunkText, timestamp: new Date()} 
                : m
              );
            }
            return [...prev, { 
              id: `model-stream-${messageId.replace('user-','').substring(0,10)}`,
              role: ChatRole.MODEL, 
              text: chunkText, 
              timestamp: new Date() 
            }];
          } else {
            return prev.map(m => 
              m.id === lastMessage.id 
              ? {...m, text: m.text + chunkText } 
              : m
            );
          }
        });

        if (isFinal) {
          setIsLoading(false);
          setMessages(prev => prev.map(m => 
            m.id === `model-stream-${messageId.replace('user-','').substring(0,10)}` 
            ? {...m, id: `model-${Date.now()}-final`, text: fullModelResponse }
            : m
          ));
        }
      };
      
      await sendChatMessage(chatSession, messageText, streamHandler);
      pendingMessageRef.current = null;
      
    } catch (e: unknown) {
      console.error("Send message error:", e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      const displayMessage = errorMessage.includes('API_KEY') ? API_KEY_ERROR_MESSAGE : `Failed to send message: ${errorMessage}`;
      setError(displayMessage);
      setFailedMessageId(messageId);
      setMessages(prev => [...prev, {
        id: `error-send-${Date.now()}`,
        role: ChatRole.SYSTEM,
        text: displayMessage,
        timestamp: new Date(),
        canRetry: true,
        retryHandler: () => handleRetryMessage()
      }]);
      setIsLoading(false);
    }
  }, [inputValue, isLoading, chatSession, currentPersona, handleRetryMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  if (!currentPersona && !error && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">Loading simulation details...</p>
      </div>
    );
  }
  
  if (error && !currentPersona) {
    return (
      <div className="text-center py-10 p-4">
        <h1 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-4">Error</h1>
        <p className="text-xl text-neutral-700 dark:text-neutral-300 mb-4">{error}</p>
        <ReactRouterDOM.Link 
          to="/" 
          className="mt-4 inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
          Back to Dashboard
        </ReactRouterDOM.Link>
      </div>
    );
  }
  
  if (!currentPersona) {
    return (
      <div className="text-center py-10 p-4">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Error</h1>
        <p className="text-neutral-600 dark:text-neutral-300">Persona could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] max-w-7xl mx-auto bg-white dark:bg-neutral-800 shadow-2xl rounded-lg overflow-hidden">
      <aside 
        ref={sidebarRef}
        className={`
          fixed md:relative inset-y-0 left-0 z-30 w-4/5 max-w-xs
          transform transition-transform duration-300 ease-in-out
          md:transform-none md:w-1/3 lg:w-1/4
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          p-4 sm:p-6 border-r border-neutral-200 dark:border-neutral-700 
          overflow-y-auto bg-neutral-50 dark:bg-neutral-850
          pt-16 md:pt-4
        `}
      >
        <div className="sticky top-0 py-2">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Persona Info</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          <ReactRouterDOM.Link 
            to="/" 
            className="hidden md:flex mb-4 items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1 min-h-[44px]"
            aria-label="Back to dashboard"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" aria-hidden="true" />
            Back to Dashboard
          </ReactRouterDOM.Link>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img 
              src={`https://picsum.photos/seed/${currentPersona.imageSeed}/120/120`} 
              alt={`Portrait of ${currentPersona.name}`}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover mb-4 shadow-md"
              loading="lazy"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100">{currentPersona.name}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-3">{currentPersona.description}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-600">
            <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Scenario</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">{currentPersona.scenario}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-600">
            <h3 className="text-md font-semibold text-neutral-700 dark:text-neutral-200 mb-3 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-primary-500" aria-hidden="true" />
              Your Goals
            </h3>
            <ul className="space-y-2">
              {currentPersona.goals.map((goal, index) => (
                <li key={index} className="text-sm text-neutral-600 dark:text-neutral-300 bg-primary-50 dark:bg-primary-900/30 p-2 rounded-md">
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-xs text-neutral-400 dark:text-neutral-500">
            Difficulty: {currentPersona.difficulty} <br />
            Est. Length: {currentPersona.estimatedLength}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex flex-col flex-grow w-full md:w-2/3 lg:w-3/4">
        <header className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center space-x-2 sm:space-x-3 bg-white dark:bg-neutral-800">
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
          <ReactRouterDOM.Link 
            to="/" 
            className="hidden md:inline-block p-2 min-w-[44px] min-h-[44px] rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Back to dashboard"
          >
            <ChevronLeftIcon className="w-6 h-6" aria-hidden="true" />
          </ReactRouterDOM.Link>
          <div className="flex-grow min-w-0">
            <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 md:hidden truncate">{currentPersona.name}</h1> 
            <p className="text-xs text-neutral-500 dark:text-neutral-400 md:hidden truncate">{currentPersona.scenario}</p>
            <p className="text-md font-medium text-neutral-700 dark:text-neutral-300 hidden md:block">Conversation with {currentPersona.name}</p>
          </div>
        </header>

        {!isOnline && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 border-b border-yellow-300 dark:border-yellow-700 flex items-center" role="alert">
            <WifiOffIcon className="w-5 h-5 mr-2 text-yellow-700 dark:text-yellow-400 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">You are offline. Some features may not work.</p>
          </div>
        )}

        <section 
          className="flex-grow p-3 sm:p-4 space-y-4 overflow-y-auto bg-neutral-100 dark:bg-neutral-900"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="relative">
              <ChatMessage 
                message={msg} 
                personaName={currentPersona.name} 
                personaImageSeed={currentPersona.imageSeed} 
              />
              {msg.canRetry && (
                <button
                  onClick={msg.retryHandler}
                  className="mt-2 ml-10 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label="Retry sending message"
                >
                  <RefreshIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1]?.role === ChatRole.USER && (
            <div className="flex items-center space-x-2 justify-start">
              <img 
                src={`https://picsum.photos/seed/${currentPersona.imageSeed}/40/40`} 
                alt={`${currentPersona.name} avatar`}
                className="w-8 h-8 rounded-full"
                loading="lazy"
              />
              <div className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        <footer className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 safe-area-bottom">
          {error && !error.includes(API_KEY_ERROR_MESSAGE) && (
            <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md" role="alert">
              <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                {error}
                {failedMessageId && (
                  <button
                    onClick={handleRetryMessage}
                    className="ml-auto inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[36px]"
                    aria-label="Retry sending message"
                  >
                    <RefreshIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                    Retry
                  </button>
                )}
              </p>
            </div>
          )}
          {error && error.includes(API_KEY_ERROR_MESSAGE) && 
            <div className="mb-2 p-2 border border-red-500 bg-red-50 dark:bg-red-900/50 rounded" role="alert">
              <p className="text-red-500 dark:text-red-400 text-sm">
                {API_KEY_ERROR_MESSAGE} The application cannot function without a valid API key.
              </p>
            </div>
          }
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={chatSession && isOnline ? `Message ${currentPersona.name}...` : isOnline ? "Initializing chat..." : "Waiting for connection..."}
              className="flex-grow py-3 px-4 text-base border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 disabled:opacity-50 transition-colors min-h-[48px]"
              disabled={isLoading || !chatSession || !isOnline || (!!error && error.includes(API_KEY_ERROR_MESSAGE))}
              aria-label="Chat message input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !chatSession || !isOnline || (!!error && error.includes(API_KEY_ERROR_MESSAGE))}
              className="px-6 py-3 min-w-[48px] min-h-[48px] bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
};

export default SimulationPage;
