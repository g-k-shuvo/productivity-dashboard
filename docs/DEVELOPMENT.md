# Development Guide

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   cd ../extension && npm install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Start Docker containers:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

5. Run database migrations (when implemented):
   ```bash
   cd backend && npm run migrate
   ```

## Development

### Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

### Extension

```bash
cd extension
npm run dev
```

Build the extension:
```bash
npm run build
```

Load the extension in Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/dist` directory

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

## Project Structure

See the main README.md for project structure details.

