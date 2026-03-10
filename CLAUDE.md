# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start development server
- `pnpm build` — production build
- `pnpm lint` — run ESLint

## New Feature or Bug Fix

**IMPORATANT** Always create a git branch before starting any feature or bug fix. Work in that branch for the entire session — do not switch branches mid-session.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind CSS v4 · Drizzle ORM · NeonDB (PostgreSQL) · NextAuth.js v5 · Shadcn UI · iPROGSMS

**Purpose:** Point-of-Sale and inventory management system for a paint store with two roles: Administrator and Staff/Cashier.

**App Router layout** lives in `src/app/`. Path alias `@/*` resolves to `src/*`.

**Tailwind v4** — no `tailwind.config.js`; theming is done via `@theme` inside `src/app/globals.css`.

**Database** (not yet wired up): Drizzle ORM connecting to NeonDB via `DATABASE_URL`. Key schema entities: Users/Staff, Customers, Products, Inventory, Sales Transactions, Requests.

**Auth:** NextAuth.js v5 with RBAC (Administrator vs Staff/Cashier). Uses `AUTH_SECRET` / `NEXTAUTH_SECRET`.

**SMS notifications:** iPROGSMS API (`IPROGSMS_API_KEY`, `IPROGSMS_BASE_URL`) for order confirmations, request approvals, low-stock alerts, etc.

## Environment Variables

```
DATABASE_URL
NEXT_PUBLIC_APP_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
AUTH_SECRET
IPROGSMS_API_KEY
IPROGSMS_BASE_URL
```

## Development Phases (per docs/Project_Plan.md)

1. Core scaffolding — Drizzle ORM, NextAuth, Shadcn UI layout
2. Customer & User management
3. Inventory management
4. Request & POS/Sales module
5. SMS notifications
6. Reporting & evaluation
