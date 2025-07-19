# Replit.md

## Overview

This is a full-stack web application built with React, Express.js, TypeScript, and PostgreSQL. It's a Korean e-commerce or product showcase platform featuring product listings, search functionality, and a comprehensive admin interface with authentication. The application uses modern web technologies including shadcn/ui components, TanStack Query for data fetching, and includes session-based authentication with password management and bulk product import capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-01-19 - Authentication System Completed
- ✓ Implemented session-based authentication with bcryptjs password hashing
- ✓ Added comprehensive admin login system with route protection
- ✓ Created bulk product import functionality supporting Excel, CSV, and JSON formats
- ✓ Added password change and logout capabilities
- ✓ Integrated file upload with template downloads
- ✓ Fixed API request parameter ordering issues
- ✓ Resolved React hook rendering issues in admin page
- Status: Core authentication and file upload features fully operational

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Mobile-First**: Responsive design with mobile navigation and layout

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Structure**: RESTful API with JSON responses

## Key Components

### Database Schema
The application uses three main tables:
- **Users**: Complete user authentication with admin privileges (id, username, password, isAdmin, timestamps)
- **Products**: Product catalog with Korean won pricing, ratings, categories, and purchase links
- **Sessions**: Session storage for secure admin authentication
- **Features**: Product search, category filtering, active/inactive status, bulk import from Excel/CSV/JSON

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change user password

#### Products
- `GET /api/products` - Get active products
- `GET /api/products/all` - Get all products (admin only)
- `GET /api/products/search` - Search products by query
- `GET /api/products/category/:category` - Filter by category
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Bulk Import
- `POST /api/products/bulk-import` - Upload Excel/CSV/JSON files for bulk product import (admin only)
- `GET /api/products/template` - Download sample templates in Excel/CSV/JSON format

### Frontend Pages
- **Home**: Product listing with search, category filters, and mobile-optimized cards
- **Admin**: Comprehensive product management interface with CRUD operations, bulk import, and password management
- **Login**: Admin authentication page with session management
- **404**: Not found page

### Authentication & Security
- Session-based authentication using express-session
- Password hashing with bcryptjs
- Admin-only route protection
- Default admin account: username "admin", password "admin123"

### Storage Layer
Currently uses in-memory storage (MemStorage class) with sample data and default admin user. Includes password hashing, authentication validation, and bulk product import capabilities. Designed to be easily replaced with a database-backed implementation.

## Data Flow

1. **Client Request**: Frontend makes API calls using TanStack Query
2. **API Layer**: Express.js routes handle requests and validate data using Zod schemas
3. **Storage Layer**: Currently in-memory storage, designed for database integration
4. **Response**: JSON responses with proper error handling and logging

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Neon Database for serverless PostgreSQL

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- shadcn/ui component library
- Lucide React for icons

### Data Management
- TanStack Query for server state management
- Zod for schema validation
- React Hook Form for form handling

### Development Tools
- Vite for development server and build process
- TypeScript for type safety
- PostCSS for CSS processing
- ESBuild for server bundling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Development mode runs with `tsx` for hot reloading
- Production mode serves bundled static files

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build both frontend and backend
- `npm run start` - Production server
- `npm run db:push` - Push database schema changes

The application is structured as a monorepo with clear separation between client, server, and shared code, making it easy to scale and maintain.