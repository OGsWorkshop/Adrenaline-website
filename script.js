const LINKVERTISE_URL = 'https://linkvertise.com/your-link-here';
const STRIPE_PUBLISHABLE_KEY = window.STRIPE_KEY || 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX';
const API_ENDPOINT = '/api/create-payment-intent';

let stripe;
let elements;
let paymentIntentId = null;
let currentPlan = 'premium';
let currentAmount = 999;

function linkvertiseRedirect() {
    window.open(LINKVERTISE_URL, '_blank');
    showToast('Redirecting to download...', 'success');
}

function openStripeModal(amount) {
    if (amount) {
        currentAmount = amount;
        currentPlan = 'enterprise';
        document.getElementById('plan-name').textContent = 'Enterprise Plan';
        document.getElementById('plan-price').textContent = '$24.99';
        document.getElementById('total-price').textContent = '$24.99';
        document.getElementById('pay-amount').textContent = '24.99';
    } else {
        currentAmount = 999;
        currentPlan = 'premium';
        document.getElementById('plan-name').textContent = 'Premium Plan';
        document.getElementById('plan-price').textContent = '$9.99';
        document.getElementById('total-price').textContent = '$9.99';
        document.getElementById('pay-amount').textContent = '9.99';
    }
    document.getElementById('stripe-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    initializeStripe();
}

function closeStripeModal() {
    document.getElementById('stripe-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

async function initializeStripe() {
    if (!stripe) {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        elements = stripe.elements();
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Inter, sans-serif',
                    '::placeholder': { color: '#666666' },
                },
                invalid: { color: '#ef4444' },
            },
        });
        cardElement.mount('#card-element');
        cardElement.on('change', ({ error }) => {
            const displayError = document.getElementById('card-errors');
            displayError.textContent = error ? error.message : '';
        });
    }
}

document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: currentAmount, plan: currentPlan }),
        });

        if (!response.ok) {
            throw new Error('Failed to create payment');
        }

        const { clientSecret } = await response.json();

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement('card') },
        });

        if (error) {
            throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
            showToast('Payment successful! Check your email for download link.', 'success');
            closeStripeModal();
            setTimeout(() => {
                window.open(LINKVERTISE_URL, '_blank');
            }, 1000);
        }
    } catch (err) {
        showToast(err.message || 'Payment failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Pay $<span id="pay-amount">' + (currentAmount / 100).toFixed(2) + '</span>';
    }
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

function toggleMobileMenu() {
    const existing = document.querySelector('.mobile-menu');
    if (existing) {
        existing.remove();
        return;
    }
    const menu = document.createElement('div');
    menu.className = 'mobile-menu active';
    menu.innerHTML = `
        <a href="#features" onclick="this.closest('.mobile-menu').remove()">Features</a>
        <a href="#pricing" onclick="this.closest('.mobile-menu').remove()">Pricing</a>
        <a href="#download" onclick="this.closest('.mobile-menu').remove()">Download</a>
        <button class="btn btn-primary btn-full" onclick="openStripeModal(); this.closest('.mobile-menu').remove()">Purchase</button>
    `;
    document.body.appendChild(menu);
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.mobile-menu') || e.target.closest('.mobile-menu-btn')) return;
    const menu = document.querySelector('.mobile-menu');
    if (menu && !menu.contains(e.target)) {
        menu.remove();
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.5s ease';
    observer.observe(el);
});
