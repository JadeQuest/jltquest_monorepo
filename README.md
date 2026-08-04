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

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Development Mode
Start all apps (`web`, `api`, `mobile`) in development mode using Turborepo:
```bash
pnpm run dev
```

### 3. Build All Projects
```bash
pnpm run build
```

### 4. Typecheck All Projects
```bash
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
