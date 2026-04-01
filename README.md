# Conversational Simulations Platform

A platform for users to engage in simulated conversations with AI-powered personas for soft skill practice, idea exploration, and training.

## Overview

This project aims to provide a rich, interactive experience for users to improve their conversational abilities and explore different scenarios with AI agents.

## Features (Planned & In-Progress)

*   User Authentication (Email/Password, OAuth)
*   Simulation Library Dashboard
*   Interactive Chat Interface with AI Personas
    *   Rich responses (text, potentially audio/images)
    *   Conversation goal tracking
    *   Scenario branching
*   Persona Engine with customizable profiles
*   User Progress Tracking & Reflection
*   Admin Interface for scenario management

## Technologies

### Frontend
*   React (Vite)
*   Tailwind CSS
*   TypeScript
*   @google/genai (for AI interaction)

### Backend (Planned)
*   Node.js (Express or Fastify)
*   PostgreSQL (with Prisma ORM)
*   Authentication (Clerk or Auth.js)

### AI
*   Google Gemini API

## Getting Started

### Prerequisites

*   Node.js (version X.X.X or higher)
*   npm or yarn
*   A Google Gemini API Key

### Environment Variables

Create a `.env` file in the root of your project and add your API key:

```
API_KEY=YOUR_GEMINI_API_KEY
```
(Refer to `.env.example` for a template)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd conversational-simulations-platform
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the development server (Frontend - current setup):**
    This project currently relies on `esbuild` for development, often run via a script in `package.json` like `npm run dev` or `npm start`. If you are using Vite (which is common with React and Tailwind), the command would typically be:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    (Ensure your `package.json` has the appropriate scripts).

## Project Structure (Simplified)

```
/
├── public/                  # Static assets
├── src/                     # Frontend source code (React components, services, etc.)
│   ├── components/
│   ├── services/
│   ├── App.tsx
│   ├── index.tsx
│   ├── constants.ts
│   └── types.ts
├── backend/                 # (Planned) Backend server code
├── database/                # (Planned) Database schema, migrations, seeds
├── .env.example             # Example environment variables
├── index.html               # Main HTML entry point
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md
```

## Contributing

Details on how to contribute will be added soon.

## License

This project is licensed under the MIT License - see the LICENSE.md file (if available) for details.
