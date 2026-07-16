const LINKVERTISE_URL = 'https://linkvertise.com/your-link-here';
const STRIPE_PUBLISHABLE_KEY = window.STRIPE_PUBLISHABLE_KEY || window.STRIPE_KEY || 'pk_test_REPLACE_ME';
const API_ENDPOINT = '/api/create-payment-intent';

const PLANS = {
    premium: { name: 'Premium access', duration: 'Valid for one month', amount: 1799, display: '$17.99' },
    enterprise: { name: 'Enterprise access', duration: 'Valid for three months', amount: 3999, display: '$39.99' },
};

let stripe;
let stripeElements;
let cardNumber;
let cardExpiry;
let cardCvc;
let currentPlan = 'premium';

function linkvertiseRedirect() {
    if (LINKVERTISE_URL.includes('your-link-here')) {
        showToast('The download link has not been connected yet.', 'error');
        return;
    }
    window.open(LINKVERTISE_URL, '_blank', 'noopener,noreferrer');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.add('hidden'), 3600);
}

function initAmbientBackground() {
    const canvas = document.querySelector('.ambient-canvas');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = canvas.getContext('2d');
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35, targetX: window.innerWidth * 0.5, targetY: window.innerHeight * 0.35 };
    const particles = Array.from({ length: 38 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.7 + .4,
        speed: Math.random() * .18 + .04,
        phase: Math.random() * Math.PI * 2,
    }));

    function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(time) {
        pointer.x += (pointer.targetX - pointer.x) * .025;
        pointer.y += (pointer.targetY - pointer.y) * .025;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach((particle, index) => {
            particle.y -= particle.speed;
            if (particle.y < -10) particle.y = window.innerHeight + 10;
            const drift = Math.sin(time * .00035 + particle.phase) * .35;
            const x = particle.x + drift;
            const distance = Math.hypot(x - pointer.x, particle.y - pointer.y);
            const alpha = Math.max(.08, .34 - distance / 850);
            context.beginPath();
            context.fillStyle = `rgba(${index % 3 === 0 ? '186,154,255' : '116,170,255'},${alpha})`;
            context.arc(x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
        });
        context.beginPath();
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 250);
        glow.addColorStop(0, 'rgba(143, 98, 255, .055)');
        glow.addColorStop(1, 'rgba(143, 98, 255, 0)');
        context.fillStyle = glow;
        context.arc(pointer.x, pointer.y, 250, 0, Math.PI * 2);
        context.fill();
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', event => { pointer.targetX = event.clientX; pointer.targetY = event.clientY; }, { passive: true });
    resize();
    requestAnimationFrame(draw);
}

function initRevealAnimations() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length || !('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    }), { threshold: .12 });
    items.forEach(item => observer.observe(item));
}

function toggleMobileMenu() {
    const existing = document.querySelector('.mobile-menu');
    if (existing) { existing.remove(); return; }
    const menu = document.createElement('div');
    menu.className = 'mobile-menu active';
    menu.innerHTML = '<a href="/">Home</a><a href="/pricing">Pricing</a><a href="/docs">Docs</a>';
    document.body.appendChild(menu);
}

function configureStripeField(field, selector) {
    field.mount(selector);
    field.on('change', event => {
        const error = document.getElementById('card-errors');
        if (error && event.error) error.textContent = event.error.message;
        else if (error && !document.querySelector('.checkout-error[data-form-error]')) error.textContent = '';
    });
}

function initStripeCheckout() {
    if (typeof Stripe === 'undefined') {
        showToast('Stripe could not be loaded. Refresh and try again.', 'error');
        return false;
    }
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('REPLACE_ME')) {
        showToast('Add your Stripe publishable key before taking payments.', 'error');
        return false;
    }
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    stripeElements = stripe.elements();
    const style = { base: { color: '#f6f4fb', fontFamily: 'DM Sans, sans-serif', fontSize: '15px', '::placeholder': { color: '#666371' } }, invalid: { color: '#ff8f9a' } };
    cardNumber = stripeElements.create('cardNumber', { style });
    cardExpiry = stripeElements.create('cardExpiry', { style });
    cardCvc = stripeElements.create('cardCvc', { style });
    configureStripeField(cardNumber, '#card-number-element');
    configureStripeField(cardExpiry, '#card-expiry-element');
    configureStripeField(cardCvc, '#card-cvc-element');
    return true;
}

