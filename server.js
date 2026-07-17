const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const pages = {
    '/': 'index.html',
    '/pricing': 'pricing.html',
    '/checkout': 'checkout.html',
    '/checkout/success': 'checkout-success.html',
    '/offsets': 'offsets.html',
    '/docs': 'docs.html',
    '/about': 'about.html',
    '/terms': 'terms.html',
    '/privacy': 'privacy.html',
};
const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
};

function sendJson(response, statusCode, body) {
    const payload = JSON.stringify(body);
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
    });
    response.end(payload);
}

function createApiResponse(response) {
    return {
        status(code) {
            response.statusCode = code;
            return this;
        },
        json(body) {
            sendJson(response, response.statusCode || 200, body);
        },
    };
}

function handleJsonApi(request, response, handler) {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', async () => {
        try {
            request.body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        } catch {
            return sendJson(response, 400, { error: 'Invalid JSON body' });
        }

        try {
            await handler(request, createApiResponse(response));
        } catch (error) {
            console.error('Payment endpoint error:', error);
            sendJson(response, 500, { error: 'Internal server error' });
        }
    });
}

function handleStripeWebhook(request, response) {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', async () => {
        request.rawBody = Buffer.concat(chunks);
        try {
            await require('./api/stripe-webhook')(request, createApiResponse(response));
        } catch (error) {
            console.error('Stripe webhook endpoint error:', error);
            sendJson(response, 500, { error: 'Internal server error' });
        }
    });
}

function serveStatic(request, response, pathname) {
    const requestedFile = pages[pathname] || (pathname.startsWith('/docs/') ? 'docs.html' : pathname.slice(1));
    const filePath = path.resolve(root, requestedFile);

    if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, 'index.html')) {
        return sendJson(response, 404, { error: 'Not found' });
    }

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            return sendJson(response, 404, { error: 'Not found' });
        }

        const contentType = contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        response.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(response);
    });
}

const server = http.createServer((request, response) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (pathname === '/discord' && request.method === 'GET') {
        response.writeHead(302, {
            Location: 'https://discord.gg/zPtyr26K7K',
            'Cache-Control': 'no-store',
        });
        return response.end();
    }

    if (pathname === '/api/create-checkout-session' && request.method === 'POST') {
        return handleJsonApi(request, response, require('./api/create-checkout-session'));
    }

    if (pathname === '/api/create-payment-intent' && request.method === 'POST') {
        return handleJsonApi(request, response, require('./api/create-payment-intent'));
    }

    if (pathname === '/api/webhooks/stripe' && request.method === 'POST') {
        return handleStripeWebhook(request, response);
    }

    if (pathname.startsWith('/api/')) {
        return sendJson(response, 404, { error: 'Not found' });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return sendJson(response, 405, { error: 'Method not allowed' });
    }

    serveStatic(request, response, pathname);
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Adrenaline website listening on port ${port}`);
});
