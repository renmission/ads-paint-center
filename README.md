# ADS Paint Center Integrated Management System

**ADS Paint Center Integrated Management System with SMS Notification**
A web-based, locally hosted management system designed to automate and integrate the core business operations of ADS Paint Center in Sto. Tomas, Batangas.

> Undergraduate Thesis — Tanauan Institute, Inc. | Bachelor of Science in Computer Science | 2025

---

## Overview

ADS Paint Center is a retail business engaged in the sale of paints, coatings, and related construction and finishing supplies. This system replaces manual and semi-manual business processes with a centralized platform for managing customer records, sales transactions, billing, inventory monitoring, and automated SMS-based customer notifications.

---

## Features

| Module                   | Description                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **Customer Management**  | Register and manage customer profiles and transaction history                            |
| **Staff Management**     | CRUD operations for store personnel with role-based access                               |
| **Inventory Management** | Real-time stock tracking, low-stock alerts, product catalog                              |
| **POS / Sales**          | Checkout interface, billing, receipt generation, auto inventory deduction                |
| **SMS Notifications**    | Automated alerts for order confirmations, approvals, and low-stock warnings via iPROGSMS |
| **Reporting**            | Sales summaries and inventory reports for business monitoring                            |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** NeonDB (PostgreSQL) via Drizzle ORM
- **Auth:** NextAuth v5 (JWT strategy, role-based access)
- **UI:** Shadcn UI + Tailwind CSS v4
- **SMS:** iPROGSMS API
- **Package Manager:** pnpm

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A NeonDB (PostgreSQL) database
- iPROGSMS account and API token

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Auth
AUTH_SECRET=your_nextauth_secret

# SMS
IPROGSMS_TOKEN=your_iprogsms_api_token
IPROGSMS_SENDER=your_sender_name
```

### Database Setup

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed

# Reset and re-migrate (fresh start)
pnpm db:reset && pnpm db:migrate

# Open Drizzle Studio (DB browser)
pnpm db:studio
```

### Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/               # Next.js App Router pages and route handlers
├── features/          # Feature modules (auth, users, inventory, sales, etc.)
└── shared/
    ├── components/    # Shared UI (ui/, layout/, dashboard/, providers/)
    ├── lib/           # Utilities (db/, auth.config.ts, auth.ts, utils.ts)
    ├── config/        # nav.ts, site.ts
    └── types/         # next-auth.d.ts
```

Path alias `@/*` resolves to `src/*`.

---

## Key Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Lint the codebase
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run unit/component tests
pnpm test:e2e     # Run end-to-end tests
```

---

## Roles & Access

| Role            | Access                                            |
| --------------- | ------------------------------------------------- |
| `administrator` | Full access — inventory, staff, reports, settings |
| `staff`         | POS, customer records, product request processing |

**Development credentials:**

| Role          | Email                 | Password   |
| ------------- | --------------------- | ---------- |
| Administrator | `admin@adspaints.com` | `admin123` |

---

## Authors

- **Lacorte, John Lyndon S.**
- **Bautista, George C.**

Tanauan Institute, Inc. — College of Computer Science, 2025
Adviser: Mr. Michael A. Velasquez
