// ╔═══════════════════════════════════════════════════════════════╗
// ║  FIX UP IV THERAPY — BACKEND SERVER                           ║
// ║  Node.js + Express + SQLite + Stripe                          ║
// ║                                                                ║
// ║  Features:                                                     ║
// ║   · Customer tracking (first-visit vs returning)              ║
// ║   · Stripe Checkout with Card + Apple Pay + Google Pay        ║
// ║   · Pay-online OR pay-in-person logic                         ║
// ║   · Webhook for verified payment status                       ║
// ║   · Booking lookup endpoints for confirmation pages           ║
// ╚═══════════════════════════════════════════════════════════════╝

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const db = new Database('fixup.db');

// ─────────────────────────────────────────────────────────────────
// DATABASE SETUP
// ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    first_visit_paid INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    drip_name TEXT,
    drip_price INTEGER,           -- in cents
    appointment_date TEXT,
    address TEXT,
    notes TEXT,
    payment_method TEXT,          -- 'online' or 'in_person'
    payment_status TEXT,          -- 'pending', 'paid', 'pay_on_site', 'failed'
    stripe_session_id TEXT,
    stripe_payment_intent TEXT,
    amount_paid INTEGER,          -- in cents, set after webhook
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(stripe_session_id);
  CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
`);

// ─────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK
// MUST be registered BEFORE express.json() because Stripe needs raw body
// ─────────────────────────────────────────────────────────────────
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── Payment succeeded ──
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata.booking_id;
    const customerId = session.metadata.customer_id;

    db.prepare(`
      UPDATE bookings
      SET payment_status = 'paid',
          stripe_payment_intent = ?,
          amount_paid = ?
      WHERE id = ?
    `).run(session.payment_intent, session.amount_total, bookingId);

    db.prepare(`
      UPDATE customers
      SET first_visit_paid = 1,
          total_visits = total_visits + 1
      WHERE id = ?
    `).run(customerId);

    console.log(`✓ Booking #${bookingId} paid: $${(session.amount_total/100).toFixed(2)}`);
  }

  // ── Payment failed/expired ──
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    db.prepare('UPDATE bookings SET payment_status = ? WHERE stripe_session_id = ?')
      .run('failed', session.id);
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────────
// STANDARD MIDDLEWARE (after webhook)
// ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────
// CHECK CUSTOMER STATUS
// Called when user enters email → returns pay-in-person eligibility
// ─────────────────────────────────────────────────────────────────
app.post('/api/check-customer', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  const isReturning = !!(customer && customer.first_visit_paid === 1);

  res.json({
    isReturning,
    canPayInPerson: isReturning,
    mustPayOnline: !isReturning,
    totalVisits: customer ? customer.total_visits : 0
  });
});