function setSelectedPlan(planId) {
    if (!PLANS[planId]) return;
    currentPlan = planId;
    const plan = PLANS[planId];
    document.querySelectorAll('.checkout-plan-option').forEach(option => {
        const selected = option.dataset.plan === planId;
        option.classList.toggle('selected', selected);
        option.querySelector('.cpo-radio')?.classList.toggle('selected', selected);
    });
    const values = { 'pay-amount': plan.display, 'summary-plan-name': plan.name, 'summary-billing': plan.duration, 'summary-amount': plan.display, 'summary-subtotal': plan.display, 'summary-total': plan.display };
    Object.entries(values).forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.textContent = value; });
}

async function handleCheckoutSubmit(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const error = document.getElementById('card-errors');
    const button = document.getElementById('submit-btn');
    if (!emailInput?.value || !emailInput.checkValidity()) { emailInput?.reportValidity(); return; }
    if (!stripe || !cardNumber) { showToast('Payment fields are not ready yet.', 'error'); return; }
    button.disabled = true;
    document.getElementById('pay-btn-text')?.classList.add('hidden');
    document.getElementById('pay-btn-loader')?.classList.remove('hidden');
    if (error) error.textContent = '';
    try {
        const response = await fetch(API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: PLANS[currentPlan].amount, plan: currentPlan, email: emailInput.value.trim() }) });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not start payment.');
        const confirmation = await stripe.confirmCardPayment(result.clientSecret, { payment_method: { card: cardNumber, billing_details: { email: emailInput.value.trim() } } });
        if (confirmation.error) throw new Error(confirmation.error.message);
        if (confirmation.paymentIntent?.status === 'succeeded') {
            document.getElementById('checkout-form')?.classList.add('hidden');
            document.querySelector('.checkout-summary-card')?.classList.add('hidden');
            document.getElementById('checkout-success')?.classList.remove('hidden');
        }
    } catch (paymentError) {
        if (error) { error.textContent = paymentError.message || 'Payment could not be completed.'; error.dataset.formError = 'true'; }
    } finally {
        button.disabled = false;
        document.getElementById('pay-btn-text')?.classList.remove('hidden');
        document.getElementById('pay-btn-loader')?.classList.add('hidden');
    }
}

function initCheckoutPage() {
    const queryPlan = new URLSearchParams(window.location.search).get('plan');
    setSelectedPlan(PLANS[queryPlan] ? queryPlan : 'premium');
    document.querySelectorAll('.checkout-plan-option').forEach(option => option.addEventListener('click', () => setSelectedPlan(option.dataset.plan)));
    document.getElementById('checkout-form')?.addEventListener('submit', handleCheckoutSubmit);
    initStripeCheckout();
}

document.addEventListener('DOMContentLoaded', () => {
    initAmbientBackground();
    initRevealAnimations();
    initCodeTyping();
    if (document.body.classList.contains('checkout-body')) initCheckoutPage();
});

function initCodeTyping() {
    const code = document.getElementById('hero-code');
    if (!code) return;
    const source = code.dataset.code || '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        code.textContent = source;
        return;
    }
    code.textContent = '';
    let position = 0;
    const caret = document.createElement('span');
    caret.className = 'hero-code-caret';
    code.appendChild(caret);
    const typeNext = () => {
        if (position >= source.length) return;
        caret.before(document.createTextNode(source[position]));
        position += 1;
        window.setTimeout(typeNext, source[position - 1] === '\n' ? 220 : 52);
    };
    window.setTimeout(typeNext, 500);
}
