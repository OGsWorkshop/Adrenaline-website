const LINKVERTISE_URL = 'https://linkvertise.com/your-link-here';
const STRIPE_PUBLISHABLE_KEY = window.STRIPE_PUBLISHABLE_KEY || window.STRIPE_KEY || 'pk_test_REPLACE_ME';
const API_ENDPOINT = '/api/create-payment-intent';

const PLANS = {
    premium: { name: 'Premium access', duration: 'Valid for one month', amount: 1799, display: '$17.99' },
    enterprise: { name: 'Enterprise access', duration: 'Valid for three months', amount: 3999, display: '$39.99' },
};

let stripe;
let stripeElements;
let paymentElement;
let paymentClientSecret;
let paymentRequestId = 0;
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

async function initStripeCheckout() {
    if (typeof Stripe === 'undefined') {
        showToast('Stripe could not be loaded. Refresh and try again.', 'error');
        return false;
    }
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('REPLACE_ME')) {
        showToast('Add your Stripe publishable key before taking payments.', 'error');
        return false;
    }

    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    await preparePaymentElement();
    return true;
}

async function preparePaymentElement() {
    const mountPoint = document.getElementById('payment-element');
    if (!stripe || !mountPoint) return;

    const requestId = ++paymentRequestId;
    const button = document.getElementById('submit-btn');
    button?.setAttribute('disabled', 'disabled');
    mountPoint.innerHTML = '<div class="payment-element-loading">Loading payment methods…</div>';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: currentPlan }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Could not load payment methods.');
        if (requestId !== paymentRequestId) return;

        paymentClientSecret = result.clientSecret;
        paymentElement?.unmount();
        stripeElements?.destroy?.();
        stripeElements = stripe.elements({ clientSecret: paymentClientSecret, appearance: {
            theme: 'night',
            variables: { colorPrimary: '#9b75ff', colorBackground: '#15151d', colorText: '#f6f4fb', colorTextSecondary: '#a6a3b0', borderRadius: '10px', fontFamily: 'DM Sans, sans-serif' },
        } });
        paymentElement = stripeElements.create('payment', { layout: 'tabs' });
        mountPoint.innerHTML = '';
        paymentElement.mount('#payment-element');
        button?.removeAttribute('disabled');
    } catch (error) {
        if (requestId !== paymentRequestId) return;
        paymentClientSecret = null;
        mountPoint.innerHTML = '<div class="payment-element-error">Payment methods could not be loaded. Refresh and try again.</div>';
        showToast(error.message || 'Payment methods could not be loaded.', 'error');
    }
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
    if (!stripe || !stripeElements || !paymentElement || !paymentClientSecret) { showToast('Payment methods are not ready yet.', 'error'); return; }
    button.disabled = true;
    document.getElementById('pay-btn-text')?.classList.add('hidden');
    document.getElementById('pay-btn-loader')?.classList.remove('hidden');
    if (error) error.textContent = '';
    try {
        const confirmation = await stripe.confirmPayment({
            elements: stripeElements,
            clientSecret: paymentClientSecret,
            confirmParams: {
                return_url: window.location.href,
                payment_method_data: { billing_details: { email: emailInput.value.trim() } },
            },
            redirect: 'if_required',
        });
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
    document.querySelectorAll('.checkout-plan-option').forEach(option => option.addEventListener('click', () => {
        setSelectedPlan(option.dataset.plan);
        if (stripe) preparePaymentElement();
    }));
    document.getElementById('checkout-form')?.addEventListener('submit', handleCheckoutSubmit);
    initStripeCheckout();
}

document.addEventListener('DOMContentLoaded', () => {
    initAmbientBackground();
    initRevealAnimations();
    initCodeTyping();
    initHeroExecutor();
    if (document.body.classList.contains('checkout-body')) initCheckoutPage();
});

function initCodeTyping() {
    const editor = document.getElementById('hero-code');
    const editorFrame = document.getElementById('hero-code-editor');
    const gutter = document.getElementById('hero-line-numbers');
    if (!editor || !editorFrame) return;
    const source = editorFrame.dataset.code || '';

    const refreshLineNumbers = () => {
        const lineCount = Math.max(1, (editor.textContent || '').split('\n').length);
        if (gutter) gutter.innerHTML = Array.from({ length: lineCount }, (_, index) => `<span>${index + 1}</span>`).join('');
    };

    editor.addEventListener('input', refreshLineNumbers);
    editor.addEventListener('blur', () => highlightHeroCode(editor));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        editor.textContent = source;
        refreshLineNumbers();
        highlightHeroCode(editor);
        return;
    }

    editor.textContent = '';
    const caret = document.createElement('span');
    caret.className = 'hero-code-caret';
    editor.appendChild(caret);
    let position = 0;

    const typeNext = () => {
        if (position >= source.length) {
            caret.remove();
            highlightHeroCode(editor);
            refreshLineNumbers();
            return;
        }
        caret.before(document.createTextNode(source[position]));
        position += 1;
        refreshLineNumbers();
        window.setTimeout(typeNext, source[position - 1] === '\n' ? 220 : 52);
    };
    window.setTimeout(typeNext, 500);
}

function highlightHeroCode(editor) {
    const source = editor.textContent || '';
    const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokenPattern = /(--[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:local|function|end|if|then|else|for|in|do|return|true|false|nil)\b|\b(?:print|warn|wait|task)\b|\b\d+(?:\.\d+)?\b)/g;
    let output = '';
    let cursor = 0;

    source.replace(tokenPattern, (token, offset) => {
        output += escapeHtml(source.slice(cursor, offset));
        const type = token.startsWith('--') ? 'comment' : token[0] === '"' || token[0] === "'" ? 'string' : /^\d/.test(token) ? 'number' : /^(print|warn|wait|task)$/.test(token) ? 'function' : 'keyword';
        output += `<span class="syntax-${type}">${escapeHtml(token)}</span>`;
        cursor = offset + token.length;
        return token;
    });
    output += escapeHtml(source.slice(cursor));
    editor.innerHTML = output;
}

function initHeroExecutor() {
    const code = document.getElementById('hero-code');
    const output = document.getElementById('hero-output-text');
    const button = document.getElementById('hero-execute');
    if (!code || !output || !button) return;

    button.addEventListener('click', () => {
        const source = (code.textContent || '').trim();
        const prints = [...source.matchAll(/\bprint\s*\(\s*(['"])([\s\S]*?)\1\s*\)/g)]
            .map(match => match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'"));

        output.textContent = prints.length
            ? prints.map((value, index) => `[${index + 1}] ${value}`).join('\n')
            : 'No print() output found in this preview.';
        output.parentElement?.classList.add('hero-output-ready');
    });
}
