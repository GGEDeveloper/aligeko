# AliTools B2B E-commerce Platform

A comprehensive B2B e-commerce platform for AliTools, connecting wholesale suppliers with business customers through an integrated online marketplace.

## Project Overview

This platform enables businesses to register, browse products, place orders, and manage their accounts in a secure and efficient manner. The system integrates with the GEKO ERP system for real-time inventory management and product data.

## Features

- **Business Customer Registration & Approval**: Secure account creation with admin approval workflow
- **Product Catalog**: Comprehensive product browsing with search, filter, and detailed views
- **Shopping Cart**: Persistent cart with synchronization between devices and guest-to-user migration
- **Checkout Process**: Multi-step checkout with address, shipping method, and payment selection
- **Order Management**: Complete order lifecycle from cart to delivery
- **Admin Dashboard**: Tools for managing products, customers, and orders
- **Customer Dashboard**: Account management, order history, and preferences
- **GEKO API Integration**: Real-time product and inventory synchronization
- **Multi-tier Pricing**: Business-specific pricing based on customer categories

## Technology Stack

- **Frontend**: React.js with Redux Toolkit, React Router, and Tailwind CSS
- **Backend**: Node.js with Express.js and Sequelize ORM
- **Database**: PostgreSQL (Neon for production)
- **Deployment**: Vercel (development) and Dominios.pt (production)

## Live Demo

The latest version of the application is deployed and available at:
- **Vercel Production**: [https://aligekow-hy8vyu57t-alitools-projects.vercel.app](https://aligekow-hy8vyu57t-alitools-projects.vercel.app)

## Implementation Status

As of October 2024, the following key components have been implemented:
- ✅ Admin Dashboard and Management (Task 10) - 100% Complete
- ✅ Customer Dashboard Layout (Task 11.1) - Complete
- ⏳ Customer Account Management (Tasks 11.2-11.5) - In Progress
- ⏳ Security Implementation (Task 12) - Pending
- ⏳ Performance Optimization (Task 13) - Pending

For detailed implementation status, see `tasks/implementation-steps.md`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- GEKO API access credentials

### Installation

1. Clone the repository:
   ```
   git clone [repository URL]
   cd aligekow
   ```

2. Install dependencies:
   ```
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

4. Set up the database:
   ```
   cd ../server
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development servers:
   ```
   # Start the backend server
   cd ../server
   npm run dev

   # In another terminal, start the frontend
   cd ../client
   npm run dev
   ```

## Development

- Backend API will be available at: http://localhost:5000
- Frontend will be available at: http://localhost:3000

## Deployment

For detailed deployment instructions and configuration:
- See `docs/vercel-deployment-steps.md` for step-by-step deployment guide
- See `docs/environment_config.markdown` for environment variable configuration
- See `server/docs/deployment/vercel-neon-deployment.md` for Vercel + Neon PostgreSQL integration

To deploy to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## License

[License Information]

## Contact

[Contact Information] 