
require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const COMMISSION_BPS = 1000;

// 10% Billionaires Empire commission
if (COMMISSION_BPS !== 1000) {
  throw new Error('Invalid commission configuration');
}

// Secure comparison
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const first = Buffer.from(a);
  const second = Buffer.from(b);

  return first.length === second.length &&
    crypto.timingSafeEqual(first, second);
}

// Flutterwave webhook
app.post(
  '/webhooks/flutterwave',
  express.json({ limit: '100kb' }),
  async (req, res) => {

    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.get('verif-hash');

    if (!secretHash || !safeEqual(signature, secretHash)) {
      return res.status(401).send('Invalid Flutterwave signature');
    }

    const event = req.body;
    const reference = event?.data?.tx_ref ||
      event?.data?.reference;

    const eventType = event?.event || 'unknown';

    if (!reference) {
      return res.status(400).send('Missing transaction reference');
    }

    try {
      await pool.query(
        `INSERT INTO payment_events
        (provider, provider_event_id, provider_reference, event_type, payload)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (provider, provider_event_id)
        DO NOTHING`,
        [
          'flutterwave',
          event?.data?.id ? String(event.data.id) : reference,
          reference,
          eventType,
          event
        ]
      );

      // Verify successful payments with Flutterwave.
      if (
        event?.data?.id &&
        event?.data?.status === 'successful'
      ) {
        const response = await fetch(
          `https://api.flutterwave.com/v3/transactions/${event.data.id}/verify`,
          {
            headers: {
              Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
            }
          }
        );

        const result = await response.json();

        if (
          result.status === 'success' &&
          result.data?.status === 'successful' &&
          result.data?.tx_ref === reference
        ) {
          console.log('Flutterwave payment verified:', reference);

          // Order confirmation and creator payout
          // will be connected after the database
          // order and creator tables are configured.
        }
      }

      return res.sendStatus(200);

    } catch (error) {
      console.error('Flutterwave webhook error:', error.message);
      return res.sendStatus(500);
    }
  }
);

app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'billionaires-empire-payments',
    provider: 'flutterwave'
  });
});

// Public configuration
app.get('/config/public', (_req, res) => {
  res.json({
    currency: process.env.LAUNCH_CURRENCY || 'NGN',
    commissionPercent: COMMISSION_BPS / 100,
    paymentProvider: 'Flutterwave'
  });
});

// Checkout
app.post('/api/checkout', async (_req, res) => {
  return res.status(501).json({
    error: 'Checkout is not enabled yet.',
    nextStep: 'Configure product pricing, creator accounts and Flutterwave split payments.'
  });
});

// Start server
app.listen(port, () => {
  console.log(
    `Billionaires Empire Flutterwave API running on port ${port}`
  );
});
