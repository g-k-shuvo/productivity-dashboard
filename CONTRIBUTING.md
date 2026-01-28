# Contributing to Momentum Productivity Dashboard

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install
   cd ../extension && npm install
   ```
3. Copy `.env.example` to `.env` and configure
4. Start Docker services:
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```
5. Run development servers (see README.md)

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format code with Prettier
- Write meaningful commit messages
- Add comments for complex logic

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Update documentation if needed
5. Ensure all checks pass
6. Submit PR with clear description

## Code Review

- All PRs require review
- Address review comments promptly
- Keep PRs focused and reasonably sized

## Questions?

Open an issue for questions or discussions.

