# Momentum Productivity Dashboard

A production-grade Chrome extension that transforms your new tab page into a personalized productivity dashboard with both free and premium features.

## Architecture

- **Frontend**: React + TypeScript + Vite (Chrome Extension)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Project Structure

```
productivity-dashboard/
├── extension/          # Chrome Extension (React + Vite)
├── backend/            # Express.js API Server
├── database/           # Database migrations and seeds
├── docker/             # Docker configuration
└── docs/               # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Development Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Start Docker containers:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. Install dependencies (npm workspaces handle all packages):
   ```bash
   npm install
   ```

5. Run development servers:
   - Backend: `cd backend && npm run dev`
   - Extension: `cd extension && npm run dev`

6. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension/dist` directory

## Features

### Free Features (Implemented)
- ✅ Daily inspirational quotes
- ✅ Focus mode
- ✅ To-do list
- ✅ Quick links
- ✅ Clock display
- ✅ Search bar

### Pro Features (Planned)
- Vision board
- Advanced to-do lists
- Tab stash
- Pomodoro timer
- Metrics tracking
- Habit tracker
- AI features (Notes AI, Ask AI)
- Task manager integrations
- Multiple workspaces
- And more...

## Development

### Backend

```bash
cd backend
npm run dev      # Start development server
npm test         # Run tests
npm run build    # Build for production
```

### Extension

```bash
cd extension
npm run dev      # Build extension in watch mode
npm run build    # Build extension for production
npm test         # Run tests
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Extension Tests
```bash
cd extension
npm test
npm run test:watch
```

## Code Quality

- ESLint: `npm run lint`
- Prettier: `npm run format`
- TypeScript: `npm run typecheck`

## API Documentation

See [docs/API.md](docs/API.md) for API documentation.

## Development Guide

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for detailed development instructions.

## License

MIT
