# Billionaires Empire — Payments Backend Starter

This is a **development scaffold**, not a production-ready payment system. It demonstrates the service boundaries and safety checks for a multi-creator digital marketplace.

## Locked-in business settings
- Platform commission: 10%
- Launch currency: NGN
- International currencies: later, after provider/account approval and a separate currency rollout
- Creator payouts: automatic after a provider-verified successful payment, only where the provider and account support the selected payout model

## What is included
- Express API skeleton
- PostgreSQL schema for creators, products, orders, payment events, and payout records
- Server-side order amount/commission calculation
- Webhook signature verification pattern for Paystack
- Explicit TODOs where provider credentials, approved split-payment configuration, and production logic are required

## Important provider distinction
"Automatic payout" does not necessarily mean an instant bank credit. Paystack/Flutterwave split settlement generally follows provider settlement rules and account eligibility. Confirm in writing with your provider whether marketplace split settlement is enabled for your business, who bears fees, and what happens for refunds/chargebacks. If you use a separate transfer API for payouts, implement a queued, idempotent payout worker and reconcile transfer webhooks.

## Setup
1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env`; never commit `.env`.
3. Create a PostgreSQL database and run `schema.sql`.
4. Run `npm install`, then `npm run dev`.
5. Create a verified merchant/business account with a payment provider. Complete all requested identity/business verification.
6. Ask provider support to confirm marketplace/aggregator eligibility, split payments, NGN settlement, creator subaccounts, settlement timing, fees, refund and chargeback liability.
7. Configure test keys and test subaccounts only in the sandbox. Do not accept real payments until webhook, reconciliation, refunds, and security tests pass.

## Suggested initial provider evaluation
- **Paystack:** transaction split/subaccounts; review its official documentation:
  https://paystack.com/docs/payments/split-payments/
  https://paystack.com/docs/payments/multi-split-payments/
- **Flutterwave:** split payments/subaccounts; review its official documentation:
  https://developer.flutterwave.com/docs/split-payments

Do not assume either provider will approve the exact marketplace business model or support instant payouts for every creator. Obtain confirmation before choosing.

## Critical rules before production
- Never put secret keys in browser code or a public repository.
- Never mark an order paid based only on the checkout redirect or a client-side message.
- Verify webhook signatures, then verify payment amount, currency, reference, and status with the provider.
- Process each webhook idempotently; the same event may be delivered more than once.
- Grant file access only after verified payment.
- Do not store raw card data.
- Verify creator identity and bank-account ownership/name before enabling payouts.
- Add rate limiting, audit logs, backups, monitoring, refund handling, chargeback handling, and a reconciliation job.
- Protect paid downloads with expiring signed links; do not expose permanent public file URLs.
- Get qualified Nigerian legal/accounting advice on tax, consumer terms, privacy, and whether the platform's funds flow requires additional regulatory arrangements.

## What is intentionally not active yet
Checkout initialization is a safe placeholder until the provider and split settlement model are confirmed. Creator onboarding, actual bank transfers, refund APIs, file storage, admin controls, and production deployment still need implementation and testing.
