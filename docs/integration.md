# Future Real-Money Integration

This document explains the boundary design to integrate a payment provider for real-money top-ups/payments.

Key points:
- Keep demo balances separate from real-money ledger tables.
- Use server-side webhooks from payment provider; verify signatures.
- Use a service-role account to listen/validate payment webhooks and credit customer wallets only after full verification.
- Store minimal payment metadata; do not store raw card details.
- Implement reconciliation, idempotency, fraud controls, and KYC as required by PH law.
- Provide an `external_payments` table to store provider reference ids, statuses, and reconciliation flags.

Before enabling real money:
- Consult local PH regulations.
- Obtain necessary licenses/partners.
- Use the payment provider's official SDKs and secure server-side keys.
