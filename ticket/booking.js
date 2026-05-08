/* ======================================================
   GEM Booking — single-page flow (Steps 1–4)
   ====================================================== */

/* ---------- STATE ---------- */
const state = {
    step: 1,
    dateSelected: false,
    pricing: {
        Egyptian:  { adult: 200,  child: 100, student: 100, senior: 100 },
        Arab:      { adult: 1590, child: 800, student: 800, senior: null },
        Foreigner: { adult: 800,  child: 400, student: 400, senior: null }
    },
    counts: {
        Egyptian:  { adult: 0, child: 0, student: 0, senior: 0 },
        Arab:      { adult: 0, child: 0, student: 0, senior: 0 },
        Foreigner: { adult: 0, child: 0, student: 0, senior: 0 }
    },
    ticketType: 'Admission',
    nationality: null,
    date: null,
    time: null,
    tourLanguage: null,
    addons: {
        'child-museum': { name: "Children's Museum", price: 150, count: 0, selected: false },
        'discovery':    { name: "GEM Discovery Challenge", price: 125, count: 0, selected: false }
    },
    contact: { name: '', email: '', mobile: '', nationality: '' },
    promo: { code: null, discount: 0 }
};

/* ---------- POPUP MODAL ---------- */
function showPopup(message, type = 'warning', title = null) {
    const overlay = document.getElementById('modal-overlay');
    const icon    = document.getElementById('modal-icon');
    const titleEl = document.getElementById('modal-title');
    const msgEl   = document.getElementById('modal-message');
    const btn     = document.getElementById('modal-btn');

    if (!overlay) return;

    const titles = {
        warning: 'Heads up',
        error:   'Oops',
        success: 'All set',
        info:    'Just so you know'
    };

    const icons = {
        warning: '!',
        error:   '✕',
        success: '✓',
        info:    'i'
    };

    icon.className = `modal-icon ${type}`;
    icon.innerText = icons[type] || '!';
    titleEl.innerText = title || titles[type] || 'Notice';
    msgEl.innerText = message;

    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => { overlay.hidden = true; }, 250);
        btn.removeEventListener('click', close);
        overlay.removeEventListener('click', backdropClose);
    };

    const backdropClose = (e) => {
        if (e.target === overlay) close();
    };

    btn.addEventListener('click', close);
    overlay.addEventListener('click', backdropClose);
}

/* ---------- PRICE HELPERS ---------- */
function currentPrices() {
    return state.pricing[state.nationality] || { adult: 0, child: 0, student: 0, senior: 0 };
}

function currentCounts() {
    return state.counts[state.nationality] || { adult: 0, child: 0, student: 0, senior: 0 };
}

function updatePriceLabels() {
    const p = currentPrices();
    document.querySelectorAll('.row-price').forEach(el => {
        const row   = el.dataset.row;
        const price = p[row];
        const rowEl = el.closest('.ticket-row');

        if (state.nationality && (price === null || price === undefined)) {
            if (rowEl) rowEl.hidden = true;
        } else {
            if (rowEl) rowEl.hidden = false;
            el.innerText = state.nationality ? price : '—';
        }
    });
}

function refreshCounters() {
    const c = currentCounts();
    ['adult', 'child', 'student', 'senior'].forEach(type => {
        const el = document.getElementById(type);
        if (el) el.innerText = c[type] || 0;
    });
}

