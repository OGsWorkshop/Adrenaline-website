const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const eventLogPath = path.join(__dirname, '..', 'data', 'stripe-events.json');
let processedEvents = loadProcessedEvents();

function loadProcessedEvents() {
    try {
        const contents = fs.readFileSync(eventLogPath, 'utf8');
        const events = JSON.parse(contents);
        return new Set(Array.isArray(events) ? events.map(event => event.id).filter(Boolean) : []);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error('Stripe event log could not be read:', error);
        return new Set();
    }
}

function persistEvent(event) {
    fs.mkdirSync(path.dirname(eventLogPath), { recursive: true });
    let events = [];
    try {
        events = JSON.parse(fs.readFileSync(eventLogPath, 'utf8'));
        if (!Array.isArray(events)) events = [];
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
    events.push({ id: event.id, type: event.type, sessionId: event.data.object.id, receivedAt: new Date().toISOString() });
    fs.writeFileSync(eventLogPath, JSON.stringify(events.slice(-1000), null, 2));
}

module.exports = (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return response.status(500).json({ error: 'Stripe webhook is not configured on the server.' });
    }

    const signature = request.headers['stripe-signature'];
    if (!signature || !Buffer.isBuffer(request.rawBody)) {
        return response.status(400).json({ error: 'Missing raw webhook body or signature.' });
    }

    let event;
    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        event = stripe.webhooks.constructEvent(request.rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        console.error('Stripe webhook signature verification failed:', error.message);
        return response.status(400).json({ error: 'Invalid webhook signature.' });
    }

    if (processedEvents.has(event.id)) {
        return response.json({ received: true, duplicate: true });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            if (session.payment_status === 'paid') {
                // Replace this durable event-log action with order/access fulfillment when a database is added.
                console.log('Checkout paid:', {
                    sessionId: session.id,
                    plan: session.metadata?.plan || 'unknown',
                    userId: session.metadata?.user_id || 'guest',
                    customerEmail: session.customer_details?.email || null,
                });
            }
        }

        persistEvent(event);
        processedEvents.add(event.id);
        return response.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook processing failed:', error);
        return response.status(500).json({ error: 'Webhook processing failed.' });
    }
};
