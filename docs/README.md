# AliTools B2B Documentation

Welcome to the AliTools B2B Platform documentation. This repository contains comprehensive documentation for developers and designers working on the AliTools B2B e-commerce platform.

## Documentation Structure

The documentation is organized into the following categories:

### 1. Deployment
- [Deployment Guide](./deployment/deployment-guide.md) - Complete guide for deploying the application
- [Vercel Configuration](./deployment/vercel-dynamic-imports.md) - Specific configuration for Vercel deployments
- [Environment Variables](./deployment/environment-config.md) - Configuration of environment variables
- [Troubleshooting](./deployment/deployment-troubleshooting.md) - Common deployment issues and solutions

### 2. Database
- [Database Schema](./database/database-schema.md) - Tables, fields and relationships
- [Database Indexes](./database/database-indexes.md) - Index configurations for performance
- [Seed Data](./database/seed-data.md) - Information about seed data generation
- [Data Scraper](./database/data-scraper.md) - Documentation for the data scraping tools

### 3. Branding & UI
- [Brand Style Guide](./branding/brand-style-guide.md) - Complete brand identity guidelines
- [Logo Guidelines](./branding/logo-guidelines.md) - Logo usage specifications and variations
- [Icons Library](./branding/icons-library.md) - Available icons and usage patterns
- [Logo Sizing](./branding/logo-sizing-guidelines.md) - Logo sizing specifications and guidelines

### 4. Development
- [Testing Guidelines](./development/testing.md) - Testing approaches and best practices
- [Express SPA Routing](./development/express-spa-routing.md) - SPA routing configuration
- [Implementation Guides](./development/implementation-guides.md) - General implementation guidelines
- [Company Information](./development/company-information.md) - Documentation for the company info feature

### 5. Process & Standards
- [Documentation Standards](./documentation-standards.md) - Standards for documentation including timestamp requirements

## Documentation Timestamp Requirements

All documentation and project update entries MUST include timestamps in the following format to maintain a clear history of changes:

- **Format:** `[YYYY-MM-DD HH:MM]` (e.g., `[2023-06-15 14:30]`)
- **Location:** At the beginning of each entry or update section
- **Required information:**
  - Date and time of update
  - Author name (when applicable)
  - Brief description of changes
  - Related files or components
  - Version number (when applicable)

See [Documentation Standards](./documentation-standards.md) for complete guidelines.

### Example Documentation Update

```markdown
## Feature Updates

### JWT Authentication Implementation

- **Timestamp:** [2023-06-20 09:45]
- **Author:** Alex Rodriguez
- **Changes:** 
  - Added JWT authentication to API endpoints
  - Implemented token refresh mechanism
  - Updated login flow to use JWT
- **Related Files:** 
  - `server/src/middleware/auth.js`
  - `server/src/controllers/authController.js`
  - `client/src/hooks/useAuth.js`
- **Version:** v1.2.0
```

This timestamp requirement applies to:
- All documentation files
- Code comments for significant changes
- PR descriptions
- Issue tracking entries
- Meeting notes
- Architecture decision records

Using consistent timestamps helps track the evolution of features, fixes, and documentation over time, making it easier to correlate changes across the project.

## Recent Updates

- **Timestamp:** [2023-06-23 16:20]
  - Added documentation timestamp requirements
  - Reorganized documentation into logical categories (deployment, database, branding, development)
  - Added company information and contact page implementation documentation
  - Updated deployment troubleshooting guide with latest Vercel configurations

- **Timestamp:** [2023-05-15 11:35] 
  - Added visual refinement audit documentation
  - Updated deployment troubleshooting with section on environment variables
  - Added hero section implementation guide

- **Timestamp:** [2023-04-10 14:50] 
  - Added brand style guide with new components
  - Expanded database schema documentation
  - Added deployment guide for Vercel

## Contributing to Documentation

When adding or updating documentation:

1. Place files in the appropriate category folder (deployment, database, branding, development)
2. Follow the established Markdown formatting style
3. **Always include timestamps** for each significant update or change
4. Update the category README when adding new documentation files
5. Reference other relevant documentation where appropriate

All documentation should be kept up-to-date as the project evolves.

## Documentation Conventions

- Use Markdown for all documentation
- Start each file with a clear title (# Title)
- Use second level headings (##) for major sections
- Include code samples with appropriate syntax highlighting
- Add timestamps for all updates in format `[YYYY-MM-DD HH:MM]`
- Add a "Last Updated" note at the bottom of each file when making significant changes
- Use relative links to reference other documentation files 