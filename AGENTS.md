# AGENTS.md - Conversational Simulations Platform

This file provides guidance for AI agents working in this codebase.

## Project Overview

A React-based platform for conversational AI simulations with historical figures, philosophers, and other personas. Users practice communication skills through role-play scenarios powered by Google Gemini.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Styling**: Tailwind CSS with custom color palette (primary, neutral)
- **AI**: Google Gemini API (@google/genai)
- **Routing**: react-router-dom v7 (HashRouter)
- **Build**: Vite with ESM

## Build/Lint/Test Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

**Note**: No ESLint, Prettier, or test framework is currently configured. TypeScript's built-in strict mode provides basic linting.

## TypeScript Configuration

Strict mode is enabled with additional checks:
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

## Code Style Guidelines

### File Organization

- Components: `components/` directory with subdirectories for icons (`components/icons/`)
- Services: `services/` for API integrations (e.g., `geminiService.ts`)
- Types: `types.ts` for shared interfaces
- Constants: `constants.ts` for configuration and persona data

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DashboardPage.tsx` |
| Component Props Interface | PascalCase + `Props` suffix | `PersonaCardProps` |
| Services/Helpers | camelCase | `geminiService.ts` |
| Icons | PascalCase + `Icon` suffix | `SunIcon`, `UserIcon` |
| Enums | PascalCase with UPPER values | `ChatRole.USER` |
| Types/Interfaces | PascalCase | `Persona`, `ChatMessageContent` |

### Component Patterns

```tsx
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const MyComponent: React.FC<MyProps> = ({ prop1, prop2 }) => {
  // hooks first
  // then derived state
  // then handlers
  // finally return
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### SVG Icon Pattern

```tsx
import React from 'react';

export const IconName: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="..." />
  </svg>
);
```

### TypeScript Practices

- Always use explicit types for props and state
- Use TypeScript enums for fixed sets of values (e.g., `ChatRole`)
- Use `interface` for object shapes, `type` for unions/primitives
- Avoid `any` - use `unknown` when type is truly unknown

```tsx
// Good
interface PersonaCardProps {
  persona: Persona;
}
const [isLoading, setIsLoading] = useState<boolean>(false);

// Avoid
const [state, setState] = useState<any>();
```

### Tailwind CSS Guidelines

- Use custom colors: `text-primary-500`, `bg-neutral-800`, `dark:text-neutral-100`
- Dark mode: `dark:` prefix for dark theme variants
- Responsive: `sm:`, `md:`, `lg:` prefixes for breakpoints
- Use `flex` and `grid` for layouts with Tailwind utilities
- Consistent spacing: use Tailwind's spacing scale (4px base unit)

### Imports Order

1. React core imports
2. Third-party library imports (react-router-dom, etc.)
3. Relative imports (components, services, types, constants)
4. No barrel exports (index.ts) unless necessary

```tsx
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PersonaCard from './PersonaCard';
import { Persona } from '../types';
import { PERSONAS } from '../constants';
```

### Error Handling

- Use try/catch for async operations
- Log errors with `console.error()`
- Provide user-friendly error messages in UI
- Throw descriptive errors, not generic ones

```tsx
try {
  const result = await someAsyncCall();
  // handle result
} catch (error: unknown) {
  console.error('Operation failed:', error);
  if (error instanceof Error) {
    setError(`Failed: ${error.message}`);
  }
}
```

### Environment Variables

- Store secrets in `.env` file (not committed to git)
- Access via `process.env.VARIABLE_NAME`
- Vite provides these via `loadEnv()` in `vite.config.ts`
- Required: `GEMINI_API_KEY` for AI functionality

## Project Structure

```
/
├── App.tsx                    # Root component with router and auth
├── index.tsx                  # Entry point
├── index.html                 # HTML template
├── types.ts                   # Shared TypeScript types
├── constants.ts               # Configuration and persona data
├── vite.config.ts            # Vite configuration
├── tailwind.config.js         # Tailwind theme
├── postcss.config.js          # PostCSS config
├── components/
│   ├── LandingPage.tsx        # Public landing page
│   ├── LoginPage.tsx          # Login/signup page
│   ├── HomePage.tsx          # Netflix-style category view (authenticated)
│   ├── SimulationPage.tsx     # Chat interface (authenticated)
│   ├── PersonaCard.tsx        # Persona preview card
│   ├── ChatMessage.tsx        # Chat bubble
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── RecentConversations.tsx # Left sidebar with recent chats
│   ├── ErrorBoundary.tsx      # React error boundary
│   └── icons/                # SVG icon components
├── hooks/
│   ├── useDebounce.ts        # Debounce value hook
│   └── useLocalStorage.ts    # localStorage sync hook
├── services/
│   └── geminiService.ts      # Gemini API integration
├── .env                      # Environment variables (not committed)
└── .github/workflows/         # CI/CD pipelines
```

## App Layout

The app uses authenticated/unanthenticated layouts:
- **Unauthenticated**: LandingPage or LoginPage (full width)
- **Authenticated**: Two-column layout with left sidebar (w-72) + main content

```tsx
// Authenticated layout
<div className="flex h-[calc(100vh-8rem)]">
  <aside className="w-72 flex-shrink-0 ...">
    <RecentConversations />
  </aside>
  <main className="flex-grow px-4 py-8 overflow-y-auto">
    {/* Page content */}
  </main>
</div>
```

## Authentication

- Simple localStorage-based auth (for demo purposes)
- Routes: `/` (landing), `/login`, `/home` (authenticated), `/simulation/:personaId` (authenticated)
- Use `<ReactRouterDOM.Navigate to="/" replace />` for redirects

## Recent Conversations

The `RecentConversations` component tracks recent chat sessions:
- Stored in localStorage with key `recentConversations`
- Max 20 recent conversations
- Each record: `{ id, personaId, timestamp }`
- Date display: "Today at HH:MM", "Yesterday at HH:MM", or "DD/MM/YYYY"
- Use `addToRecentConversations(personaId)` to track new sessions

## Common Patterns

### State Management

- Local state via `useState` for component state
- `useMemo` for expensive computations
- `useCallback` for memoized callbacks passed to children
- `useEffect` for side effects (API calls, subscriptions)

### Routing

Uses HashRouter for SPA routing:
```tsx
<ReactRouterDOM.Routes>
  <ReactRouterDOM.Route path="/" element={<DashboardPage />} />
  <ReactRouterDOM.Route path="/simulation/:personaId" element={<SimulationPage />} />
</ReactRouterDOM.Routes>
```

### Dark Mode

- Toggle via `dark` class on `<html>` element
- Persist preference in `localStorage`
- Respect system preference on first load

## Known Issues / Workarounds

1. react-router-dom imported as namespace (`import * as ReactRouterDOM`) to avoid build issues
2. No test coverage currently - add Vitest/Playwright when testing is needed
3. README.md has merge conflict markers - fix if editing

## API Integration

The Gemini API is wrapped in `services/geminiService.ts`:
- `initializeChatSession(systemInstruction)` - Creates a chat session
- `sendChatMessage(session, message, streamHandler)` - Sends message with streaming

The `streamHandler` callback receives chunks during streaming for real-time UI updates.
