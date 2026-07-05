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

/* =================================================================================
  Docs Page Functions
  ================================================================================= */

const isDocsPage = () => window.location.pathname.includes('docs');

/* ── Sidebar Category Toggle ── */
function toggleCategory(el) {
    const cat = el.parentElement;
    cat.classList.toggle('collapsed');
    const key = cat.querySelector('.docs-sidebar-cat-title span').textContent.trim();
    try { localStorage.setItem('docs-cat-' + key, cat.classList.contains('collapsed')); } catch (e) {}
}

function restoreCategories() {
    document.querySelectorAll('.docs-sidebar-category').forEach(cat => {
        const key = cat.querySelector('.docs-sidebar-cat-title span').textContent.trim();
        try {
            const val = localStorage.getItem('docs-cat-' + key);
            if (val === 'true') cat.classList.add('collapsed');
        } catch (e) {}
    });
}

/* ── Mobile Sidebar ── */
function toggleMobileSidebar() {
    document.getElementById('docs-sidebar').classList.toggle('open');
    document.getElementById('docs-sidebar-overlay').classList.toggle('open');
}

function closeMobileSidebar() {
    document.getElementById('docs-sidebar').classList.remove('open');
    document.getElementById('docs-sidebar-overlay').classList.remove('open');
}

/* ── Active Section Tracking ── */
let docsObserver = null;
let sectionMap = {};
let sectionOrder = [];

function initDocsTracking() {
    const sections = document.querySelectorAll('.docs-section[data-section]');
    sectionOrder = [...sections].map(s => s.id);
    sectionMap = {};
    sections.forEach(s => {
        sectionMap[s.id] = s;
        const h2s = s.querySelectorAll('h2');
        h2s.forEach(h2 => {
            if (!h2.id) { h2.id = h2.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
            sectionMap[h2.id] = h2;
        });
    });

    if (docsObserver) docsObserver.disconnect();
    docsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id || entry.target.closest('[data-section]')?.id;
                if (id) setActiveSection(id);
            }
        });
    }, { rootMargin: '-88px 0px -60% 0px', threshold: 0 });

    sections.forEach(s => docsObserver.observe(s));
    if (sections.length > 0) setActiveSection(sections[0].id);
}

