# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Next.js + TypeScript project for internal legal-tech and operations tooling. Optimize for correctness, maintainability, and fast iteration.

## Core priorities

- Keep changes small and focused.
- Prefer existing patterns in the repo over introducing new ones.
- Preserve production safety, especially around auth, data handling, and API contracts.
- Default to App Router conventions for Next.js.

## Working style

- Use pnpm when package scripts are needed.
- Prefer TypeScript types over interfaces unless the repo already uses interfaces in a file.
- Keep UI accessible: semantic HTML, keyboard support, visible focus states, sufficient contrast.
- Use server components by default; add client components only when interactivity requires them.
- Keep route handlers thin; move validation and business logic into reusable modules.

## Key commands

- `pnpm dev` — run the app locally
- `pnpm lint` — lint the codebase
- `pnpm typecheck` — run TypeScript checks
- `pnpm test` — run the test suite
- `pnpm test:e2e` — run end-to-end tests if present
- `pnpm build` — production build

## Review and fix workflow

- Before major changes, use `/project:review` to inspect current work.
- Use `/project:fix-issue` for bug-driven work or ticket-based changes.
- When a convention repeats in review comments, add it here or to `.claude/rules/`.

## Project conventions

- Put shared policy in `.claude/rules/`.
- Put reusable workflows in `.claude/commands/`.
- Put team-shared config in `.claude/settings.json`.
- Put personal project overrides in `.claude/settings.local.json`.
- Keep secrets out of git and out of chat.

## Next.js notes

- Use Route Handlers in `app/api/**/route.ts` for HTTP endpoints.
- Validate all request input at the edge.
- Return stable response shapes and intentional status codes.
- Treat dynamic route params as async in Route Handlers when applicable.

## Test expectations

- Add or update tests for behavior changes.
- Favor behavior-driven assertions over implementation details.
- Cover unhappy paths for API and form changes.
