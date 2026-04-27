// ===== database.js (жаңартылған) =====
// Тапсырыстарды Node.js серверіне жіберіп, SQLite-қа сақтайды

const API_URL = 'http://localhost:3000/api';

// ============================================================
// 1. API функциялары
// ============================================================

async function saveOrder(orderData) {
    const selectedDishes = [];
    document.querySelectorAll('.dish-checkbox:checked').forEach(cb => {
        selectedDishes.push({ name: cb.dataset.name, price: parseInt(cb.value, 10) });
    });

    const response = await fetch(`${API_URL}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerName:  orderData.customerName,
            dishes:        selectedDishes,
            originalTotal: orderData.originalTotal,
            discountPct:   orderData.discount || 0,
            discountValue: orderData.discountValue || 0,
            finalTotal:    orderData.finalTotal,
            discountCode:  orderData.discountCode || null
        })
    });

    const data = await response.json();
    if (!data.success) throw new Error('Сервер қателігі');
    return data.orderId;
}

async function getAllOrders(filterStatus = 'Барлығы') {
    const url = filterStatus === 'Барлығы'
        ? `${API_URL}/orders`
        : `${API_URL}/orders?status=${encodeURIComponent(filterStatus)}`;
    const response = await fetch(url);
    return await response.json();
}

async function updateOrderStatus(id, newStatus) {
    await fetch(`${API_URL}/orders/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
}

async function deleteOrder(id) {
    await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
}

async function getStats() {
    const response = await fetch(`${API_URL}/stats`);
    return await response.json();
}

// ============================================================
// 2. ТАПСЫРЫС БЕРУ БАТЫРМАСЫ
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const placeOrderBtn     = document.getElementById('placeOrderBtn');
    const customerNameInput = document.getElementById('customerName');
    const totalSpan         = document.getElementById('totalAmount');
    const originalTotalSpan = document.getElementById('originalTotal');
    const successDiv        = document.getElementById('orderSuccess');

    if (!placeOrderBtn) return;

    const newBtn = placeOrderBtn.cloneNode(true);
    placeOrderBtn.parentNode.replaceChild(newBtn, placeOrderBtn);

    newBtn.addEventListener('click', async () => {
        const name       = customerNameInput?.value.trim();
        const finalTotal = parseInt(totalSpan?.textContent || '0', 10);
        const origTotal  = parseInt(originalTotalSpan?.textContent || '0', 10);
        const anyChecked = Array.from(document.querySelectorAll('.dish-checkbox')).some(cb => cb.checked);

        if (!name)       { alert('❌ Аты-жөніңізді енгізіңіз.');        return; }
        if (!anyChecked) { alert('❌ Кем дегенде бір тағам таңдаңыз.'); return; }

        const discountValue = origTotal - finalTotal;

        try {
            newBtn.textContent = '⏳ Сақталуда...';
            newBtn.disabled    = true;

            const orderId = await saveOrder({
                customerName:  name,
                originalTotal: origTotal,
                discount:      discountValue > 0 ? 0.2 : 0,
                discountValue: discountValue,
                finalTotal:    finalTotal
            });

            if (successDiv) {
                let msg = `✅ Сәлеметсіз бе, ${name}! Тапсырысыңыз <strong>#${orderId}</strong> қабылданды.<br>`;
                if (discountValue > 0) msg += `🏷️ Жеңілдік: ${discountValue} ₸ үнемдедіңіз!<br>`;
                msg += `💵 Төлейтін: <strong>${finalTotal} ₸</strong><br>⏱️ 20 минутта дайын болады.`;
                successDiv.innerHTML = msg;
                successDiv.style.display = 'block';
            }

            customerNameInput.value = '';
            document.querySelectorAll('.dish-checkbox').forEach(cb => cb.checked = false);

        } catch (err) {
            console.error(err);
            alert('❌ Сервер қосылмаған! Алдымен терминалда "node server.js" іске қосыңыз.');
        } finally {
            newBtn.textContent = 'Тапсырыс беру';
            newBtn.disabled    = false;
        }
    });

    injectAdminButton();
});

// ============================================================
// 3. ADMIN ПАНЕЛІ
// ============================================================

