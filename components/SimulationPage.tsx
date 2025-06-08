import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Changed import to namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { Persona, ChatMessageContent, ChatRole } from '../types';
import { PERSONAS, API_KEY_ERROR_MESSAGE, GEMINI_MODEL_TEXT } from '../constants';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
import { sendChatMessage, initializeChatSession, ChatSession } from '../services/geminiService';
import { UserIcon } from './icons/UserIcon';
// import { BotIcon } from './icons/BotIcon'; // Not directly used in this component after sidebar change
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon'; // For goal highlighting

const SimulationPage: React.FC = () => {
  const { personaId } = ReactRouterDOM.useParams<{ personaId: string }>();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessageContent[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const initChat = useCallback(async (persona: Persona) => {
    setIsLoading(true);
    setError(null);
    setMessages([]); // Clear previous messages
    try {
      const systemPrompt = persona.systemInstruction || 
        `You are ${persona.name}, ${persona.description}. Your goal is to help the user through the scenario: "${persona.scenario}".
         Your tone should be ${persona.tone}. Never break character.
         The user's success in this scenario might involve achieving: ${persona.goals.join(', ')}.
         Keep your responses concise and engaging for a chat simulation. Do not refer to yourself as an AI or language model. Fully embody ${persona.name}.`;
      
      const initialSystemMessage: ChatMessageContent = {
        id: `system-init-${Date.now()}`,
        role: ChatRole.SYSTEM,
        text: `Connecting with ${persona.name}... Scenario: ${persona.scenario}. Focus on achieving your goals.`,
        timestamp: new Date(),
      };
      setMessages([initialSystemMessage]);

      const session = await initializeChatSession(systemPrompt);
      setChatSession(session);
      
      // Send an initial greeting from the persona if desired
      // This can be triggered by a specific prompt or be part of the system instruction's expected behavior.
      // For now, let's ensure the system message indicates readiness.
      // const greeting = "Hello! I am ready to begin our discussion." // Example fixed greeting
      // if (greeting) {
      //    setMessages(prev => [...prev, { id: `model-greeting-${Date.now()}`, role: ChatRole.MODEL, text: greeting, timestamp: new Date() }]);
      // }


    } catch (e: any) {
      console.error("Initialization error:", e);
      const errorMessage = e.message.includes('API_KEY') ? API_KEY_ERROR_MESSAGE : `Failed to initialize chat: ${e.message}`;
      setError(errorMessage);
      setMessages(prev => [...prev, {id: `error-init-${Date.now()}`, role: ChatRole.SYSTEM, text: errorMessage, timestamp: new Date()}]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const persona = PERSONAS.find(p => p.id === personaId);
    if (persona) {
      setCurrentPersona(persona);
      initChat(persona);
    } else {
      setError("Persona not found.");
    }
  }, [personaId, initChat]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !chatSession || !currentPersona) return;

    const userMessage: ChatMessageContent = {
      id: `user-${Date.now()}`,
      role: ChatRole.USER,
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      let fullModelResponse = "";
      const streamHandler = (chunkText: string, isFinal: boolean) => {
        fullModelResponse += chunkText;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          // If the last message was from the user or system, start a new model message
          if (lastMessage.role !== ChatRole.MODEL || isFinal /* This condition needs re-evaluation for proper final update */) {
            // If it's a new model message or the stream is just starting for this response.
            if (prev.find(m => m.id === `model-stream-${userMessage.id.replace('user-','').substring(0,10)}`)) { // Check if we are appending
                 return prev.map(m => 
                    m.id === `model-stream-${userMessage.id.replace('user-','').substring(0,10)}` 
                    ? {...m, text: m.text + chunkText, timestamp: new Date()} 
                    : m
                );
            }
            // Create new message for model
            return [...prev, { 
                id: `model-stream-${userMessage.id.replace('user-','').substring(0,10)}`, // semi-stable ID for streaming
                role: ChatRole.MODEL, 
                text: chunkText, 
                timestamp: new Date() 
            }];

          } else { // Append to existing model message
            return prev.map(m => 
                m.id === lastMessage.id 
                ? {...m, text: m.text + chunkText } 
                : m
            );
          }
        });

        if (isFinal) {
          setIsLoading(false);
          // Optional: Finalize the message ID or content if needed
           setMessages(prev => prev.map(m => 
            m.id === `model-stream-${userMessage.id.replace('user-','').substring(0,10)}` 
            ? {...m, id: `model-${Date.now()}-final`, text: fullModelResponse } // Finalize ID and ensure full text
            : m
          ));
        }
      };
      
      await sendChatMessage(chatSession, userMessage.text, streamHandler);
      
    } catch (e: any) {
      console.error("Send message error:", e);
      const errorMessage = e.message.includes('API_KEY') ? API_KEY_ERROR_MESSAGE : `Error: ${e.message}`;
      setError(errorMessage);
      setMessages(prev => [...prev, {id: `error-send-${Date.now()}`, role: ChatRole.SYSTEM, text: errorMessage, timestamp: new Date()}]);
      setIsLoading(false);
    }
  };
  
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
        <p className="text-xl text-red-500 dark:text-red-400 mb-4">{error}</p>
        <ReactRouterDOM.Link to="/" className="mt-4 inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded transition-colors">
          Back to Dashboard
        </ReactRouterDOM.Link>
      </div>
    );
  }
  
  if (!currentPersona) {
    return <div className="text-center py-10 p-4"><p className="text-neutral-600 dark:text-neutral-300">Persona could not be loaded.</p></div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] max-w-7xl mx-auto bg-white dark:bg-neutral-800 shadow-2xl rounded-lg overflow-hidden">
      {/* Sidebar: Persona Info & Goals */}
      <aside className="w-full md:w-1/3 lg:w-1/4 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto bg-neutral-50 dark:bg-neutral-850">
        <div className="sticky top-0 py-2"> {/* Optional: make content sticky if sidebar itself scrolls */}
          <ReactRouterDOM.Link to="/" className="md:hidden mb-4 inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to Dashboard
          </ReactRouterDOM.Link>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img 
              src={`https://picsum.photos/seed/${currentPersona.imageSeed}/120/120`} 
              alt={currentPersona.name} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mb-4 shadow-md" 
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
              <SparklesIcon className="w-5 h-5 mr-2 text-primary-500" />
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

      {/* Main Chat Area */}
      <main className="flex flex-col flex-grow w-full md:w-2/3 lg:w-3/4">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center space-x-3 bg-white dark:bg-neutral-800">
          <ReactRouterDOM.Link to="/" className="hidden md:inline-block p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" aria-label="Back to dashboard">
            <ChevronLeftIcon className="w-6 h-6" />
          </ReactRouterDOM.Link>
           {/* Minimal header, main info is in sidebar now */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 md:hidden">{currentPersona.name}</h2> 
            <p className="text-xs text-neutral-500 dark:text-neutral-400 md:hidden truncate">{currentPersona.scenario}</p>
             <p className="text-md font-medium text-neutral-700 dark:text-neutral-300 hidden md:block">Conversation with {currentPersona.name}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-3 sm:p-4 space-y-4 overflow-y-auto bg-neutral-100 dark:bg-neutral-900">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} personaName={currentPersona.name} personaImageSeed={currentPersona.imageSeed} />
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1]?.role === ChatRole.USER && (
            <div className="flex items-center space-x-2 justify-start">
               <img src={`https://picsum.photos/seed/${currentPersona.imageSeed}/40/40`} alt={currentPersona.name} className="w-8 h-8 rounded-full" />
              <div className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
          {error && !error.includes(API_KEY_ERROR_MESSAGE) && <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>}
          {error && error.includes(API_KEY_ERROR_MESSAGE) && 
            <p className="text-red-500 dark:text-red-400 text-sm mb-2 p-2 border border-red-500 bg-red-50 dark:bg-red-900/50 rounded">
              {API_KEY_ERROR_MESSAGE} The application cannot function without a valid API key.
            </p>
          }
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={chatSession ? `Message ${currentPersona.name}...` : "Initializing chat..."}
              className="flex-grow p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 disabled:opacity-50 transition-colors"
              disabled={isLoading || !chatSession || (!!error && error.includes(API_KEY_ERROR_MESSAGE))}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !chatSession || (!!error && error.includes(API_KEY_ERROR_MESSAGE))}
              className="px-4 sm:px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SimulationPage;