/* ---------- STEP NAVIGATION ---------- */
function goToStep(n) {
    if (n < 1 || n > 4) return;

    if (state.step === 1 && n === 2) {
        if (!validateStep1()) return;
    }
    if (state.step === 3 && n === 4) {
        if (!captureContact()) return;
    }

    state.step = n;

    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${n}`).classList.add('active');

    document.querySelectorAll('.stepper .step').forEach(s => {
        s.classList.remove('active', 'done');
        const i = parseInt(s.dataset.step, 10);
        if (i === n) s.classList.add('active');
        else if (i < n) s.classList.add('done');
    });

    if (n === 4) renderReview();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- STEP 1 VALIDATION ---------- */
function validateStep1() {
    const missing = [];

    if (!state.dateSelected) missing.push('a date');
    if (!state.time)         missing.push('a time slot');
    if (totalTickets() < 1)  missing.push('at least one ticket');

    if (state.ticketType.includes('Guided') && !state.tourLanguage) {
        missing.push('a tour language');
    }

    if (missing.length) {
        showPopup(`Please select ${missing.join(', ')} before continuing.`, 'warning');
        return false;
    }
    return true;
}

/* ---------- TICKET COUNTER ---------- */
function change(type, val) {
    if (!state.nationality) {
        showPopup('Please select a nationality before adding tickets.', 'warning');
        return;
    }
    const c = state.counts[state.nationality];
    c[type] = Math.max(0, c[type] + val);
    document.getElementById(type).innerText = c[type];
    updateSummary();
}

/* ---------- ADD-ON COUNTER ---------- */
function changeAddon(key, delta) {
    const addon = state.addons[key];
    if (!addon) return;

    addon.count = Math.max(0, (addon.count || 0) + delta);
    addon.selected = addon.count > 0;

    const countEl = document.getElementById(`${key}-count`);
    if (countEl) countEl.innerText = addon.count;

    const card = document.querySelector(`.addon-card[data-addon="${key}"]`);
    if (card) card.classList.toggle('selected', addon.selected);

    updateSummary();
}

/* ---------- CONDITIONAL SECTIONS ---------- */
function updateConditionalSections() {
    const admission = document.querySelector('.admission-only');
    const guided    = document.querySelector('.guided-only');
    if (!admission || !guided) return;

    const isGuided = state.ticketType.includes('Guided');
    admission.hidden = !(state.dateSelected && !isGuided);
    guided.hidden    = !(state.dateSelected &&  isGuided);
}

/* ---------- CALENDAR ---------- */
const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

const today = new Date();
today.setHours(0, 0, 0, 0);

let viewYear  = today.getFullYear();
let viewMonth = today.getMonth();

function buildCalendar() {
    const dates = document.getElementById('dates');
    const label = document.getElementById('monthLabel');
    dates.innerHTML = '';

    if (label) label.innerText = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('span');
        empty.className = 'empty';
        dates.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const el = document.createElement('span');
        el.innerText = d;

        const cellDate  = new Date(viewYear, viewMonth, d);
        const dateLabel = `${MONTH_NAMES[viewMonth]} ${d}, ${viewYear}`;

        if (cellDate < today) {
            el.classList.add('disabled');
        } else {
            el.onclick = () => {
                dates.querySelectorAll('span').forEach(x => x.classList.remove('active'));
                el.classList.add('active');
                state.date = dateLabel;
                state.dateSelected = true;
                updateConditionalSections();
                updateSummary();
            };
        }

        if (cellDate.getTime() === today.getTime()) {
            el.classList.add('today');
        }

        if (state.date === dateLabel) {
            el.classList.add('active');
        }

        dates.appendChild(el);
    }
}

/* ---------- MONTH NAVIGATION ---------- */
function bindMonthNav() {
    const arrows = document.querySelectorAll('.calendar .nav-arrow');
    if (arrows.length < 2) return;
    const [prevBtn, nextBtn] = arrows;

    prevBtn.onclick = () => {
        if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) return;
        viewMonth--;
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        buildCalendar();
    };

    nextBtn.onclick = () => {
        viewMonth++;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        buildCalendar();
    };
}

/* ---------- TIME SLOTS ---------- */
function bindTimes() {
    document.querySelectorAll('.time').forEach(btn => {
        btn.onclick = () => {
            const row = btn.parentElement;
            row.querySelectorAll('.time').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.time = btn.innerText;
            updateSummary();
        };
    });
}

/* ---------- TICKET TYPE ---------- */
function bindTicketType() {
    const buttons = document.querySelectorAll('#ticketType button');
    buttons.forEach(btn => {
        btn.onclick = () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.ticketType = btn.dataset.value || btn.innerText;

            state.time = null;
            document.querySelectorAll('.time').forEach(b => b.classList.remove('active'));

            updateConditionalSections();
            updateSummary();
        };
    });
}

/* ---------- TOUR LANGUAGE ---------- */
function bindTourLanguage() {
    const buttons = document.querySelectorAll('.guided-only .btn-group button');
    buttons.forEach(btn => {
        btn.onclick = () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.tourLanguage = btn.dataset.value || btn.innerText;
            updateSummary();
        };
    });
}

/* ---------- NATIONALITY TAGS ---------- */
function bindTags() {
    const ticketBox = document.querySelector('.nationality-ticket');
    document.querySelectorAll('.tag').forEach(tag => {
        tag.onclick = () => {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            state.nationality = tag.dataset.value || tag.innerText;
            if (ticketBox) ticketBox.hidden = false;
            updatePriceLabels();
            refreshCounters();
            updateSummary();
        };
    });
}

/* ---------- ACCORDION TOGGLE ---------- */
function toggleText(index) {
    const contents = document.querySelectorAll(".content");
    const current = contents[index];

    if (current.style.display === "block") {
        current.style.display = "none";
    } else {
        current.style.display = "block";
    }
}

/* ---------- CONTACT CAPTURE ---------- */
function captureContact() {
    const name   = document.getElementById('f-name').value.trim();
    const email  = document.getElementById('f-email').value.trim();
    const mobile = document.getElementById('f-mobile').value.trim();
    const nat    = document.getElementById('f-nat').value;

    if (!name) {
        showPopup('Please enter your full name.', 'warning');
        return false;
    }
    if (!email) {
        showPopup('Please enter your email address.', 'warning');
        return false;
    }
    if (!mobile) {
        showPopup('Please enter your mobile number.', 'warning');
        return false;
    }

    // Mobile must be digits/spaces only and 7–15 digits long
    const digits = mobile.replace(/\s+/g, '');
    if (!/^\d{7,15}$/.test(digits)) {
        showPopup('Please enter a valid mobile number (digits only).', 'error');
        return false;
    }

    if (!nat) {
        showPopup('Please select your nationality.', 'warning');
        return false;
    }

    state.contact = { name, email, mobile, nationality: nat };
    return true;
}

/* ---------- SUMMARIES ---------- */
function totalTickets() {
    let total = 0;
    for (const nat in state.counts) {
        for (const type in state.counts[nat]) {
            total += state.counts[nat][type];
        }
    }
    return total;
}

function ticketsSubtotal() {
    let t = 0;
    for (const nat in state.counts) {
        const p = state.pricing[nat] || {};
        for (const type in state.counts[nat]) {
            if (p[type]) t += state.counts[nat][type] * p[type];
        }
    }
    return t;
}

function addonsSubtotal() {
    let t = 0;
    for (const k in state.addons) {
        const a = state.addons[k];
        if (a.count > 0) t += a.price * a.count;
    }
    return t;
}

function grandTotal() {
    return ticketsSubtotal() + addonsSubtotal() - state.promo.discount;
}

function selectedNationalitiesText() {
    const nats = [];
    for (const nat in state.counts) {
        let sum = 0;
        for (const type in state.counts[nat]) sum += state.counts[nat][type];
        if (sum > 0) nats.push(nat);
    }
    return nats.length ? nats.join(', ') : '—';
}

function updateSummary() {
    const tk = totalTickets();
    document.getElementById('s-badge').innerText =
        `${tk || 0} ticket${tk === 1 ? '' : 's'} selected`;
    document.getElementById('s-date').innerText = state.date || '—';
    document.getElementById('s-time').innerText = state.time || '—';
    document.getElementById('s-ticket').innerText =
        `${state.ticketType} · ${selectedNationalitiesText()}`;
    document.getElementById('s-count').innerText = tk;

    const addonNames = Object.values(state.addons)
        .filter(a => a.count > 0)
        .map(a => `${a.name} × ${a.count}`);
    const addonsRow = document.getElementById('s-addons-row');
    if (addonNames.length) {
        addonsRow.style.display = 'flex';
        document.getElementById('s-addons').innerText = addonNames.join(', ');
    } else {
        addonsRow.style.display = 'none';
    }

    document.getElementById('s-total').innerText = `${grandTotal()} EGP`;
}

/* ---------- REVIEW (Step 4) ---------- */
function renderReview() {
    document.getElementById('r-datetime').innerText =
        `${state.date || '—'} · ${state.time || '—'}`;
    document.getElementById('r-type').innerText =
        `${state.ticketType} · ${selectedNationalitiesText()}`;
    document.getElementById('r-count').innerText = totalTickets();
    document.getElementById('r-name').innerText = state.contact.name || '—';
    document.getElementById('r-email').innerText = state.contact.email || '—';
    document.getElementById('r-mobile').innerText =
        state.contact.mobile ? `+20 ${state.contact.mobile}` : '—';
    document.getElementById('r-nat').innerText = state.contact.nationality || '—';

    renderBreakdown();
}

function renderBreakdown() {
    const box = document.getElementById('payment-breakdown');
    const lines = [];

    const labels = {
        adult: 'Adult', child: 'Child',
        student: 'Student', senior: 'Senior'
    };

    for (const nat in state.counts) {
        const p = state.pricing[nat] || {};
        for (const type in state.counts[nat]) {
            const count = state.counts[nat][type];
            if (count > 0 && p[type]) {
                lines.push(
                    `<div class="price-line">
                        <span>${nat} · ${labels[type]} × ${count}</span>
                        <span>EGP ${count * p[type]}</span>
                    </div>`
                );
            }
        }
    }

    for (const k in state.addons) {
        const a = state.addons[k];
        if (a.count > 0) {
            lines.push(
                `<div class="price-line">
                    <span>Add-on · ${a.name} × ${a.count}</span>
                    <span>EGP ${a.price * a.count}</span>
                </div>`
            );
        }
    }

    const subtotal = ticketsSubtotal() + addonsSubtotal();
    lines.push(
        `<div class="price-line subtotal">
            <span>Subtotal</span><span>EGP ${subtotal}</span>
        </div>`
    );

    if (state.promo.discount > 0) {
        lines.push(
            `<div class="price-line discount">
                <span>Promo · ${state.promo.code}</span>
                <span>− EGP ${state.promo.discount}</span>
            </div>`
        );
    }

    lines.push(
        `<div class="price-line total-amount">
            <span>Total amount</span><span>EGP ${grandTotal()}</span>
        </div>`
    );

    box.innerHTML = lines.join('');
}

/* ---------- PROMO CODE ---------- */
function bindPromo() {
    const applyBtn = document.getElementById('apply-btn');
    const input    = document.getElementById('promo-input');
    const msg      = document.getElementById('promo-msg');

    applyBtn.addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        msg.className = 'promo-msg';
        msg.innerText = '';

        if (!code) {
            msg.classList.add('error');
            msg.innerText = 'Please enter a promo code.';
            return;
        }

        if (code === 'DISCOUNT10') {
            const subtotal = ticketsSubtotal() + addonsSubtotal();
            state.promo = { code, discount: Math.round(subtotal * 0.10) };
            msg.classList.add('success');
            msg.innerText = `✓ 10% discount applied — EGP ${state.promo.discount} off.`;
            applyBtn.disabled = true;
            applyBtn.innerText = 'Applied';
            applyBtn.style.opacity = '.55';
        } else if (code === 'GEM50') {
            state.promo = { code, discount: 50 };
            msg.classList.add('success');
            msg.innerText = '✓ EGP 50 off applied.';
            applyBtn.disabled = true;
            applyBtn.innerText = 'Applied';
            applyBtn.style.opacity = '.55';
        } else {
            msg.classList.add('error');
            msg.innerText = 'Invalid promo code.';
            return;
        }

        renderBreakdown();
        updateSummary();
    });
}

/* ---------- PROCEED → CONFIRM BOOKING ---------- */
function showConfirmed() {
    const email = state.contact.email || 'your email';
    const panel = document.getElementById('panel-4');

    /* inject success banner at top of step 4 */
    const existing = document.getElementById('booking-success-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'booking-success-banner';
    banner.style.cssText = [
        'background:#0f2e0f', 'border:1px solid #2a6e2a',
        'border-radius:12px', 'padding:1.5rem 2rem',
        'margin-bottom:1.5rem', 'text-align:center'
    ].join(';');
    banner.innerHTML = `
        <div style="font-size:2.5rem;margin-bottom:.5rem">✅</div>
        <h3 style="color:#6fcf6f;font-size:1.2rem;font-weight:700;margin-bottom:.4rem">Booking Confirmed!</h3>
        <p style="color:#aaa;font-size:.9rem">A confirmation will be sent to <strong style="color:#fff">${email}</strong>.</p>
    `;
    panel.insertBefore(banner, panel.firstChild);

    /* hide back + proceed, reveal download */
    const proceedBtn  = document.getElementById('proceed-btn');
    const downloadBtn = document.getElementById('download-btn');
    const backBtn     = panel.querySelector('.btn-secondary');

    if (proceedBtn) proceedBtn.hidden = true;
    if (backBtn)    backBtn.hidden    = true;
    if (downloadBtn) downloadBtn.hidden = false;
}

function bindProceed() {
    const btn = document.getElementById('proceed-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        btn.textContent = 'Processing…';
        btn.style.opacity = '.7';
        btn.disabled = true;

        showConfirmed();
    });
}

/* ---------- DOWNLOAD BUTTON ---------- */
function bindDownload() {
    const btn = document.getElementById('download-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (!window.jspdf) {
            showPopup('PDF library not loaded. Please check your internet connection.', 'error');
            return;
        }
        btn.textContent = 'Generating…';
        btn.style.opacity = '.7';
        btn.disabled = true;

        setTimeout(() => {
            try {
                generateTicketPDF();
                showPopup('Your ticket has been downloaded.', 'success', 'Download ready');
            } catch (e) {
                console.error('PDF generation failed:', e);
                showPopup('Could not generate PDF. Please try again.', 'error');
            }
            btn.textContent = '⬇ Download Ticket';
            btn.style.opacity = '1';
            btn.disabled = false;
        }, 400);
    });
}

/* ---------- PDF GENERATION ---------- */
function generateTicketPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    let y = 0;

    /* ===== HEADER BAND ===== */
    doc.setFillColor(26, 26, 26);              // dark band
    doc.rect(0, 0, pageW, 90, 'F');

    doc.setFillColor(212, 184, 122);           // gold accent line
    doc.rect(0, 90, pageW, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GRAND EGYPTIAN MUSEUM', pageW / 2, 42, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(212, 184, 122);
    doc.text('Booking Confirmation', pageW / 2, 64, { align: 'center' });

    y = 130;

    /* ===== BOOKING REFERENCE ===== */
    const ref = 'GEM-' + Date.now().toString().slice(-8);
    const issued = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Booking Reference:  ${ref}`, 50, y);
    doc.text(`Issued:  ${issued}`, pageW - 50, y, { align: 'right' });
    y += 25;

    doc.setDrawColor(220, 220, 220);
    doc.line(50, y, pageW - 50, y);
    y += 30;

    /* ===== HELPER ===== */
    function sectionTitle(title) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(26, 26, 26);
        doc.text(title, 50, y);
        y += 8;
        doc.setDrawColor(212, 184, 122);
        doc.setLineWidth(1.2);
        doc.line(50, y, 110, y);
        doc.setLineWidth(0.5);
        y += 18;
    }

    function row(label, value) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(110, 110, 110);
        doc.text(label, 60, y);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text(String(value), pageW - 60, y, { align: 'right' });
        y += 18;
    }

    /* ===== VISIT DETAILS ===== */
    sectionTitle('Visit Details');
    row('Date',        state.date || '—');
    row('Time',        state.time || '—');
    row('Ticket Type', state.ticketType);
    if (state.ticketType.includes('Guided') && state.tourLanguage) {
        row('Tour Language', state.tourLanguage);
    }
    y += 10;

    /* ===== VISITOR ===== */
    sectionTitle('Visitor Information');
    row('Full Name',   state.contact.name || '—');
    row('Email',       state.contact.email || '—');
    row('Mobile',      state.contact.mobile ? `+20 ${state.contact.mobile}` : '—');
    row('Nationality', state.contact.nationality || '—');
    y += 10;

    /* ===== TICKETS ===== */
    sectionTitle('Tickets');
    const labels = { adult: 'Adult', child: 'Child', student: 'Student', senior: 'Senior' };
    let anyTicket = false;
    for (const nat in state.counts) {
        const p = state.pricing[nat] || {};
        for (const type in state.counts[nat]) {
            const c = state.counts[nat][type];
            if (c > 0 && p[type]) {
                row(`${nat} · ${labels[type]} × ${c}`, `EGP ${c * p[type]}`);
                anyTicket = true;
            }
        }
    }
    if (!anyTicket) row('No tickets selected', '—');
    y += 10;

    /* ===== ADD-ONS ===== */
    const hasAddons = Object.values(state.addons).some(a => a.count > 0);
    if (hasAddons) {
        sectionTitle('Add-Ons');
        for (const k in state.addons) {
            const a = state.addons[k];
            if (a.count > 0) row(`${a.name} × ${a.count}`, `EGP ${a.price * a.count}`);
        }
        y += 10;
    }

    /* ===== TOTAL ===== */
    sectionTitle('Payment Summary');
    const subtotal = ticketsSubtotal() + addonsSubtotal();
    row('Subtotal', `EGP ${subtotal}`);
    if (state.promo.discount > 0) {
        row(`Promo (${state.promo.code})`, `− EGP ${state.promo.discount}`);
    }
    y += 6;

    // total band
    doc.setFillColor(26, 26, 26);
    doc.rect(50, y - 4, pageW - 100, 32, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL PAID', 65, y + 16);
    doc.setTextColor(212, 184, 122);
    doc.setFontSize(15);
    doc.text(`EGP ${grandTotal()}`, pageW - 65, y + 16, { align: 'right' });
    y += 50;

    /* ===== FOOTER ===== */
    doc.setDrawColor(220, 220, 220);
    doc.line(50, y, pageW - 50, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const footerLines = [
        'Please present this confirmation (digital or printed) at the museum entrance.',
        'Tickets are non-transferable. Children under 6 enter free of charge.',
        'For assistance, contact: support@gem.eg  ·  +20 2 1234 5678',
        '',
        'Thank you for visiting the Grand Egyptian Museum.'
    ];
    footerLines.forEach(line => {
        doc.text(line, pageW / 2, y, { align: 'center' });
        y += 13;
    });

    /* ===== SAVE ===== */
    doc.save(`GEM-Booking-${ref}.pdf`);
}

/* ---------- STEPPER CLICKS ---------- */
function bindStepper() {
    document.querySelectorAll('.stepper .step').forEach(s => {
        s.style.cursor = 'pointer';
        s.addEventListener('click', () => {
            const i = parseInt(s.dataset.step, 10);
            if (i < state.step) goToStep(i);
        });
    });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
    buildCalendar();
    bindMonthNav();
    bindTimes();
    bindTicketType();
    bindTourLanguage();
    bindTags();
    bindPromo();
    bindProceed();
    bindDownload();  
    bindStepper();
    updateConditionalSections();
    updatePriceLabels();
    updateSummary();
});