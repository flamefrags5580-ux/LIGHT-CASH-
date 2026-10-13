# LIGHT CASH 💸

Modern virtual-money digital wallet prototype.

This repository contains a responsive React + TypeScript frontend (Vite + Tailwind) and database migrations for Supabase/Postgres that implement a secure virtual wallet demo with server-side atomic transfers, idempotency protection, and Row Level Security (RLS).

Features
- Authentication (Supabase Auth)
- Wallet dashboard (₱ Philippine pesos, virtual demo)
- Send money with server-side atomic transfer and idempotency
- Add virtual money (demo-only)
- Transaction history with pagination
- Profile and security pages
- Protected admin dashboard (backend-enforced)
- Database migrations with RLS policies and stored procedures
- Tests for transfers and concurrency checks (requires service-role key)

Important
- Do NOT commit any Supabase service_role key or other secrets. Use environment variables.
- This is a virtual-money demo. Funds have no real value.

Getting started (summary)
1. Create a Supabase project at https://app.supabase.com
2. Run the SQL in `supabase/migrations/001_init.sql` in the SQL editor to create tables, policies, and functions.
3. Create a .env.local based on `.env.example` with your PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.
4. Install and run locally:
   - npm install
   - npm run dev

For full setup, deployment, and testing instructions see the README sections below.
