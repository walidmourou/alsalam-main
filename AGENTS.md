cat << 'EOF' > AGENTS.md

# Next.js Project Context & Guidelines

## Stack & Architecture

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS
- **Database & State:** Server Actions in `app/actions/` with `'use server'`

## Code & Conventions

- Use `export default function` for page and layout components.
- Keep server-side database/API logic inside `lib/` or `app/actions/`.
- Ensure all component props and server action responses have explicit TypeScript interfaces.
- Always handle loading (`loading.tsx`) and error states (`error.tsx`) for dynamic pages.

## Verification & Commands

- **Dev Server:** `npm run dev`
- **Type Checking:** `npx tsc --noEmit`
- **Linting:** `npm run lint`
