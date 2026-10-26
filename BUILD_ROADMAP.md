# Billionaires Empire — production build roadmap

## Phase 1 — Core accounts and marketplace
- Hosted PostgreSQL database.
- Secure sign-up/sign-in, email verification, password reset, and role-based permissions.
- Creator profile and store name.
- Product creation/editing with draft and review states.
- Admin approval before products become public.
- Marketplace search, category filters, and product pages.

## Phase 2 — Digital file delivery
- Private object storage for paid files.
- File type/size checks and malware scanning where available.
- Short-lived, authenticated download links after a verified paid order.
- No permanent public links to paid files.

## Phase 3 — Orders and 10% commission
- Create a pending order on the server.
- Verify payment with the payment provider from the server.
- Mark paid only after authoritative provider verification.
- Use an idempotent webhook handler so duplicate notifications cannot create duplicate earnings.
- Example: ₦10,000 sale → ₦1,000 platform fee → ₦9,000 creator share before other applicable fees.
- Handle refunds, disputes, and chargebacks with ledger adjustments.

## Phase 4 — Flutterwave integration (later)
- Create/verify the appropriate Flutterwave business account.
- Keep secret keys only in server environment variables.
- Create checkout sessions on the server.
- Verify transaction status and amount/currency against the order.
- Verify webhook signatures and prevent replay/duplicate processing.
- Confirm the provider's supported marketplace split/payout model for the user's account before promising automatic payouts.

## Phase 5 — launch readiness
- Test customer, creator, and admin flows.
- Test failed payments, cancelled checkout, refunds, duplicate webhook delivery, and unauthorized downloads.
- Add privacy policy, terms of service, creator agreement, refund policy, prohibited-content policy, and support contact.
- Deploy over HTTPS and configure backups, logging, rate limits, and monitoring.

## Phone-friendly workflow
You can review the preview on your phone, but deploying the production system will require setting up a hosting account and following configuration steps. Never send passwords, OTPs, API keys, or bank details in chat.
