# ADS Paint Center

**Integrated Management System With SMS Notification**
A modern, feature-based web application for retail operations, inventory management, point-of-sale, and customer communications.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Database**: NeonDB (Serverless Postgres) + Drizzle ORM
- **Auth**: NextAuth v5 (Auth.js)
- **Data Fetching**: TanStack Query
- **Validation**: Zod + React Hook Form
- **SMS Integration**: iPROGSMS

## 📦 Features

- **Point of Sale (POS)**: Walk-in & online order processing
- **Customer Management**: Profiles, history, and contact info
- **Inventory Tracking**: Stock monitoring, low-stock alerts, and logging
- **Payment Processing**: Multi-payment support (Downpayment, Full, Balance)
- **SMS Notifications**: Automated SMS for order confirmations, pickups, and payments

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 20+
- pnpm 10+
- NeonDB Account
- iPROGSMS API Key

### 2. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env.local
```
Update `.env.local` with your:
- `DATABASE_URL` (NeonDB connection string)
- `AUTH_SECRET` (Use `openssl rand -base64 32` to generate a new secret)
- `IPROGSMS_API_KEY` (iPROGSMS student account key)

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup
Push the Drizzle schema to your NeonDB instance:
```bash
pnpm db:push
```

### 5. Start the Server
```bash
pnpm dev
```
Navigate to `http://localhost:3000`. You will be redirected to the `/login` page.

## 🗄️ Project Structure (Feature-Based)

```text
src/
├── app/                 # Next.js App Router (pages & API routes)
├── components/          # Shared layout & UI components (Shadcn)
├── config/              # App-wide config (navigation, status colors)
├── features/            # Feature modules (auth, dashboard, pos, inventory...)
│   └── [feature]/
│       ├── components/  # Feature-specific React components
│       ├── hooks/       # Custom React hooks
│       ├── queries/     # TanStack query definitions
│       ├── server/      # Server Actions
│       └── types.ts     # Feature-specific types
├── lib/                 # Core utilities (DB, Auth, SMS, validations)
└── types/               # Global TypeScript types & NextAuth overrides
```

## 📜 Built For
This system was developed as a thesis project for Tanauan Institute, Inc. (B.S. Computer Science).

**Developers**:
- Bautista, George C.
- Lacorte, John Lyndon S.

*(2025-2026)*
