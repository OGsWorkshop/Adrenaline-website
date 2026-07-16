const Stripe = require('stripe');

const PLANS = Object.freeze({
    premium: Object.freeze({
        name: 'Adrenaline Premium access',
        amount: 1799,
        description: 'One-month access',
    }),
    enterprise: Object.freeze({
        name: 'Adrenaline Enterprise access',
        amount: 3999,
        description: 'Three-month access',
    }),
});

const PUBLIC_SITE_ORIGIN = 'https://getadrenaline.dev';

function isValidEmail(email) {
    return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getReturnOrigin(request) {
    const origin = request.headers.origin;
    if (origin === PUBLIC_SITE_ORIGIN || origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') {
        return origin;
    }
    return PUBLIC_SITE_ORIGIN;
}

module.exports = async (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return response.status(500).json({ error: 'Stripe is not configured on the server.' });
    }

    const body = request.body && typeof request.body === 'object' ? request.body : {};
    const plan = PLANS[body.plan];

    if (!plan) {
        return response.status(400).json({ error: 'Please choose a valid plan.' });
    }

    const email = body.email;
    if (email !== undefined && !isValidEmail(email)) {
        return response.status(400).json({ error: 'Please provide a valid email address.' });
    }

    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const trustedUserId = request.user && typeof request.user.id === 'string' ? request.user.id : 'guest';
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'payment',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: plan.amount,
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                    },
                },
                quantity: 1,
            }],
            ...(email ? { customer_email: email } : {}),
            metadata: {
                plan: body.plan,
                user_id: trustedUserId,
            },
            return_url: `${getReturnOrigin(request)}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        });

        return response.json({ clientSecret: session.client_secret });
    } catch (error) {
        console.error('Stripe Checkout Session error:', error);
        return response.status(500).json({ error: 'Checkout could not be started.' });
    }
};

module.exports.PLANS = PLANS;
