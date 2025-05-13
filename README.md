# AliTools B2B E-commerce Platform

A comprehensive B2B e-commerce platform for AliTools, connecting wholesale suppliers with business customers through an integrated online marketplace.

## 🚨 Recent Fixes & Improvements (May 2025)

We've implemented several important fixes to make the platform more stable and reliable:

- **✅ Database Connection Fixes**: Resolved issues with Neon PostgreSQL connectivity
- **✅ Product Display**: Fixed component naming inconsistencies (ProductList vs ProductsList)
- **✅ Model Definitions**: Updated Sequelize model definitions to match actual database schema
- **✅ API Endpoint Fixes**: Resolved issues with API response formats and data handling
- **✅ Price Display**: Corrected price extraction from variant objects
- **✅ Deployment Config**: Improved Vercel deployment configuration for reliable deployment
- **✅ Error Logging**: Implemented comprehensive error tracking and documentation

For detailed information about these fixes, see `docs/error_fixes.md` and `docs/deployment_guide.md`.

## Project Overview

This platform enables businesses to register, browse products, place orders, and manage their accounts in a secure and efficient manner. The system integrates with the GEKO ERP system for real-time inventory management and product data.

### Vision
AliTools (formerly AlimamedeTools) aims to be the premier B2B platform for quality tools and construction equipment in Portugal. Our platform bridges the gap between manufacturers, distributors, and business customers with an efficient, secure, and scalable digital marketplace.

### Business Model
- **Primary Users**: Distributors, retailers, and commercial construction companies
- **Product Categories**: Hand tools, construction equipment, electrical tools, protective gear
- **Differentiators**: Product quality, bulk pricing, specialized catalog, business verification

## Features

- **Business Customer Registration & Approval**: Secure account creation with admin approval workflow
- **Product Catalog**: Comprehensive product browsing with search, filter, and detailed views
- **Shopping Cart**: Persistent cart with synchronization between devices and guest-to-user migration
- **Checkout Process**: Multi-step checkout with address, shipping method, and payment selection
- **Order Management**: Complete order lifecycle from cart to delivery
- **Admin Dashboard**: Tools for managing products, customers, and orders
- **Customer Dashboard**: Account management, order history, and preferences
- **GEKO API Integration**: Real-time product and inventory synchronization with XML file upload capability
- **Multi-tier Pricing**: Business-specific pricing based on customer categories

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form with Yup validation
- **Testing**: Vitest and React Testing Library

### Backend
- **Runtime**: Node.js
- **API Framework**: Express.js
- **ORM**: Sequelize with PostgreSQL
- **Authentication**: JWT with role-based access control
- **Validation**: Express Validator
- **Logging**: Winston
- **Testing**: Jest

### Infrastructure
- **Database**: PostgreSQL (Neon for production)
- **Deployment**: Vercel (development) and Dominios.pt (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **File Storage**: Vercel Blob Storage

## Architecture

The application follows a modern client-server architecture:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │     Backend     │      │   GEKO API &    │
│  React + Redux  │◄────►│   Express.js    │◄────►│   External      │
│                 │      │                 │      │   Services      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 ▲
                                 │
                                 ▼
                         ┌─────────────────┐
                         │   PostgreSQL    │
                         │   Database      │
                         │                 │
                         └─────────────────┘
```

## Project Structure

```
aligekow/
├── .cursor/               # Cursor AI rules
├── .vercel/               # Vercel deployment configs
├── api/                   # API endpoints for serverless deployment
├── client/                # Frontend React application
│   ├── dist/              # Built frontend assets
│   ├── public/            # Static assets
│   └── src/
│       ├── assets/        # Images, styles, icons
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       ├── store/         # Redux store and slices
│       └── utils/         # Utility functions
├── docs/                  # Project documentation
├── server/                # Backend Express application
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # Express routes
│   │   └── services/      # Business logic services
│   └── tests/             # Backend tests
└── shared/                # Shared code between client and server
```

## Live Demo

The latest version of the application is deployed and available at:
- **Vercel Production**: [https://aligekow-hy8vyu57t-alitools-projects.vercel.app](https://aligekow-hy8vyu57t-alitools-projects.vercel.app)

## Implementation Status

As of October 2024, the following key components have been implemented:
- ✅ Admin Dashboard and Management (Task 10) - 100% Complete
- ✅ Customer Dashboard Layout (Task 11.1) - Complete
- ✅ AliTools Brand Implementation (Task 14) - Complete
- ✅ Design System Technical Implementation (Task 17) - Complete
- ✅ Visual Refinements (Tasks 18-19) - Complete
- ✅ Company Information Implementation (Task 20) - Complete
- ⏳ XML File Upload for GEKO Product Catalog (Task 23) - In Progress
- ⏳ Customer Account Management (Tasks 11.2-11.5) - Pending
- ⏳ Security Implementation (Task 12) - Pending
- ⏳ Performance Optimization (Task 13) - Pending

For detailed implementation status, see `tasks/implementation-steps.md`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (local or cloud)
- GEKO API access credentials
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository URL]
   cd aligekow
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the variables with your configuration
   ```bash
   # Server environment variables
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   POSTGRES_URL=postgres://user:password@localhost:5432/alitools
   
   # GEKO API credentials
   GEKO_API_URL=https://api.geko.com/products
   GEKO_API_USERNAME=your_username
   GEKO_API_PASSWORD=your_password
   
   # Client environment variables
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. Set up the database:
   ```bash
   cd ../server
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development servers:
   ```bash
   # Start both backend and frontend (from project root)
   npm run dev
   
   # Or start them separately:
   # Start the backend server
   cd server
   npm run dev

   # In another terminal, start the frontend
   cd client
   npm run dev
   ```

## Development

- Backend API will be available at: http://localhost:5000
- Frontend will be available at: http://localhost:3000
- API documentation at: http://localhost:5000/api-docs

### Code Style & Linting

This project follows the AliTools code standards with ESLint and Prettier:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run specific test file
npm test -- -t "test name pattern"
```

## Deployment

For detailed deployment instructions and configuration:
- See `docs/deployment/vercel-deployment-steps.md` for step-by-step deployment guide
- See `docs/deployment/environment_config.md` for environment variable configuration
- See `docs/deployment/vercel-neon-deployment.md` for Vercel + Neon PostgreSQL integration

To deploy to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Documentation

- API Documentation: Available at `/api-docs` when running the development server
- Database Schema: See `docs/database/schema.md`
- Architecture: See `docs/architecture.md`
- User Guides: See `docs/user-guides/`

## Contributing

Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Roadmap

- Q4 2024: Complete XML upload functionality and security implementation
- Q1 2025: Performance optimization and mobile app development
- Q2 2025: Advanced analytics and reporting
- Q3 2025: Integration with additional payment gateways

## License

This project is proprietary software and is not licensed for public use.

## Contact

- **AliTools Support**: alimamedetools@gmail.com
- **Phone**: (+351) 96 396 59 03
- **Business Hours**: Monday to Friday, 9:00 to 12:30 - 14:00 to 18:30 