function setActiveSection(id) {
    document.querySelectorAll('.docs-sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.docs-sidebar-link[data-section="${id}"]`) ||
                 document.querySelector(`.docs-sidebar-link[href="#${id}"]`);
    if (link) link.classList.add('active');

    const breadcrumb = document.getElementById('docs-breadcrumb-current');
    if (breadcrumb && link) {
        breadcrumb.textContent = link.querySelector('span')?.textContent || link.textContent.trim();
    }

    buildTOC(id);
    updatePrevNext(id);
}

/* ── TOC Generation ── */
function buildTOC(sectionId) {
    const nav = document.getElementById('docs-toc-nav');
    if (!nav) return;
    nav.innerHTML = '';
    const section = sectionId ? document.getElementById(sectionId) : document.querySelector('.docs-section[data-section]');
    if (!section) return;
    const headings = section.querySelectorAll('h2, h3');
    headings.forEach(h => {
        if (!h.id) {
            h.id = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.style.paddingLeft = h.tagName === 'H3' ? '24px' : '12px';
        a.style.fontSize = h.tagName === 'H3' ? '0.75rem' : '0.8125rem';
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        nav.appendChild(a);
    });
    // highlight first heading
    if (nav.firstChild) nav.firstChild.classList.add('active');
}

/* ── Previous / Next Navigation ── */
function updatePrevNext(id) {
    const idx = sectionOrder.indexOf(id);
    const prev = document.getElementById('docs-prev');
    const next = document.getElementById('docs-next');
    const prevTitle = document.getElementById('docs-prev-title');
    const nextTitle = document.getElementById('docs-next-title');

    if (idx > 0) {
        const prevId = sectionOrder[idx - 1];
        const prevLink = document.querySelector(`.docs-sidebar-link[data-section="${prevId}"]`);
        if (prevLink) {
            prev.href = '#' + prevId;
            prevTitle.textContent = prevLink.textContent.trim();
            prev.classList.remove('disabled');
        }
    } else {
        prev.classList.add('disabled');
    }

    if (idx < sectionOrder.length - 1) {
        const nextId = sectionOrder[idx + 1];
        const nextLink = document.querySelector(`.docs-sidebar-link[data-section="${nextId}"]`);
        if (nextLink) {
            next.href = '#' + nextId;
            nextTitle.textContent = nextLink.textContent.trim();
            next.classList.remove('disabled');
        }
    } else {
        next.classList.add('disabled');
    }
}

/* ── Search Dialog ── */
let searchData = [];

function buildSearchData() {
    searchData = [];
    document.querySelectorAll('.docs-section[data-section]').forEach(section => {
        const id = section.id;
        const link = document.querySelector(`.docs-sidebar-link[data-section="${id}"]`);
        const title = link ? link.textContent.trim() : id;
        searchData.push({ id, title, type: 'Page', text: title });
        section.querySelectorAll('h2, h3, p').forEach(el => {
            if (el.textContent.trim().length > 10) {
                searchData.push({
                    id: el.id || id,
                    title: el.textContent.trim().substring(0, 80),
                    type: el.tagName === 'P' ? 'Description' : 'Heading',
                    parent: title,
                    text: el.textContent.trim(),
                });
            }
        });
    });
}

function openSearch() {
    document.getElementById('docs-search-dialog').classList.add('open');
    document.getElementById('docs-search-overlay').classList.add('open');
    setTimeout(() => document.getElementById('docs-search-input')?.focus(), 100);
}

function closeSearch(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('docs-search-dialog').classList.remove('open');
    document.getElementById('docs-search-overlay').classList.remove('open');
    document.getElementById('docs-search-input').value = '';
    document.getElementById('docs-search-results').innerHTML = '<div class="docs-search-empty">Type to start searching...</div>';
}

function filterSearchResults() {
    const input = document.getElementById('docs-search-input');
    const results = document.getElementById('docs-search-results');
    const q = input.value.trim().toLowerCase();
    if (!q) {
        results.innerHTML = '<div class="docs-search-empty">Type to start searching...</div>';
        return;
    }
    const matches = searchData.filter(d => d.text.toLowerCase().includes(q)).slice(0, 20);
    if (matches.length === 0) {
        results.innerHTML = '<div class="docs-search-empty">No results found.</div>';
        return;
    }
    results.innerHTML = matches.map(m => `
        <a href="#${m.id}" class="docs-search-result" onclick="closeSearch(event);setTimeout(()=>document.getElementById('${m.id}')?.scrollIntoView({behavior:'smooth',block:'start'}),50)">
            <div class="docs-search-result-title">${highlightMatch(m.title, q)}</div>
            <div class="docs-search-result-meta">${m.type}${m.parent ? ' — ' + m.parent : ''}</div>
        </a>
    `).join('');
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.substring(0, idx) + '<mark>' + text.substring(idx, idx + query.length) + '</mark>' + text.substring(idx + query.length);
}

/* ── Copy Code Button ── */
function addCopyButtons() {
    document.querySelectorAll('.docs-code-header').forEach(header => {
        if (header.querySelector('.docs-copy-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'docs-copy-btn';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
        btn.addEventListener('click', () => {
            const code = header.nextElementSibling;
            if (!code || !code.textContent) return;
            navigator.clipboard.writeText(code.textContent).then(() => {
                btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
                setTimeout(() => { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy'; }, 2000);
            }).catch(() => {});
        });
        header.appendChild(btn);
    });
}

/* ── Theme Toggle ── */
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    try { localStorage.setItem('docs-theme', isLight ? 'light' : 'dark'); } catch (e) {}
}

function restoreTheme() {
    try {
        const val = localStorage.getItem('docs-theme');
        if (val === 'light') document.body.classList.add('light-theme');
    } catch (e) {}
}

/* ── Keyboard Shortcuts ── */
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isDocsPage()) openSearch();
    }
    if (e.key === 'Escape') {
        closeSearch({ target: document.getElementById('docs-search-overlay'), currentTarget: document.getElementById('docs-search-overlay') });
    }
});

/* ── Smooth Scroll for Anchor Links ── */

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
    window.location.href = '/checkout?plan=' + plan;
}
function closeCheckout() {}

const plans = {
    free: { name: 'Free', amount: 0, billing: 'Forever', features: ['Basic execution', 'Limited script hub', 'Level 7 API', 'Standard support'] },
    premium: { name: 'Premium Plan', amount: 299, billing: 'Weekly subscription', features: ['Unlimited execution', 'Full script hub access', 'Level 8 API', 'Priority support', 'Exclusive premium scripts', 'Early access updates', 'HWID Spoofer'] },
    enterprise: { name: 'Enterprise Plan', amount: 2999, billing: 'Lifetime access', features: ['Everything in Premium', 'Private server support', 'Custom script development', 'API access', 'Whitelabel option', 'Direct developer access', 'Dedicated Discord channel'] }
};

function initCheckoutPage() {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan') || 'premium';
    selectCheckoutPlan(plan);
}

