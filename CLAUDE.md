# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Nuxt 4 application for the Ghana Creative Arts Board platform. The platform serves artists, industry stakeholders, government officials, and the general public.

**Current Phase**: Foundation setup complete - database schema, authentication modules, and styling framework configured.

**Future Features**: Radio streaming (AzuraCast), video streaming (YouTube/Facebook), data visualization, and AI-powered features.

## Development Commands

**Install dependencies:**
```bash
npm install
```

**Start development server (localhost:3000):**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Generate static site:**
```bash
npm run generate
```

**Preview production build:**
```bash
npm run preview
```

**Database commands:**
```bash
# Run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate

# Reset database (caution: deletes all data)
npx prisma migrate reset
```

## Architecture

### Tech Stack

- **Frontend**: Nuxt 4.3.1, Vue 3, Tailwind CSS
- **Backend**: Prisma 6.3.0, PostgreSQL
- **Authentication**: nuxt-auth-utils (session-based)
- **Validation**: Zod, VeeValidate
- **State Management**: Pinia
- **Styling**: Tailwind CSS with Ghana flag colors (red, gold, green)

### Project Structure

- **app/app.vue**: Main application entry point
- **nuxt.config.ts**: Nuxt configuration with modules and runtime config
- **prisma/schema.prisma**: Complete database schema with 20+ models
- **tailwind.config.ts**: Tailwind configuration with custom Ghana theme
- **assets/css/main.css**: Global styles and Tailwind directives

### Nuxt Directory Conventions

When adding features, follow Nuxt's auto-import conventions:

- **pages/**: File-based routing (auto-generates routes)
- **components/**: Auto-imported Vue components
- **composables/**: Auto-imported composables
- **layouts/**: Application layouts
- **middleware/**: Route middleware
- **server/**: Server API routes and middleware
- **plugins/**: Vue plugins
- **utils/**: Auto-imported utility functions
- **public/**: Static assets served at root

## Key Configuration

- **Compatibility date**: 2025-07-15
- **Devtools**: Enabled
- **TypeScript**: Strict mode enabled
- **Database**: PostgreSQL on localhost:5433
- **Session**: Secure session-based authentication with httpOnly cookies

## Database Schema

The database includes comprehensive models for:

- **Authentication**: User, Session, VerificationToken, PasswordReset
- **RBAC**: Role, Permission, UserRole, RolePermission
- **User Profiles**: ArtistProfile, StakeholderProfile, GovernmentProfile
- **Content Management**: Content, ContentReport
- **System**: Notification, AuditLog, SystemSetting, DailyStats

**User Types**: ARTIST, STAKEHOLDER, GOVERNMENT, PUBLIC, ADMIN
**User Statuses**: PENDING_VERIFICATION, ACTIVE, SUSPENDED, BANNED, INACTIVE
**Content Types**: AUDIO, VIDEO, IMAGE, DOCUMENT, LIVE_STREAM

## Installed Modules

- `@nuxtjs/tailwindcss` - Tailwind CSS integration
- `nuxt-auth-utils` - Session-based authentication
- `@pinia/nuxt` - State management
- `@vee-validate/nuxt` - Form validation
- `@headlessui/vue` - Unstyled UI components
- `@heroicons/vue` - Icon library
- Additional utilities: zod, bcrypt, dayjs, slugify, nanoid
