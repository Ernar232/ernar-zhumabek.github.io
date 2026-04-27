// ===== server.js — Dala Мейрамханасы Бэкенді =====
// Іске қосу: node server.js
// Порт: http://localhost:3000

const express    = require('express');
const Database   = require('better-sqlite3');
const cors       = require('cors');
const path       = require('path');

const app = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Сайт файлдарын сол қалтадан береді (index.html, script.js, style.css)
app.use(express.static(path.join(__dirname)));

// ── SQLite базасын ашу / жасау ──────────────────────────────
// dala_orders.db файлы server.js-пен бір қалтада жасалады
const db = new Database(path.join(__dirname, 'dala_orders.db'));

// Кестені жасау (бірінші іске қосылғанда)
db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT    NOT NULL,
        dishes        TEXT    NOT NULL,   -- JSON массив
        original_total INTEGER NOT NULL,
        discount_pct   REAL    DEFAULT 0, -- 0.2 = 20%
        discount_value INTEGER DEFAULT 0,
        final_total   INTEGER NOT NULL,
        discount_code TEXT,
        status        TEXT    DEFAULT 'Жаңа',
        created_at    TEXT    DEFAULT (datetime('now','localtime')),
        updated_at    TEXT
    );
`);

console.log('✅ dala_orders.db базасы дайын');

// ── API маршруттары ─────────────────────────────────────────

// 1. Жаңа тапсырыс сақтау
app.post('/api/orders', (req, res) => {
    const {
        customerName,
        dishes,
        originalTotal,
        discountPct   = 0,
        discountValue = 0,
        finalTotal,
        discountCode  = null
    } = req.body;

    if (!customerName || !dishes || !finalTotal) {
        return res.status(400).json({ error: 'Міндетті өрістер жетіспейді' });
    }

    const stmt = db.prepare(`
        INSERT INTO orders
            (customer_name, dishes, original_total, discount_pct, discount_value, final_total, discount_code)
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
        customerName,
        JSON.stringify(dishes),
        originalTotal,
        discountPct,
        discountValue,
        finalTotal,
        discountCode
    );

    console.log(`✅ Жаңа тапсырыс сақталды: ID=${result.lastInsertRowid}, Клиент=${customerName}`);

    res.json({ success: true, orderId: result.lastInsertRowid });
});

// 2. Барлық тапсырыстарды алу
app.get('/api/orders', (req, res) => {
    const { status } = req.query;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status && status !== 'Барлығы') {
        query += ' WHERE status = ?';
        params.push(status);
    }

    query += ' ORDER BY id DESC';

    const orders = db.prepare(query).all(...params);

    // dishes JSON-ды parse ету
    const parsed = orders.map(o => ({
        ...o,
        dishes: JSON.parse(o.dishes || '[]')
    }));

    res.json(parsed);
});

// 3. Тапсырыс мәртебесін жаңарту
app.patch('/api/orders/:id/status', (req, res) => {
    const { id }     = req.params;
    const { status } = req.body;

    const validStatuses = ['Жаңа', 'Дайындалуда', 'Дайын', 'Жеткізілді'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Жарамсыз мәртебе' });
    }

    db.prepare(`
        UPDATE orders SET status = ?, updated_at = datetime('now','localtime') WHERE id = ?
    `).run(status, id);

    res.json({ success: true });
});

// 4. Тапсырысты жою
app.delete('/api/orders/:id', (req, res) => {
    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// 5. Статистика
app.get('/api/stats', (req, res) => {
    const total   = db.prepare('SELECT COUNT(*) as count FROM orders').get();
    const revenue = db.prepare('SELECT SUM(final_total) as sum FROM orders').get();
    const byStatus = db.prepare(`
        SELECT status, COUNT(*) as count FROM orders GROUP BY status
    `).all();

    res.json({
        totalOrders:  total.count,
        totalRevenue: revenue.sum || 0,
        byStatus
    });
});

// ── Серверді іске қосу ──────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Dala сервері іске қосылды!`);
    console.log(`🌐 Сайт: http://localhost:${PORT}`);
    console.log(`📦 API:  http://localhost:${PORT}/api/orders`);
    console.log(`📁 SQLite базасы: dala_orders.db\n`);
});