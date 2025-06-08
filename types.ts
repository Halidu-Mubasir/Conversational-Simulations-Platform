
export interface Persona {
  id: string;
  name: string;
  imageSeed: string; // For picsum.photos
  description: string; // Main prompt/topic for the user
  scenario: string; // What the user is supposed to do or discuss
  tone: string;
  goals: string[]; // What the user should aim to explore/achieve
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedLength: string; // e.g., "10-15 min"
  category: string; // e.g., "Greek Philosophy", "Science", "Political Figure"
  systemInstruction?: string; // Optional specific system instruction for Gemini
}

export interface ChatMessageContent {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  id: string;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}
