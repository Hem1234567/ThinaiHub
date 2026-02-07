const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return { products: [], orders: [] };
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Start Server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // --- API Routes ---

    // GET /api/products
    if (pathname === '/api/products' && req.method === 'GET') {
        const db = readDB();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(db.products));
        return;
    }

    // POST /api/products
    if (pathname === '/api/products' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const db = readDB();
            const newProduct = JSON.parse(body);
            newProduct.id = Date.now().toString();
            db.products.push(newProduct);
            writeDB(db);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newProduct));
        });
        return;
    }

    // DELETE /api/products/:id
    if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
        const id = pathname.split('/').pop();
        const db = readDB();
        const initialLen = db.products.length;
        db.products = db.products.filter(p => p.id !== id);

        if (db.products.length === initialLen) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
        } else {
            writeDB(db);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        }
        return;
    }

    // GET /api/orders
    if (pathname === '/api/orders' && req.method === 'GET') {
        const db = readDB();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(db.orders));
        return;
    }

    // POST /api/orders
    if (pathname === '/api/orders' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const db = readDB();
            const newOrder = JSON.parse(body);
            newOrder.id = Date.now().toString().slice(-6);
            newOrder.date = new Date().toISOString();
            newOrder.status = 'Pending';

            db.orders.push(newOrder);
            writeDB(db);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newOrder));
        });
        return;
    }

    // PATCH /api/orders/:id
    if (pathname.startsWith('/api/orders/') && req.method === 'PATCH') {
        const id = pathname.split('/').pop();
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const db = readDB();
            const updates = JSON.parse(body);
            const orderIndex = db.orders.findIndex(o => o.id === id);

            if (orderIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Order not found' }));
            } else {
                db.orders[orderIndex] = { ...db.orders[orderIndex], ...updates };
                writeDB(db);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(db.orders[orderIndex]));
            }
        });
        return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
