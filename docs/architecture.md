# JLTQuest Monorepo Architecture

## Workspace Structure

```
jltquest_monorepo/
├── apps/
│   ├── web/                  # Next.js (App Router, React, Tailwind CSS)
│   ├── api/                  # Backend Service (Express/TypeScript)
│   └── mobile/               # Mobile App (Expo React Native)
│
├── packages/
│   ├── ui/                   # Shared React components (@jlt/ui)
│   ├── types/                # Shared TypeScript definitions (@jlt/types)
│   ├── utils/                # Shared utility functions (@jlt/utils)
│   ├── config/               # Shared TSConfig & ESLint (@jlt/config)
│   ├── constants/            # Shared constants (@jlt/constants)
│   ├── hooks/                # Shared React hooks (@jlt/hooks)
│   ├── validation/           # Shared Zod schemas (@jlt/validation)
│   ├── api-client/           # Shared API client SDK (@jlt/api-client)
│   └── database/             # Prisma database schema & client (@jlt/database)
│
├── scripts/                  # Development & build scripts
├── docs/                     # Documentation
├── .github/workflows/        # CI/CD pipelines
├── .vscode/                  # Workspace settings
└── turbo.json                # Turborepo orchestration pipeline
```

## Workflows & Scripts

- `pnpm dev`: Start all apps & services in parallel using Turborepo
- `pnpm build`: Build all workspace packages and applications
- `pnpm lint`: Run ESLint across all workspaces
- `pnpm typecheck`: Run TypeScript type-checking
