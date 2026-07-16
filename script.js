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
    if (!editor || !editorFrame || editor.dataset.initialized === 'true') return;

    editor.dataset.initialized = 'true';
    const source = editorFrame.dataset.code || 'print("Adrenaline Executed")';
    let typingTimer = 0;
    let typingActive = true;

    const refreshLineNumbers = () => {
        const lineCount = Math.max(1, editor.value.split('\n').length);
        if (gutter) gutter.innerHTML = Array.from({ length: lineCount }, (_, index) => `<span>${index + 1}</span>`).join('');
    };

    const stopTyping = () => {
        if (!typingActive) return;
        typingActive = false;
        window.clearTimeout(typingTimer);
        editor.classList.remove('is-typing');
    };

    const finishTyping = () => {
        if (!typingActive) return;
        typingActive = false;
        window.clearTimeout(typingTimer);
        editor.value = source;
        editor.classList.remove('is-typing');
        refreshLineNumbers();
    };

    editor.addEventListener('pointerdown', stopTyping);
    editor.addEventListener('keydown', stopTyping);
    editor.addEventListener('paste', stopTyping);
    editor.addEventListener('input', () => {
        stopTyping();
        refreshLineNumbers();
    });
    editor.readOnly = false;
    editor.value = '';
    editor.classList.add('is-typing');
    refreshLineNumbers();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishTyping();
        return;
    }

    let position = 0;
    const typeNext = () => {
        if (!typingActive) return;
        if (position >= source.length) {
            finishTyping();
            return;
        }

        position += 1;
        editor.value = source.slice(0, position);
        refreshLineNumbers();
        typingTimer = window.setTimeout(typeNext, 52);
    };

    typingTimer = window.setTimeout(typeNext, 450);
}

function highlightHeroCode(editor) {
    const highlight = document.getElementById('hero-code-highlight');
    if (!highlight) return;
    const source = editor.value || '';
    const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokenPattern = /(--\[\[[\s\S]*?\]\]|--[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:local|function|end|if|then|elseif|else|for|in|do|while|repeat|until|return|break|and|or|not|true|false|nil)\b|\b(?:print|warn|tostring|tonumber|type|pairs|ipairs|task|math|string|table)\b|\b\d+(?:\.\d+)?\b)/g;
    let output = '';
    let cursor = 0;

    source.replace(tokenPattern, (token, offset) => {
        output += escapeHtml(source.slice(cursor, offset));
        const type = token.startsWith('--') ? 'comment' : token[0] === '"' || token[0] === "'" ? 'string' : /^\d/.test(token) ? 'number' : /^(print|warn|tostring|tonumber|type|pairs|ipairs|task|math|string|table)$/.test(token) ? 'function' : 'keyword';
        output += `<span class="syntax-${type}">${escapeHtml(token)}</span>`;
        cursor = offset + token.length;
        return token;
    });
    output += escapeHtml(source.slice(cursor));
    highlight.innerHTML = output + (source.endsWith('\n') ? ' ' : '');
}

function tokenizeLuau(source) {
    const tokens = [];
    let index = 0;
    let line = 1;
    const add = (type, value, tokenLine = line) => tokens.push({ type, value, line: tokenLine });

    while (index < source.length) {
        const character = source[index];
        if (/\s/.test(character)) {
            if (character === '\n') line += 1;
            index += 1;
            continue;
        }
        if (source.startsWith('--', index)) {
            while (index < source.length && source[index] !== '\n') index += 1;
            continue;
        }
        if (character === '"' || character === "'") {
            const quote = character;
            const tokenLine = line;
            let value = '';
            index += 1;
            while (index < source.length && source[index] !== quote) {
                if (source[index] === '\\' && index + 1 < source.length) {
                    const escaped = source[index + 1];
                    value += escaped === 'n' ? '\n' : escaped === 't' ? '\t' : escaped;
                    index += 2;
                } else {
                    value += source[index++];
                }
            }
            if (source[index] !== quote) throw new Error(`line ${tokenLine}: unterminated string`);
            index += 1;
            add('string', value, tokenLine);
            continue;
        }
        const number = source.slice(index).match(/^\d+(?:\.\d+)?/);
        if (number) {
            add('number', Number(number[0]));
            index += number[0].length;
            continue;
        }
        const identifier = source.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
        if (identifier) {
            add('identifier', identifier[0]);
            index += identifier[0].length;
            continue;
        }
        const operator = ['...', '==', '~=', '<=', '>=', '..'].find(value => source.startsWith(value, index));
        if (operator) {
            add('operator', operator);
            index += operator.length;
            continue;
        }
        if ('+-*/%^#=<>(),.;{}[]'.includes(character)) {
            add('operator', character);
            index += 1;
            continue;
        }
        throw new Error(`line ${line}: unsupported character '${character}'`);
    }
    add('eof', 'eof', line);
    return tokens;
}

