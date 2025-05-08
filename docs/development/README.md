# Development Documentation

This directory contains documentation related to development practices, guides, and implementation details for the AliTools B2B platform.

## Key Documents

- [Testing Guidelines](./testing.md) - Testing approaches, tools and best practices
- [Express SPA Routing](./express-spa-routing.md) - Configuration for Single Page Application routing with Express
- [Company Information](./company-information.md) - Implementation details for the company information feature
- [Pages Implementation](./pages-implementation.md) - Guidelines for implementing new pages and components
- [Implementation Guides](./implementation-guides.md) - Detailed implementation guides for specific features

## Development Environment Setup

To set up the development environment:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

The project follows a client-server architecture:

- `client/` - React frontend application
- `server/` - Express backend application
- `shared/` - Shared utilities and types
- `docs/` - Project documentation

## Key Technologies

- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **Backend**: Express, Sequelize, PostgreSQL
- **Deployment**: Vercel
- **Testing**: Jest, React Testing Library

## Development Workflow

1. Create a new branch from `main`
2. Implement feature or fix
3. Write tests
4. Submit pull request
5. Code review
6. Merge to `main`

## Coding Standards

- Follow ESLint rules defined in `.eslintrc.js`
- Use TypeScript for type safety
- Follow component structure from existing components
- Write unit tests for new functionality
- Update documentation when adding new features 