# JLTQuest Monorepo

A clean, scalable **PNPM Monorepo** architecture designed for modern full-stack web, API, and mobile development.

## Monorepo Architecture

```
my-monorepo/
│
├── apps/
│   ├── web/                  # Next.js (Frontend)
│   ├── api/                  # Backend (Express/TypeScript)
│   └── mobile/               # React Native (Expo)
│
├── packages/
│   ├── ui/                   # Shared React components (@jlt/ui)
│   ├── types/                # Shared TypeScript types (@jlt/types)
│   ├── utils/                # Shared utility functions (@jlt/utils)
│   ├── config/               # ESLint, Prettier, TSConfig (@jlt/config)
│   ├── constants/            # Shared constants (@jlt/constants)
│   ├── hooks/                # Shared React hooks (@jlt/hooks)
│   ├── validation/           # Zod schemas (@jlt/validation)
│   ├── api-client/           # Axios/Fetch SDK (@jlt/api-client)
│   └── database/             # Prisma schemas & client (@jlt/database)
│
├── scripts/                  # Setup, generate, release scripts
├── docs/                     # Architectural documentation
├── .github/workflows/        # CI/CD workflows
├── .vscode/                  # Workspace settings
├── package.json              # Workspace root configuration
├── pnpm-workspace.yaml       # PNPM workspace definition
├── turbo.json                # Turborepo task pipeline
└── tsconfig.json             # Root TypeScript config
```

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **PNPM**: `npm i -g pnpm` (v10.0.0 supported)
- **PostgreSQL**: Local PostgreSQL instance or cloud PostgreSQL URL

### 2. Environment Setup
Copy `.env.example` to `.env` in the root directory (and update `DATABASE_URL` if using a local database):
```bash
cp .env.example .env
```

### 3. Install Dependencies & Generate Prisma Client
```bash
pnpm install
```
*(Note: `postinstall` automatically runs `pnpm db:generate` to generate the Prisma Client).*

### 4. Database Setup & Seeding
Push the database schema to your PostgreSQL database and seed initial system data (Quests, Avatars, System Config, Rare Pass Season):
```bash
pnpm db:push
pnpm db:seed
```

Or run the all-in-one setup command:
```bash
pnpm setup
```

### 5. Development Mode
Start all apps (`web`, `api`, `mobile`) in development mode using Turborepo:
```bash
pnpm run dev
```

To run web and API only (without mobile):
```bash
pnpm run dev:no-mobile
```

### 6. Build & Typecheck All Projects
```bash
pnpm run build
pnpm run typecheck
```

## Technology Stack

| App / Layer | Technology |
| :--- | :--- |
| **Frontend App** | Next.js (App Router), React 19 |
| **Backend API** | Express, TypeScript |
| **Mobile App** | Expo React Native |
| **Database** | PostgreSQL + Prisma Schema |
| **Validation** | Zod Schemas |
| **Task Runner** | Turborepo |
| **Package Manager** | PNPM Workspaces |
