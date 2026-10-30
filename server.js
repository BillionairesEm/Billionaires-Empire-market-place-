require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const COMMISSION_BPS = Number(process.env.PLATFORM_COMMISSION_BPS || 1000);

if (COMMISSION_BPS !== 1000) {
  console.warn('Configured commission differs from the selected 10%. Confirm intentional changes.');
}

// Webhook route uses raw bytes so the signature is checked against the original request body.
app.post('/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.get('x-paystack-signature');
    if (!secret || !signature || !Buffer.isBuffer(req.body)) {
      return res.status(400).send('Missing webhook verification data');
    }

    const expected = crypto.createHmac('sha512', secret).update(req.body).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).send('Invalid webhook signature');
    }

    let event;
    try { event = JSON.parse(req.body.toString('utf8')); }
    catch { return res.status(400).send('Invalid JSON'); }

    // Acknowledge only after durable storage/processing. Add a DB transaction and
    // provider API verification before marking an order paid in production.
    const reference = event?.data?.reference;
    const eventType = event?.event || 'unknown';
    if (!reference) return res.status(400).send('Missing payment reference');

    try {
      await pool.query(
        `INSERT INTO payment_events
         (provider, provider_event_id, provider_reference, event_type, payload)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (provider, provider_event_id) DO NOTHING`,
        ['paystack', event?.data?.id ? String(event.data.id) : null,
         reference, eventType, event]
      );

      if (eventType === 'charge.success') {
        // TODO: call Paystack verify-transaction API from server and check:
        // status=success, reference, exact expected amount in minor units, currency,
        // and that the order is still pending. Use a DB transaction + row lock.
        // Then mark order paid, create one unique payout record, and unlock download.
        // If using provider split settlement, confirm provider has already applied
        // the approved split and record settlement metadata instead of double-paying.
      }
      return res.sendStatus(200);
    } catch (err) {
      console.error('Webhook persistence failed', err.message);
      return res.sendStatus(500);
    }
  }
);

app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => res.json({ ok: true, service: 'billionaires-empire-payments' }));

app.get('/config/public', (_req, res) => res.json({
  currency: process.env.LAUNCH_CURRENCY || 'NGN',
  commissionPercent: COMMISSION_BPS / 100,
  note: 'Public settings only; no secret keys are returned.'
}));

app.post('/api/checkout', async (req, res) => {
  // TODO: authenticate/rate-limit request; validate product is published;
  // load price and creator from DB (never trust client-supplied amount);
  // confirm creator is approved and provider subaccount is configured;
  // calculate commission using integer minor units and a documented rounding rule;
  // create pending order with random UUID/reference;
  // initialize provider checkout with the verified amount, NGN, and approved split;
  // return only the provider's checkout URL to the client.
  return res.status(501).json({
    error: 'Checkout is not enabled yet.',
    nextStep: 'Configure provider credentials and approved marketplace split settlement first.'
  });
});

app.listen(port, () => console.log(`Billionaires Empire API listening on ${port}`));
