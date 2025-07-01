# Clothing Rental Management System

## Overview

This is a full-stack clothing rental management system built with modern web technologies. The application provides a comprehensive solution for managing clothing inventory, processing rental orders, tracking bookings, and visualizing rental schedules through an admin dashboard.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **File Upload**: Multer middleware for image handling
- **Development**: tsx for TypeScript execution in development

### Monorepo Structure
- **Client**: Frontend React application (`/client`)
- **Server**: Backend Express API (`/server`)
- **Shared**: Common TypeScript types and schemas (`/shared`)

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: @neondatabase/serverless driver

### Core Entities
1. **Categories**: Product categories with names and descriptions for organizing clothing sets
2. **Clothing Sets**: Rental inventory with categories, pricing, and quantities
3. **Orders**: Customer rental orders with date ranges and status tracking
4. **Order Items**: Line items linking orders to specific clothing sets

### Authentication & Sessions
- Session-based authentication using connect-pg-simple
- PostgreSQL session store for production scalability

### File Management
- Local file storage in `/uploads` directory
- Image upload validation (type and size limits)
- Static file serving for uploaded images

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express middleware handles CORS, JSON parsing, and logging
3. Route handlers interact with storage layer
4. Responses formatted as JSON with error handling

### State Management Flow
1. TanStack Query manages server state caching
2. Optimistic updates for better UX
3. Automatic cache invalidation on mutations
4. Error boundaries for graceful error handling

### Form Processing
1. React Hook Form with Zod validation
2. Type-safe form schemas shared between client/server
3. File uploads handled separately via FormData

## External Dependencies

### UI Components
- Radix UI primitives for accessibility
- Lucide React for icons
- Date-fns for date manipulation
- React Hook Form for form management

### Development Tools
- Vite plugins for development experience
- Replit-specific tooling for deployment
- TypeScript strict mode configuration
- ESLint and Prettier (implied by setup)

### Build Dependencies
- ESBuild for server bundling
- PostCSS with Tailwind and Autoprefixer
- Path resolution aliases for clean imports

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- tsx watch mode for backend development
- Concurrent development with proxy setup

### Production Build
1. **Frontend**: Vite builds optimized React bundle
2. **Backend**: ESBuild bundles server code
3. **Static Assets**: Built to `/dist/public`
4. **Database**: Drizzle migrations applied via `db:push`

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- File upload directory configuration
- CORS and session configuration

## Changelog

```
Changelog:
- June 30, 2025: Initial setup with basic clothing rental system
- June 30, 2025: Added category management system with full CRUD operations
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```