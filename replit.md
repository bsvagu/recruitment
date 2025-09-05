# RecruitPortal

## Overview

RecruitPortal is a full-stack recruitment management system built with TypeScript, featuring comprehensive company and contact management capabilities. The application provides CRUD operations for companies and contacts with advanced search, filtering, and relationship management features. It follows LinkedIn-inspired field structures and includes extensible custom field definitions for dynamic data requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming

### Backend Architecture
- **Server**: Express.js with TypeScript for the REST API
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for runtime validation and type inference
- **API Design**: RESTful endpoints with consistent response patterns including pagination, search, and filtering
- **File Structure**: Modular route handlers separated by entity type (companies, contacts, auth, field-definitions)

### Database Design
- **Database**: PostgreSQL with UUID primary keys for scalability
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Entities**:
  - Companies: Comprehensive business information including legal details, industry classification, and lifecycle stages
  - Contacts: Personal and professional information with company relationships
  - Addresses: Reusable address components for both companies and contacts
  - Communications: Email and phone number management with type classification
  - Field Definitions: Dynamic custom field system for extensibility
- **Soft Deletion**: isDeleted flag pattern for data retention
- **Polymorphic Relationships**: Address, email, and phone entities can be associated with multiple entity types

### Authentication & Authorization
- **User Management**: Role-based access control with admin, manager, recruiter, and viewer roles
- **Authentication**: bcryptjs for password hashing with session-based authentication
- **Authorization**: Role-based permissions for different operations (view, edit, delete)

### Data Management Features
- **Search**: Full-text search across multiple fields with keyword matching
- **Filtering**: Structured filters for industry, company type, employee count, status, location
- **Pagination**: Cursor-based pagination for efficient large dataset handling
- **Sorting**: Multi-field sorting with configurable sort orders
- **Extensibility**: Custom field definitions allow dynamic schema extensions without migrations

### UI/UX Design Patterns
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Component Library**: Consistent design system using shadcn/ui components
- **Data Tables**: Reusable DataTable component with sorting, filtering, and pagination
- **Form Management**: Standardized form patterns with validation feedback
- **Modal Patterns**: Dialog-based forms for create/edit operations
- **Navigation**: Tab-based detail views with related entity management

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching for React
- **@radix-ui/***: Headless UI components for accessibility-compliant interfaces
- **wouter**: Lightweight React router for client-side navigation

### Development Tools
- **Vite**: Build tool and development server with HMR support
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### Data Processing
- **Zod**: Schema validation and type inference for runtime safety
- **React Hook Form**: Performant form library with minimal re-renders
- **bcryptjs**: Password hashing for secure authentication
- **date-fns**: Date manipulation and formatting utilities

### UI Enhancement Libraries
- **class-variance-authority**: Type-safe CSS class composition
- **clsx**: Conditional CSS class name utility
- **cmdk**: Command palette and search interface component
- **lucide-react**: Modern icon library with React components

### Country Data
- **Static JSON**: Country reference data with ISO codes, names, and flag emojis for international address support