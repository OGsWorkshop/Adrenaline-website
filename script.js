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
        document.getElementById('plan-price').textContent = amount === 2999 ? '$29.99' : '$24.99';
        document.getElementById('total-price').textContent = amount === 2999 ? '$29.99' : '$24.99';
        document.getElementById('pay-amount').textContent = amount === 2999 ? '29.99' : '24.99';
    } else {
        currentAmount = 299;
        currentPlan = 'premium';
        document.getElementById('plan-name').textContent = 'Premium Plan';
        document.getElementById('plan-price').textContent = '$2.99';
        document.getElementById('total-price').textContent = '$2.99';
        document.getElementById('pay-amount').textContent = '2.99';
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
    submitBtn.querySelector('.btn-checkout-text').classList.add('hidden');
    submitBtn.querySelector('.btn-checkout-loader').classList.remove('hidden');

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
            if (document.getElementById('payment-success')) {
                document.getElementById('payment-form').classList.add('hidden');
                document.getElementById('payment-success').classList.remove('hidden');
                document.querySelector('.checkout-title').textContent = 'Payment Successful!';
                document.querySelector('.checkout-subtitle').textContent = 'Welcome to the Adrenaline family.';
                triggerConfetti();
            } else {
                showToast('Payment successful! Check your email for download link.', 'success');
                closeStripeModal();
            }
            setTimeout(() => window.open(LINKVERTISE_URL, '_blank'), 1500);
        }
    } catch (err) {
        if (document.querySelector('.card-errors')) {
            document.querySelector('.card-errors').textContent = err.message || 'Payment failed. Please try again.';
        }
        showToast(err.message || 'Payment failed. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-checkout-text').classList.remove('hidden');
        submitBtn.querySelector('.btn-checkout-loader').classList.add('hidden');
    }
});

function triggerConfetti() {
    const colors = ['#8A5DF4', '#b388ff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];
    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed; z-index: 9999; pointer-events: none;
            width: ${6 + Math.random() * 6}px; height: ${6 + Math.random() * 6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            left: ${Math.random() * 100}vw; top: -10px;
            animation: confettiFall ${1.5 + Math.random() * 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

function filterDocs(query) {
    const links = document.querySelectorAll('.docs-link');
    const categories = document.querySelectorAll('.docs-category');
    query = query.toLowerCase().trim();
    links.forEach(link => {
        const text = link.textContent.toLowerCase();
        link.style.display = !query || text.includes(query) ? '' : 'none';
    });
    categories.forEach(cat => {
        const visible = [...cat.querySelectorAll('.docs-link')].some(l => l.style.display !== 'none');
        cat.style.display = !query || visible ? '' : 'none';
        if (query) cat.classList.remove('collapsed');
        else cat.classList.add('collapsed');
    });
}

function toggleDocsSidebar() {
    document.getElementById('docs-sidebar').classList.toggle('docs-sidebar-open');
    document.querySelector('.docs-sidebar-toggle').classList.toggle('is-open');
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

function toggleBilling() {}
function selectPlan(plan) {}
function proceedToCheckout(plan) {
    if (plan === 'premium') {
        currentAmount = 299;
        currentPlan = 'premium';
        document.getElementById('checkout-plan-name').textContent = 'Premium Plan';
        document.getElementById('checkout-subtotal').textContent = '$2.99';
        document.getElementById('checkout-billing').textContent = 'Weekly';
        document.getElementById('checkout-total').textContent = '$2.99';
        document.getElementById('pay-amount').textContent = '$2.99';
    } else {
        currentAmount = 2999;
        currentPlan = 'enterprise';
        document.getElementById('checkout-plan-name').textContent = 'Enterprise Plan';
        document.getElementById('checkout-subtotal').textContent = '$29.99';
        document.getElementById('checkout-billing').textContent = 'Lifetime';
        document.getElementById('checkout-total').textContent = '$29.99';
        document.getElementById('pay-amount').textContent = '$29.99';
    }
    document.getElementById('checkout-section').classList.remove('hidden');
    document.getElementById('payment-success').classList.add('hidden');
    document.getElementById('payment-form').classList.remove('hidden');
    document.querySelector('.checkout-title').textContent = 'Complete Payment';
    document.querySelector('.checkout-subtitle').textContent = 'Secure payment via Stripe';
    document.body.style.overflow = 'hidden';
    initializeStripe();
}

function closeCheckout() {
    document.getElementById('checkout-section').classList.add('hidden');
    document.body.style.overflow = '';
}

function downloadAfterPurchase() {
    linkvertiseRedirect();
    closeCheckout();
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
        <a href="/" onclick="this.closest('.mobile-menu').remove()">Home</a>
        <a href="/pricing" onclick="this.closest('.mobile-menu').remove()">Pricing</a>
        <a href="/docs" onclick="this.closest('.mobile-menu').remove()">Docs</a>
        <a href="/pricing" class="btn btn-primary btn-full" onclick="this.closest('.mobile-menu').remove()">Get Premium</a>
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

const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === currentPath || (currentPath === '/' && href === '/'));
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
