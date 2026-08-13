# Fix Card & UI Image Rendering (AVIF to WebP Conversion & Transition)

We will migrate the application to use `.webp` images instead of `.avif` to resolve image rendering issues on the frontend. Since some `.avif` images (like `Fragment.avif`, `spinIcon.avif`, `xp.avif`, `s1b.avif`, `s1p.avif`) do not currently have `.webp` versions, we will first run an automated conversion script to generate WebP alternatives for any AVIF image that doesn't already have one.

Once the WebP assets are fully generated, we will refactor all references in the React codebase, configuration, and database seeding files to use `.webp` exclusively.

## User Review Required

> [!NOTE]
> We will install `sharp` as a root development dependency in the monorepo to handle the image conversion script. It will run once to generate the missing `.webp` files in the public directory and can also be used by Next.js during production optimization.

## Proposed Changes

### 1. Image Conversion Setup & Script

We will write a script `convert-images.js` in the scratch directory that:
1. Scans `apps/web/public/` recursively.
2. Identifies all `.avif` files.
3. If a corresponding `.webp` file does not exist, uses `sharp` to convert the AVIF image to WebP.

---

#### [NEW] [convert-images.js](file:///C:/Users/ansha/.gemini/antigravity-ide/brain/12fe547d-8b02-4b18-ad09-163a2639ccdf/scratch/convert-images.js)

A Node script that recursively finds `.avif` files, checks for corresponding `.webp` files, and converts them using `sharp`.

### 2. Database Seeding Update

We will update the seed files to use WebP paths and to dynamically upgrade existing database rows.

---

#### [MODIFY] [seed.ts](file:///d:/JadeQuest/jlt/jltquest_monorepo/packages/database/prisma/seed.ts)

1. Update avatar image URLs to use `.webp` (e.g. `/avatars/cosmic_explorer_basic.webp`).
2. Update rare card image URLs to use `.webp` (e.g. `/card/collect-1.webp`).
3. Add a post-seed migration loop to update existing avatars and rare cards in the database from `.avif` to `.webp`.

### 3. Frontend UI Components

We will update all `.avif` references to `.webp` in Next.js configurations and React components.

---

#### [MODIFY] [next.config.mjs](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/next.config.mjs)

Change the optimized image formats to prioritize WebP (and optionally keep AVIF if needed, but we will target WebP). Update header rules from matching `.avif` to `.webp` where applicable.

#### [MODIFY] [HeroSection.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/landing/HeroSection.tsx)

Change `/icon/mascot.avif`, `/icon/coin.avif`, `/card/collect-1.avif`, `/card/collect-2.avif`, `/card/collect-3.avif` to `.webp`.

#### [MODIFY] [CollectRaresCard.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/CollectRaresCard.tsx)

Change `/card/collect-3.avif`, `/card/collect-2.avif`, `/card/collect-1.avif` to `.webp`.

#### [MODIFY] [page.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/app/dashboard/collection/page.tsx)

Change fallback defaults `/card/collect-${...}.avif` to `.webp`. Replace `.avif` with `.webp` dynamically on any URL fetched from the database.

#### [MODIFY] [HowItWorksSection.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/landing/HowItWorksSection.tsx)

Change `/icon/spin.avif`, `/icon/coin.avif` to `.webp`.

#### [MODIFY] [FeaturesSection.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/landing/FeaturesSection.tsx)

Change `/icon/spin.avif`, `/icon/flame.avif` to `.webp`.

#### [MODIFY] [CTASection.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/landing/CTASection.tsx)

Change `/icon/mascot.avif`, `/icon/coin.avif` to `.webp`.

#### [MODIFY] [StreakCard.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/StreakCard.tsx)

Change `/icon/flame.avif` to `.webp`.

#### [MODIFY] [SpinToWinCard.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/SpinToWinCard.tsx)

Change `/icon/spin.avif` to `.webp`.

#### [MODIFY] [Sidebar.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/Sidebar.tsx)

Change `/icon/mascot.avif` to `.webp`.

#### [MODIFY] [RarePassCard.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/RarePassCard.tsx)

Change `/rare-pass-bg.avif` to `.webp`.

#### [MODIFY] [LevelCard.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/components/dashboard/LevelCard.tsx)

Change `/badge/starter-badge.avif`, `/badge/bronze-badge.avif`, etc., and `/icon/slide-coin.avif` to `.webp`.

#### [MODIFY] [page.tsx](file:///d:/JadeQuest/jlt/jltquest_monorepo/apps/web/src/app/dashboard/rare-pass/page.tsx)

Change `/icon/xp.avif`, `/icon/spinIcon.avif`, `/icon/Fragment.avif` to `.webp`.

## Verification Plan

### Automated Tests
- Run `node C:\Users\ansha\.gemini\antigravity-ide\brain\12fe547d-8b02-4b18-ad09-163a2639ccdf\scratch\convert-images.js` to perform the image conversions.
- Run database seeding with `pnpm db:seed` to verify it updates successfully and correctly transforms existing records to `.webp`.
- Run frontend type checking with `pnpm --filter web typecheck` to ensure no compilation/type issues.

### Manual Verification
- Check the HTTP response status for the card images.
- Verify that cards render correctly on the UI.
