# Copilot Instructions

## Tech Stack

- **Next.js**: 16.2.1 (App Router ONLY)
- **Tailwind CSS**: 4.x
- **React**: 19.2.4
- **TypeScript**: 5.x

## Coding Conventions

- **Components**: Server Component by default (Client Component only when necessary with `'use client'`)
- **Styling**: Tailwind CSS only (no CSS-in-JS libraries, no plain CSS)
- **Architecture**: App Router structure, no Pages Router
- **Type Safety**: Always use TypeScript with proper types

## Known AI Mistakes

- ❌ **DO NOT** use `next/router` → use `next/navigation` instead
- ❌ **DO NOT** use Pages Router → use App Router only
- ❌ **DO NOT** forget `await` on `params` in Server Components
- ❌ **DO NOT** import external CSS libraries or use CSS Modules
- ❌ **DO NOT** mix Client and Server Component patterns incorrectly
