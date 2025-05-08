# AliTools B2B Documentation

This directory contains comprehensive documentation for the AliTools B2B E-commerce Platform. Use this document as an entry point to navigate the documentation.

## Documentation Structure

```
docs/
├── README.md                 # This file - Documentation overview
├── api/                      # API documentation
│   ├── endpoints/            # Individual endpoint documentation
│   ├── schemas/              # Data schemas and models
│   └── authentication.md     # Authentication and authorization
├── architecture/             # System architecture documentation
│   ├── overview.md           # High-level architecture
│   ├── frontend.md           # Frontend architecture
│   └── backend.md            # Backend architecture
├── database/                 # Database documentation
│   ├── schema.md             # Database schema
│   ├── migrations.md         # Migration strategy
│   └── models.md             # Data models
├── deployment/               # Deployment documentation
│   ├── vercel-deployment-steps.md   # Vercel deployment guide
│   ├── environment_config.md        # Environment variable configuration
│   └── vercel-neon-deployment.md    # Neon PostgreSQL integration
├── development/              # Development guides
│   ├── setup.md              # Development environment setup
│   ├── workflow.md           # Development workflow
│   ├── coding-standards.md   # Coding standards
│   └── testing.md            # Testing approach
├── features/                 # Feature documentation
│   ├── product-catalog.md    # Product catalog
│   ├── shopping-cart.md      # Shopping cart
│   ├── checkout.md           # Checkout process
│   └── order-management.md   # Order management
├── integrations/             # External integrations
│   ├── geko-api.md           # GEKO API integration
│   └── payment-gateways.md   # Payment gateway integrations
├── user-guides/              # User documentation
│   ├── admin/                # Admin user guides
│   └── customer/             # Customer user guides
├── branding/                 # Brand assets and guidelines
├── templates/                # Documentation templates
└── archive/                  # Outdated documentation (for reference)
```

## Key Documentation

| Category | Document | Description |
|----------|----------|-------------|
| **Getting Started** | [Development Setup](development/setup.md) | Guide to setting up your development environment |
| **Architecture** | [System Architecture](architecture/overview.md) | High-level overview of the application architecture |
| **Development** | [Workflow Guide](development/workflow.md) | Development workflow and processes |
| **API** | [API Overview](api/README.md) | API documentation and usage |
| **Deployment** | [Deployment Guide](deployment/vercel-deployment-steps.md) | Guide to deploying the application |
| **Integration** | [GEKO API](integrations/geko-api.md) | Integration with GEKO API and XML processing |

## Documentation Standards

All documentation should follow our [Documentation Standards](development/documentation-standards.md) to ensure consistency and clarity.

### Templates

Use these templates when creating new documentation:

- [API Endpoint Documentation Template](templates/api_endpoint_template.md)
- [Feature Documentation Template](templates/feature_template.md)
- [Task Template](templates/task_template.md)

## Maintaining Documentation

- Documentation should be updated whenever related code changes
- Include code examples where appropriate
- Use markdown formatting for consistency
- Link to other relevant documentation
- Use diagrams when they add clarity (store diagram source files in the same directory)
- Follow the naming conventions specified in the standards

## Special Documentation Topics

### Error Tracking Documentation

All error tracking should be added to [Error Tracking Documentation](.cursor/rules/error_tracking.mdc) following the standard format. See [Error Tracking Entry Template](templates/error_tracking_entry_template.md) for guidance.

### Cursor Rules

Cursor rules are stored in `.cursor/rules/` directory and provide AI-assisted guidance for development. See [Cursor Rules Template](.cursor/rules/cursor_rules_template.mdc) for the proper format.

## Documentation TODOs

- [ ] Complete API endpoint documentation
- [ ] Update database schema diagram
- [ ] Create user guides for customer dashboard
- [ ] Add integration guides for payment gateways
- [ ] Document error handling strategies
- [ ] Create troubleshooting guides 