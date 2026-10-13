Supabase migrations and notes

Run the SQL in `supabase/migrations/001_init.sql` in the Supabase SQL editor (or via psql against your database).

Notes:
- The migration creates profiles, wallets, transactions, idempotency_records, admin_audit_logs.
- It provides `transfer_virtual` and `add_demo_funds` functions which are atomic and use FOR UPDATE locking.
- Idempotency is implemented via `idempotency_records` to prevent duplicate processing.
- Ensure you run this migration with a privileged account (e.g., via the SQL editor in Supabase).

After running migrations:
- Set up RLS policies in Supabase (see documentation in README). The SQL sets no RLS policies automatically — create policies in Supabase UI to restrict access.