function selectCheckoutPlan(planKey) {
    const plan = plans[planKey];
    if (!plan) return;
    currentPlan = planKey;
    currentAmount = plan.amount;

    document.querySelectorAll('.checkout-plan-option').forEach(el => {
        const isSelected = el.dataset.plan === planKey;
        el.classList.toggle('selected', isSelected);
        el.querySelector('.cpo-radio').classList.toggle('selected', isSelected);
    });

    document.getElementById('summary-plan-name').textContent = plan.name;
    document.getElementById('summary-billing').textContent = plan.billing;
    document.getElementById('summary-amount').textContent = '$' + (plan.amount / 100).toFixed(2);
    document.getElementById('summary-total').textContent = '$' + (plan.amount / 100).toFixed(2);
    document.getElementById('pay-btn-text').innerHTML = 'Pay $' + (plan.amount / 100).toFixed(2) + ' <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const featuresEl = document.getElementById('checkout-summary-features');
    featuresEl.innerHTML = plan.features.map(f => '<div class="checkout-summary-feature">✓ ' + f + '</div>').join('');

    if (planKey === 'free') {
        linkvertiseRedirect();
    }
}

function downloadAfterPurchase() {
    linkvertiseRedirect();
    document.getElementById('checkout-success').classList.add('hidden');
    document.getElementById('checkout-card').classList.remove('hidden');
}

let cardNumberElement, cardExpiryElement, cardCvcElement;

function initializeStripeElements() {
    if (!stripe) {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();
        const style = {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': { color: '#555' },
            },
            invalid: { color: '#ef4444' },
        };
        cardNumberElement = elements.create('cardNumber', { style, showIcon: true });
        cardExpiryElement = elements.create('cardExpiry', { style });
        cardCvcElement = elements.create('cardCvc', { style });

        const mount = (id, el) => { const target = document.getElementById(id); if (target) el.mount(target); };
        mount('card-number-element', cardNumberElement);
        mount('card-expiry-element', cardExpiryElement);
        mount('card-cvc-element', cardCvcElement);

        [cardNumberElement, cardExpiryElement, cardCvcElement].forEach(el => {
            el.on('change', ({ error }) => {
                document.getElementById('card-errors').textContent = error ? error.message : '';
            });
        });
    }
}

async function handlePayment() {
    if (currentAmount === 0) return;
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    document.getElementById('pay-btn-text').classList.add('hidden');
    document.getElementById('pay-btn-loader').classList.remove('hidden');
    document.getElementById('card-errors').textContent = '';

    try {
        const email = document.getElementById('email').value;
        if (!email || !email.includes('@')) {
            throw new Error('Please enter a valid email address.');
        }

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: currentAmount, plan: currentPlan }),
        });

        if (!response.ok) throw new Error('Failed to create payment. Please try again.');
        const { clientSecret } = await response.json();

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: { email },
            },
        });

        if (error) throw new Error(error.message);

        if (paymentIntent.status === 'succeeded') {
            document.getElementById('checkout-card').classList.add('hidden');
            document.getElementById('checkout-success').classList.remove('hidden');
            triggerConfetti();
            setTimeout(() => window.open(LINKVERTISE_URL, '_blank'), 2000);
        }
    } catch (err) {
        document.getElementById('card-errors').textContent = err.message;
        showToast(err.message, 'error');
    } finally {
        submitBtn.disabled = false;
        document.getElementById('pay-btn-text').classList.remove('hidden');
        document.getElementById('pay-btn-loader').classList.add('hidden');
    }
}

if (window.location.pathname.includes('checkout')) {
    document.addEventListener('DOMContentLoaded', () => {
        initCheckoutPage();
        initializeStripeElements();
    });
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
            if (window.innerWidth < 1024) closeMobileSidebar();
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

/* ── Docs Page Initialization ── */
if (isDocsPage()) {
    document.addEventListener('DOMContentLoaded', () => {
        restoreTheme();
        restoreCategories();
        buildSearchData();
        buildTOC();
        initDocsTracking();
        addCopyButtons();

        document.getElementById('docs-search-input')?.addEventListener('input', filterSearchResults);

        const currentSection = document.querySelector('.docs-section[data-section]');
        if (currentSection) {
            const id = currentSection.id;
            const link = document.querySelector(`.docs-sidebar-link[data-section="${id}"]`);
            if (link) link.classList.add('active');
            setActiveSection(id);
        }

        const tocContainer = document.getElementById('docs-toc');
        const content = document.getElementById('docs-content');
        if (tocContainer && content) {
            content.addEventListener('scroll', () => {
                const tocLinks = document.querySelectorAll('.docs-toc-nav a');
                const headings = document.querySelectorAll('.docs-section h2');
                let active = '';
                headings.forEach(h => {
                    const rect = h.getBoundingClientRect();
                    if (rect.top <= 150) active = h.id;
                });
                tocLinks.forEach(a => a.classList.remove('active'));
                if (active) {
                    const link = Array.from(tocLinks).find(a => a.getAttribute('href') === '#' + active);
                    if (link) link.classList.add('active');
                }
            });
        }
    });
}
