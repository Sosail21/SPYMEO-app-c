# SPYMEO Technical Specifications

This directory contains comprehensive technical specifications for the SPYMEO platform, following the [GitHub Spec-Kit](https://github.com/github/spec-kit) standards.

## Overview

SPYMEO is a comprehensive platform connecting wellness practitioners, artisans, merchants, and training centers with end-users through a subscription-based PASS system. The platform provides professional tools for client management, scheduling, pre-accounting, learning resources, and community features.

## Documentation Structure

### Core Architecture
- [Architecture Overview](./architecture.md) - System architecture, technology stack, and design patterns
- [Data Model](./data-model.md) - Complete database schema and type definitions

### API Specifications (OpenAPI 3.0)
All API endpoints are documented using OpenAPI 3.0 format with complete request/response schemas.

- [Authentication API](./api/authentication.yaml) - Login, logout, session management
- [Account API](./api/account.yaml) - User account and profile management
- [Clients API](./api/clients.yaml) - Client/patient management for practitioners
- [Agenda API](./api/agenda.yaml) - Calendar and appointment scheduling
- [Academy API](./api/academy.yaml) - Learning platform and educational content
- [Pre-Accounting API](./api/precompta.yaml) - Financial tracking and receipts
- [PASS API](./api/pass.yaml) - Subscription system management
- [User API](./api/user.yaml) - End-user features (appointments, documents, messaging)
- [Pro API](./api/pro.yaml) - Professional features (advantages, impact, resources)
- [Admin API](./api/admin.yaml) - Administrative endpoints

### Module Specifications
Detailed feature documentation for each user role:

- [Practitioner Module](./modules/practitioner.md) - Healthcare practitioners features
- [Artisan Module](./modules/artisan.md) - Service provider features
- [Merchant Module](./modules/merchant.md) - E-commerce and product management
- [Training Center Module](./modules/training-center.md) - Educational institution features
- [PASS System](./modules/pass-system.md) - Subscription and benefits system

## Key Features

### Multi-Role System
SPYMEO supports multiple user roles with specialized features:
- **FREE_USER** - Basic platform access
- **PASS_USER** - Subscription members with premium benefits
- **PRACTITIONER** - Wellness professionals with client management
- **ARTISAN** - Service providers with catalog and orders
- **COMMERCANT** - Merchants with product inventory and e-commerce
- **CENTER** - Training centers with course and learner management
- **ADMIN** - Platform administrators
- **AMBASSADOR** - Community representatives
- **PARTNER** - Business partners

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with REST architecture
- **Authentication**: Cookie-based sessions with RBAC
- **State Management**: React hooks and Server Components
- **Data Storage**: Mock in-memory stores (development), designed for database migration

### API Standards
- RESTful architecture
- JSON request/response format
- Cookie-based authentication
- Comprehensive error handling
- OpenAPI 3.0 documentation
- Role-based access control (RBAC)

## Getting Started

1. Review the [Architecture Overview](./architecture.md) for system design
2. Check [Data Model](./data-model.md) for type definitions and relationships
3. Browse API specifications in `./api/` for endpoint details
4. Read module specs in `./modules/` for feature documentation

## API Endpoint Summary

### Authentication (3 endpoints)
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/public/pass/:userId

### Account Management (7 endpoints)
- GET /api/account/me
- PUT /api/account
- POST /api/account/avatar
- GET /api/account/billing
- GET /api/account/plan
- POST /api/account/plan/pause
- DELETE /api/account/delete

### Client Management (6 endpoints)
- GET /api/clients
- POST /api/clients
- GET /api/clients/:id
- PUT /api/clients/:id
- DELETE /api/clients/:id
- GET /api/clients/:id/[antecedents|consultations|docs|invoices]

### Agenda (4 endpoints)
- GET /api/agenda/events
- POST /api/agenda/events
- GET /api/agenda/events/:id
- PUT /api/agenda/events/:id
- DELETE /api/agenda/events/:id
- GET /api/agenda/settings
- PUT /api/agenda/settings

### Academy (10 endpoints)
- GET /api/academy/lessons
- POST /api/academy/lessons
- GET /api/academy/chapters
- POST /api/academy/chapters/completed
- GET /api/academy/progress
- PUT /api/academy/progress
- GET /api/academy/progress/by-lesson
- GET /api/academy/notes
- POST /api/academy/notes
- PUT /api/academy/notes/:id
- DELETE /api/academy/notes/:id
- GET /api/academy/comments
- POST /api/academy/comments

### Pre-Accounting (5 endpoints)
- GET /api/precompta/config
- PUT /api/precompta/config
- GET /api/precompta/transactions
- GET /api/precompta/receipts
- POST /api/precompta/receipts
- GET /api/precompta/receipts/:id
- DELETE /api/precompta/receipts/:id

### PASS System (7 endpoints)
- GET /api/user/pass
- POST /api/user/pass/toggle-plan
- POST /api/user/pass/increment-month
- POST /api/user/pass/ship-carnet
- GET /api/user/pass/discounts
- GET /api/user/pass/resources
- GET /api/pro/pass

### User Features (8 endpoints)
- GET /api/user/appointments
- POST /api/user/appointments
- GET /api/user/appointments/:id
- PUT /api/user/appointments/:id
- DELETE /api/user/appointments/:id
- GET /api/user/documents
- POST /api/user/documents
- GET /api/user/documents/:id
- DELETE /api/user/documents/:id
- GET /api/user/conversations
- GET /api/user/conversations/:id/messages
- POST /api/user/conversations/:id/messages

### Professional Features (7 endpoints)
- GET /api/pro/avantages
- POST /api/pro/avantages
- GET /api/pro/avantages/:id
- PUT /api/pro/avantages/:id
- DELETE /api/pro/avantages/:id
- GET /api/pro/impact
- POST /api/pro/impact/candidature
- GET /api/resources
- POST /api/resources
- GET /api/resources/:id/download
- POST /api/resources/share

### Statistics
- GET /api/stats

### Blog/Articles
- GET /api/articles
- POST /api/articles

## Version History

- **v1.0** (Current) - Initial comprehensive specification
  - Multi-role architecture
  - 57+ API endpoints documented
  - Complete data model
  - Module specifications for all user types

## Contributing

When adding new features or endpoints:
1. Update relevant OpenAPI spec in `./api/`
2. Document data types in `data-model.md`
3. Update module specs in `./modules/`
4. Follow Spec-Kit conventions for formatting

## Related Documentation

- [README.md](../../README.md) - Project overview and setup
- [README-cabinet-partage.md](../../README-cabinet-partage.md) - Shared office feature
- Source code: `src/app/api/` - API implementation
- Types: `src/lib/db/types.ts` - TypeScript definitions
- Routes: `src/lib/routes.ts` - Route configuration
- RBAC: `src/lib/rbac.ts` - Role-based access control

---

Last updated: 2025-10-06
