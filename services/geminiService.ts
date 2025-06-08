
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { API_KEY_ERROR_MESSAGE, GEMINI_MODEL_TEXT } from '../constants';

// Ensure API_KEY is available
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error(API_KEY_ERROR_MESSAGE);
  // Throw an error or handle this appropriately in your app startup
  // For this example, we'll let functions fail if API_KEY is missing
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface ChatSession {
  geminiChat: Chat;
  history: Content[];
}

export const initializeChatSession = async (systemInstruction: string): Promise<ChatSession> => {
  if (!ai) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  
  const chat = ai.chats.create({
    model: GEMINI_MODEL_TEXT,
    config: {
      systemInstruction: systemInstruction,
    },
    history: [] // Start with empty history, system instruction handles persona.
  });

  return { geminiChat: chat, history: [] };
};

export const sendChatMessage = async (
  session: ChatSession,
  message: string,
  streamHandler: (chunkText: string, isFinal: boolean) => void
): Promise<void> => {
  if (!ai) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  if (!session || !session.geminiChat) {
    throw new Error("Chat session not initialized.");
  }

  try {
    const result = await session.geminiChat.sendMessageStream({ message });
    let accumulatedText = "";
    for await (const chunk of result) { // chunk is GenerateContentResponse
      const chunkText = chunk.text;
      if (chunkText) {
        accumulatedText += chunkText;
        streamHandler(chunkText, false); // Stream out partial text
      }
    }
    // After loop, call handler with full text and isFinal=true
    // This might be redundant if the last chunk already covers everything.
    // The main idea is to signal completion.
    // The current streamHandler logic handles accumulation, so a final true signal might be enough
    // For now, the streamHandler handles accumulation and new message creation,
    // so we just need to signal completion.
    streamHandler("", true); // Signal completion of stream

    // Update history (optional, as Gemini Chat object maintains it internally)
    // session.history.push({ role: "user", parts: [{ text: message }] });
    // session.history.push({ role: "model", parts: [{ text: accumulatedText }] });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message && error.message.includes('API key not valid')) {
         throw new Error(`Invalid API Key: ${API_KEY_ERROR_MESSAGE}`);
    }
    throw new Error(`Failed to send message to Gemini: ${error.message}`);
  }
};