function injectAdminButton() {
    const footer = document.querySelector('footer .footer-content');
    if (!footer || document.getElementById('adminToggleBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'adminToggleBtn';
    btn.textContent = '🔐 Admin панелі';
    btn.style.cssText = `
        margin-top:12px; padding:6px 16px;
        background:rgba(255,255,255,0.15); color:#fff;
        border:1px solid rgba(255,255,255,0.3);
        border-radius:6px; cursor:pointer; font-size:13px;
    `;
    btn.addEventListener('click', toggleAdminPanel);
    footer.appendChild(btn);
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) { panel.remove(); return; }
    injectAdminPanel();
}

function injectAdminPanel() {
    const panel = document.createElement('div');
    panel.id = 'adminPanel';
    panel.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.88);
        z-index:9999; display:flex; align-items:center;
        justify-content:center; padding:20px;
    `;
    panel.innerHTML = `
        <div style="background:#1a1a2e; border-radius:16px; width:100%; max-width:960px;
                    max-height:88vh; display:flex; flex-direction:column; overflow:hidden;
                    box-shadow:0 25px 60px rgba(0,0,0,0.7);">

            <div style="display:flex; align-items:center; justify-content:space-between;
                        padding:20px 24px; background:linear-gradient(135deg,#c0392b,#e74c3c); color:#fff;">
                <div>
                    <h2 style="margin:0; font-size:1.4rem;">🍲 Dala — Тапсырыстар (SQLite)</h2>
                    <p style="margin:4px 0 0; font-size:0.85rem; opacity:0.85;" id="adminSummary">Жүктелуде...</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button onclick="renderAdminTable(currentFilter)" style="background:rgba(255,255,255,0.2);
                        border:none; color:#fff; padding:8px 14px; border-radius:8px; cursor:pointer;">🔄 Жаңарту</button>
                    <button id="adminCloseBtn" style="background:none; border:none; color:#fff;
                        font-size:1.6rem; cursor:pointer; padding:0 10px;">&times;</button>
                </div>
            </div>

            <div style="padding:12px 24px; background:#16213e; display:flex; gap:8px; flex-wrap:wrap;">
                <span style="color:#aaa; font-size:13px; align-self:center;">Мәртебе:</span>
                ${['Барлығы','Жаңа','Дайындалуда','Дайын','Жеткізілді'].map(s => `
                    <button class="admin-filter-btn" data-status="${s}"
                        style="padding:5px 14px; border-radius:20px; border:1px solid #444;
                               background:transparent; color:#ccc; cursor:pointer; font-size:12px;">${s}</button>
                `).join('')}
            </div>

            <div style="overflow-y:auto; flex:1; padding:16px 24px;">
                <table style="width:100%; border-collapse:collapse; font-size:13px; color:#e0e0e0;">
                    <thead>
                        <tr style="border-bottom:2px solid #333;">
                            <th style="text-align:left;padding:10px 8px;color:#aaa;">ID</th>
                            <th style="text-align:left;padding:10px 8px;color:#aaa;">Клиент</th>
                            <th style="text-align:left;padding:10px 8px;color:#aaa;">Тағамдар</th>
                            <th style="text-align:right;padding:10px 8px;color:#aaa;">Сома</th>
                            <th style="text-align:center;padding:10px 8px;color:#aaa;">Мәртебе</th>
                            <th style="text-align:left;padding:10px 8px;color:#aaa;">Уақыт</th>
                            <th style="text-align:center;padding:10px 8px;color:#aaa;">Жою</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody">
                        <tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Жүктелуде...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(panel);
    panel.querySelector('#adminCloseBtn').addEventListener('click', toggleAdminPanel);
    panel.addEventListener('click', e => { if (e.target === panel) toggleAdminPanel(); });

    window.currentFilter = 'Барлығы';
    panel.querySelectorAll('.admin-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.currentFilter = btn.dataset.status;
            panel.querySelectorAll('.admin-filter-btn').forEach(b => {
                b.style.background = 'transparent'; b.style.color = '#ccc'; b.style.borderColor = '#444';
            });
            btn.style.background = '#e74c3c'; btn.style.color = '#fff'; btn.style.borderColor = '#e74c3c';
            renderAdminTable(window.currentFilter);
        });
    });

    panel.querySelector('[data-status="Барлығы"]').click();
}

window.renderAdminTable = async function(filterStatus = 'Барлығы') {
    const tbody   = document.getElementById('ordersTableBody');
    const summary = document.getElementById('adminSummary');
    if (!tbody) return;

    try {
        const [orders, stats] = await Promise.all([getAllOrders(filterStatus), getStats()]);

        if (summary) {
            summary.textContent = `Жалпы: ${stats.totalOrders} тапсырыс | Табыс: ${(stats.totalRevenue||0).toLocaleString()} ₸`;
        }

        if (!orders.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#666;">Тапсырыс жоқ</td></tr>';
            return;
        }

        const colors = { 'Жаңа':'#e74c3c','Дайындалуда':'#f39c12','Дайын':'#27ae60','Жеткізілді':'#3498db' };

        tbody.innerHTML = orders.map(o => {
            const dishes  = (o.dishes||[]).map(d=>d.name).join(', ') || '—';
            const color   = colors[o.status] || '#888';
            const options = ['Жаңа','Дайындалуда','Дайын','Жеткізілді']
                .map(s=>`<option ${s===o.status?'selected':''} value="${s}">${s}</option>`).join('');

            return `
                <tr style="border-bottom:1px solid #2a2a4a;">
                    <td style="padding:12px 8px;color:#888;">#${o.id}</td>
                    <td style="padding:12px 8px;font-weight:600;">${o.customer_name}</td>
                    <td style="padding:12px 8px;color:#bbb;font-size:12px;">${dishes}</td>
                    <td style="padding:12px 8px;text-align:right;">
                        <div style="font-weight:700;color:#e74c3c;">${(o.final_total||0).toLocaleString()} ₸</div>
                        ${o.discount_value>0?`<div style="font-size:11px;color:#27ae60;">-${o.discount_value} ₸</div>`:''}
                    </td>
                    <td style="padding:12px 8px;text-align:center;">
                        <select class="status-sel" data-id="${o.id}" style="
                            background:${color}22;color:${color};border:1px solid ${color};
                            border-radius:20px;padding:4px 10px;font-size:12px;cursor:pointer;outline:none;">
                            ${options}
                        </select>
                    </td>
                    <td style="padding:12px 8px;color:#888;font-size:12px;">${o.created_at||'—'}</td>
                    <td style="padding:12px 8px;text-align:center;">
                        <button class="del-btn" data-id="${o.id}" style="
                            background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.3);
                            color:#e74c3c;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px;">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.querySelectorAll('.status-sel').forEach(sel => {
            sel.addEventListener('change', async () => {
                await updateOrderStatus(sel.dataset.id, sel.value);
                renderAdminTable(filterStatus);
            });
        });

        tbody.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Жою керек пе?')) return;
                await deleteOrder(btn.dataset.id);
                renderAdminTable(filterStatus);
            });
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#e74c3c;">
            ❌ Сервер қосылмаған!<br><br>
            <small style="color:#888;">Терминалда мынаны іске қосыңыз:<br>
            <code style="background:#2a2a4a;padding:4px 10px;border-radius:4px;color:#fff;">node server.js</code></small>
        </td></tr>`;
    }
};