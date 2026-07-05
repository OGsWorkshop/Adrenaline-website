const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')('sk_test_XXXXXXXXXXXXXXXXXXXXXXXX');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, plan } = req.body;

        if (!amount || amount < 50) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { plan },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
