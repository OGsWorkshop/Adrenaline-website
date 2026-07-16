const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLAN_AMOUNTS = {
    premium: 699,
    enterprise: 1799,
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { plan } = req.body || {};
        const amount = PLAN_AMOUNTS[plan];

        if (!amount) {
            return res.status(400).json({ error: 'Please choose a valid plan.' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { plan },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'Payment could not be started.' });
    }
};
