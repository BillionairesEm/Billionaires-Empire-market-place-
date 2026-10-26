# Billionaires Empire Digital Marketplace — Build Pack

This pack is the starting point for the full marketplace build.

## What is included
- `billionaires_empire_marketplace.html` — the existing mobile-friendly front-end preview.
- `database_schema.sql` — a PostgreSQL starting schema for users/creators, products, orders, commissions, and payout records.
- `BUILD_ROADMAP.md` — implementation and launch steps.
- `.env.example` — example configuration names only (never put real secrets in public files).

## Important status
The HTML preview is not a live marketplace. The SQL is a foundation schema, not a deployed database.
No real accounts, file uploads, payments, protected downloads, or payouts are active until the backend is deployed and connected.

## Business rules carried forward
- Marketplace name: Billionaires Empire
- Launch currency: NGN (₦); international currencies later
- Platform commission: 10% of each verified sale
- Payment provider: Flutterwave to be added later
- Creator payouts: automatic only if supported and approved for the configured account; otherwise use a verified payout workflow.

## Suggested implementation order
1. Create the hosted PostgreSQL database and secure backend.
2. Add real authentication and role permissions.
3. Connect product listing and creator dashboard to the backend.
4. Add protected file storage and access-controlled downloads.
5. Add order and commission records; never trust browser-submitted payment success.
6. Integrate Flutterwave later using server-side transaction verification and signed webhooks.
7. Test refunds, failed payments, duplicate webhooks, creator payout details, and admin review.
8. Deploy with HTTPS, privacy terms, creator terms, prohibited-content rules, and customer support contact.

Do not publish `.env` secrets or commit them to a public repository.