// ─────────────────────────────────────────────────────────────────
// CREATE BOOKING
// Handles both online (Stripe) and pay-in-person flows
// ─────────────────────────────────────────────────────────────────
app.post('/api/create-booking', async (req, res) => {
  try {
    const {
      email, name, phone,
      drip, price,
      appointmentDate, address, notes,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!email || !name || !drip || !price || !appointmentDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find or create customer
    let customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(cleanEmail);
    if (!customer) {
      const result = db.prepare(`
        INSERT INTO customers (email, name, phone)
        VALUES (?, ?, ?)
      `).run(cleanEmail, name, phone || null);
      customer = { id: result.lastInsertRowid, first_visit_paid: 0 };
    }

    const isReturning = customer.first_visit_paid === 1;

    // ── ENFORCE: First-time clients MUST pay online ──
    if (!isReturning && paymentMethod === 'in_person') {
      return res.status(400).json({
        error: 'Los clientes nuevos deben pagar en línea para confirmar su primera reserva.',
        code: 'FIRST_VISIT_REQUIRES_ONLINE_PAYMENT'
      });
    }

    // Create booking
    const bookingResult = db.prepare(`
      INSERT INTO bookings
        (customer_id, drip_name, drip_price, appointment_date, address, notes,
         payment_method, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      customer.id,
      drip,
      price,
      appointmentDate,
      address || null,
      notes || null,
      paymentMethod,
      paymentMethod === 'online' ? 'pending' : 'pay_on_site'
    );
    const bookingId = bookingResult.lastInsertRowid;

    // ── PAY IN PERSON FLOW ──
    if (paymentMethod === 'in_person') {
      return res.json({
        success: true,
        bookingId,
        requiresPayment: false,
        redirectUrl: `${process.env.FRONTEND_URL}/fixup-confirmed.html?booking=${bookingId}`
      });
    }

    // ── ONLINE PAYMENT FLOW (Stripe Checkout) ──
    // payment_method_types: 'card' enables card payments
    // Apple Pay & Google Pay are AUTOMATIC on supported devices/browsers
    // when domain is verified in Stripe Dashboard
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      // Card includes Apple Pay & Google Pay automatically
      payment_method_types: ['card'],

      // Use automatic_payment_methods for even broader support (recommended):
      // Comment out payment_method_types above and uncomment this:
      // automatic_payment_methods: { enabled: true },

      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Fix Up IV — ${drip}`,
            description: `Sesión de terapia IV móvil — ${new Date(appointmentDate).toLocaleDateString('es-PR')}`,
            images: [`${process.env.FRONTEND_URL}/og-image.jpg`] // optional, displayed in checkout
          },
          unit_amount: price, // already in cents
        },
        quantity: 1,
      }],

      customer_email: cleanEmail,

      // Metadata helps us link Stripe → our booking
      metadata: {
        booking_id: bookingId.toString(),
        customer_id: customer.id.toString(),
        drip_name: drip
      },

      // Custom fields (optional — collect anything else here)
      // custom_fields: [{
      //   key: 'special_requests',
      //   label: { type: 'custom', custom: 'Solicitudes especiales' },
      //   type: 'text',
      //   optional: true,
      // }],

      // Display options
      locale: 'es', // Spanish checkout UI
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },

      // Where to send user after payment
      success_url: `${process.env.FRONTEND_URL}/fixup-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/fixup-intake-es.html?canceled=1&booking=${bookingId}`,

      // Expire session after 30 min
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    // Save Stripe session ID for webhook lookup
    db.prepare('UPDATE bookings SET stripe_session_id = ? WHERE id = ?')
      .run(session.id, bookingId);

    res.json({
      success: true,
      bookingId,
      requiresPayment: true,
      checkoutUrl: session.url
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// LOOKUP BOOKING BY STRIPE SESSION ID (used by success page)
// ─────────────────────────────────────────────────────────────────
app.get('/api/booking-by-session/:sessionId', (req, res) => {
  const booking = db.prepare(`
    SELECT
      b.id AS booking_id,
      b.drip_name,
      b.drip_price,
      b.appointment_date,
      b.payment_status,
      b.amount_paid,
      c.name AS customer_name,
      c.email AS customer_email
    FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE b.stripe_session_id = ?
  `).get(req.params.sessionId);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// ─────────────────────────────────────────────────────────────────
// LOOKUP BOOKING BY ID (used by pay-in-person confirmation page)
// ─────────────────────────────────────────────────────────────────
app.get('/api/booking/:id', (req, res) => {
  const booking = db.prepare(`
    SELECT
      b.id AS booking_id,
      b.drip_name,
      b.drip_price,
      b.appointment_date,
      b.payment_method,
      b.payment_status,
      c.name AS customer_name,
      c.email AS customer_email
    FROM bookings b
    JOIN customers c ON b.customer_id = c.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: Mark in-person booking as paid (called by nurse after collecting)
// Protect this endpoint in production with auth!
// ─────────────────────────────────────────────────────────────────
app.post('/api/admin/mark-paid/:bookingId', (req, res) => {
  // TODO: add admin authentication here
  const { amount, method } = req.body;

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  db.prepare(`
    UPDATE bookings
    SET payment_status = 'paid',
        amount_paid = ?,
        notes = COALESCE(notes, '') || ' | Paid in person: ' || ?
    WHERE id = ?
  `).run(amount || booking.drip_price, method || 'cash', req.params.bookingId);

  // First in-person payment also unlocks "returning customer" status
  db.prepare(`
    UPDATE customers
    SET first_visit_paid = 1,
        total_visits = total_visits + 1
    WHERE id = ?
  `).run(booking.customer_id);

  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'fixup-iv' }));

// ─────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`╔═══════════════════════════════════════╗`);
  console.log(`║  Fix Up IV Backend running           ║`);
  console.log(`║  Port: ${PORT}                            ║`);
  console.log(`║  Frontend: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`╚═══════════════════════════════════════╝`);
});