function createLuauPreview(source) {
    const tokens = tokenizeLuau(source);
    let cursor = 0;
    const peek = value => value === undefined ? tokens[cursor] : tokens[cursor].value === value;
    const take = value => {
        const token = tokens[cursor];
        if (value !== undefined && token.value !== value) throw new Error(`line ${token.line}: expected '${value}'`);
        cursor += 1;
        return token;
    };
    const isStop = stops => stops.includes(peek().value);

    const parsePrimary = () => {
        const token = take();
        if (token.type === 'number' || token.type === 'string') return { type: 'literal', value: token.value };
        if (token.value === 'true' || token.value === 'false') return { type: 'literal', value: token.value === 'true' };
        if (token.value === 'nil') return { type: 'literal', value: null };
        if (token.value === '(') {
            const expression = parseExpression();
            take(')');
            return expression;
        }
        if (token.value === '-' || token.value === 'not' || token.value === '#') return { type: 'unary', operator: token.value, value: parsePrimary() };
        if (token.type !== 'identifier') throw new Error(`line ${token.line}: expected an expression`);
        let expression = { type: 'variable', name: token.value };
        while (peek('(') || peek('.')) {
            if (peek('.')) {
                take('.');
                expression = { type: 'member', object: expression, name: take().value };
            } else {
                take('(');
                const argumentsList = [];
                while (!peek(')')) {
                    argumentsList.push(parseExpression());
                    if (!peek(',')) break;
                    take(',');
                }
                take(')');
                expression = { type: 'call', callee: expression, arguments: argumentsList };
            }
        }
        return expression;
    };

    const precedence = { or: 1, and: 2, '==': 3, '~=': 3, '<': 3, '>': 3, '<=': 3, '>=': 3, '..': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '^': 7 };
    const parseExpression = (minimum = 0) => {
        let left = parsePrimary();
        while (true) {
            const operator = peek().value;
            const priority = precedence[operator];
            if (priority === undefined || priority < minimum) break;
            take();
            left = { type: 'binary', operator, left, right: parseExpression(priority + (operator === '^' || operator === '..' ? 0 : 1)) };
        }
        return left;
    };

    const parseBlock = stops => {
        const statements = [];
        while (!peek('eof') && !isStop(stops)) statements.push(parseStatement());
        return statements;
    };

    function parseStatement() {
        if (peek(';')) { take(';'); return { type: 'empty' }; }
        if (peek('local')) {
            take('local');
            if (peek('function')) throw new Error(`line ${peek().line}: local functions are not supported in the preview`);
            const name = take().value;
            const value = peek('=') ? (take('='), parseExpression()) : { type: 'literal', value: null };
            return { type: 'set', name, value, local: true };
        }
        if (peek('if')) {
            take('if');
            const branches = [{ condition: parseExpression(), body: null }];
            take('then');
            branches[0].body = parseBlock(['elseif', 'else', 'end']);
            while (peek('elseif')) {
                take('elseif');
                const branch = { condition: parseExpression(), body: null };
                take('then');
                branch.body = parseBlock(['elseif', 'else', 'end']);
                branches.push(branch);
            }
            const otherwise = peek('else') ? (take('else'), parseBlock(['end'])) : [];
            take('end');
            return { type: 'if', branches, otherwise };
        }
        if (peek('for')) {
            take('for');
            const name = take().value;
            take('=');
            const start = parseExpression();
            take(',');
            const finish = parseExpression();
            const step = peek(',') ? (take(','), parseExpression()) : { type: 'literal', value: 1 };
            take('do');
            const body = parseBlock(['end']);
            take('end');
            return { type: 'for', name, start, finish, step, body };
        }
        if (peek('while')) {
            take('while');
            const condition = parseExpression();
            take('do');
            const body = parseBlock(['end']);
            take('end');
            return { type: 'while', condition, body };
        }
        if (peek('return')) { take('return'); return { type: 'return', value: isStop(['eof', 'end']) ? null : parseExpression() }; }
        if (peek('break')) { take('break'); return { type: 'break' }; }

        const name = peek().value;
        if (peek().type === 'identifier' && tokens[cursor + 1]?.value === '=') {
            take(); take('=');
            return { type: 'set', name, value: parseExpression(), local: false };
        }
        return { type: 'expression', value: parseExpression() };
    }

    const program = parseBlock(['eof']);
    if (!program.length) throw new Error('No executable Luau statements found.');
    const output = [];
    const environment = Object.create(null);
    const safeMath = { abs: Math.abs, ceil: Math.ceil, floor: Math.floor, max: Math.max, min: Math.min, round: Math.round };
    const builtins = {
        print: (...values) => output.push(values.map(value => formatLuau(value)).join('\t')),
        warn: (...values) => output.push(`Warning: ${values.map(value => formatLuau(value)).join('\t')}`),
        tostring: value => formatLuau(value),
        tonumber: value => Number(value),
        type: value => value === null ? 'nil' : Array.isArray(value) ? 'table' : typeof value,
        math: safeMath,
    };
    const getValue = expression => {
        if (expression.type === 'literal') return expression.value;
        if (expression.type === 'variable') {
            if (Object.prototype.hasOwnProperty.call(environment, expression.name)) return environment[expression.name];
            if (Object.prototype.hasOwnProperty.call(builtins, expression.name)) return builtins[expression.name];
            throw new Error(`unknown identifier '${expression.name}'`);
        }
        if (expression.type === 'member') {
            const object = getValue(expression.object);
            return object && object[expression.name];
        }
        if (expression.type === 'unary') {
            const value = getValue(expression.value);
            if (expression.operator === '-') return -Number(value || 0);
            if (expression.operator === '#') return value?.length || 0;
            return !value;
        }
        if (expression.type === 'binary') {
            const left = getValue(expression.left);
            const right = getValue(expression.right);
            switch (expression.operator) {
                case 'or': return left || right;
                case 'and': return left && right;
                case '..': return formatLuau(left) + formatLuau(right);
                case '+': return Number(left) + Number(right);
                case '-': return Number(left) - Number(right);
                case '*': return Number(left) * Number(right);
                case '/': return Number(left) / Number(right);
                case '%': return Number(left) % Number(right);
                case '^': return Number(left) ** Number(right);
                case '==': return left === right;
                case '~=': return left !== right;
                case '<': return left < right;
                case '>': return left > right;
                case '<=': return left <= right;
                case '>=': return left >= right;
                default: return null;
            }
        }
        if (expression.type === 'call') {
            const fn = getValue(expression.callee);
            if (typeof fn !== 'function') throw new Error('attempt to call a non-function value');
            return fn(...expression.arguments.map(getValue));
        }
        return null;
    };
    const execute = statements => {
        for (const statement of statements) {
            if (statement.type === 'empty') continue;
            if (statement.type === 'set') { environment[statement.name] = getValue(statement.value); continue; }
            if (statement.type === 'expression') { getValue(statement.value); continue; }
            if (statement.type === 'return') return { returned: true };
            if (statement.type === 'break') return { break: true };
            if (statement.type === 'if') {
                const branch = statement.branches.find(item => getValue(item.condition));
                const result = execute(branch ? branch.body : statement.otherwise);
                if (result) return result;
                continue;
            }
            if (statement.type === 'for') {
                const start = Number(getValue(statement.start));
                const finish = Number(getValue(statement.finish));
                const step = Number(getValue(statement.step)) || 1;
                let iterations = 0;
                for (let value = start; step > 0 ? value <= finish : value >= finish; value += step) {
                    if (++iterations > 1000) throw new Error('loop limit exceeded');
                    environment[statement.name] = value;
                    const result = execute(statement.body);
                    if (result?.returned) return result;
                    if (result?.break) break;
                }
                continue;
            }
            if (statement.type === 'while') {
                let iterations = 0;
                while (getValue(statement.condition)) {
                    if (++iterations > 1000) throw new Error('loop limit exceeded');
                    const result = execute(statement.body);
                    if (result?.returned) return result;
                    if (result?.break) break;
                }
            }
        }
        return null;
    };
    execute(program);
    return output;
}

function formatLuau(value) {
    if (value === null || value === undefined) return 'nil';
    if (value === true) return 'true';
    if (value === false) return 'false';
    return String(value);
}

function initHeroExecutor() {
    const code = document.getElementById('hero-code');
    const output = document.getElementById('hero-output-text');
    const button = document.getElementById('hero-execute');
    if (!code || !output || !button || button.dataset.initialized === 'true') return;
    button.dataset.initialized = 'true';

    button.addEventListener('click', () => {
        try {
            const results = createLuauPreview(code.value);
            output.textContent = results.length
                ? results.map((value, index) => `[${index + 1}] ${value}`).join('\n')
                : 'Script ran successfully with no output.';
            output.parentElement?.classList.add('hero-output-ready');
        } catch (error) {
            output.textContent = `Luau error: ${error.message}`;
            output.parentElement?.classList.remove('hero-output-ready');
        }
    });
}
