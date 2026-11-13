// VERDANT interactions
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver((entries, obs) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) } }), { threshold: .12, rootMargin: '0px 0px -35px 0px' }); revealEls.forEach(el => observer.observe(el)) } else revealEls.forEach(el => el.classList.add('is-visible'));

const filterButtons = document.querySelectorAll('.filter-btn'), menuItems = document.querySelectorAll('.menu-item');
filterButtons.forEach(btn => btn.addEventListener('click', () => { const filter = btn.dataset.filter; filterButtons.forEach(b => b.classList.toggle('active', b === btn)); menuItems.forEach(item => { const show = filter === 'all' || item.dataset.category === filter; item.classList.toggle('is-hidden', !show); if (show) requestAnimationFrame(() => item.classList.add('is-visible')) }) }));

const cart = new Map(); let toastTimer;
const $ = id => document.getElementById(id), money = n => `৳ ${n.toLocaleString('en-BD')}`;
const bagCountEl = $('bagCount'), bagCounter = $('bagCounter'), bagToast = $('bagToast'), toastMessage = $('toastMessage'), cartDrawer = $('cartDrawer'), cartBackdrop = $('cartBackdrop'), cartLines = $('cartLines'), cartEmpty = $('cartEmpty'), cartFooter = $('cartFooter');
const count = () => [...cart.values()].reduce((n, x) => n + x.quantity, 0), total = () => [...cart.values()].reduce((n, x) => n + x.price * x.quantity, 0);
function renderCart() { const qty = count(), sum = total(); bagCountEl.textContent = qty; bagCounter.setAttribute('aria-label', `Open shopping bag, ${qty} items`); $('cartHeaderCount').textContent = `(${qty})`; cartEmpty.hidden = qty > 0; cartFooter.hidden = qty === 0; $('cartSubtotal').textContent = money(sum); $('checkoutTotal').textContent = money(sum); cartLines.replaceChildren(); cart.forEach((item, name) => { const row = document.createElement('article'); row.className = 'cart-line'; const img = document.createElement('img'); img.src = item.image; img.alt = ''; const info = document.createElement('div'); info.className = 'cart-line-info'; const title = document.createElement('h3'); title.textContent = name; const price = document.createElement('span'); price.textContent = money(item.price); const controls = document.createElement('div'); controls.className = 'quantity-controls'; const makeBtn = (label, aria, fn, cls = '') => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.setAttribute('aria-label', aria); if (cls) b.className = cls; b.addEventListener('click', fn); return b }; const minus = makeBtn('−', `Remove one ${name}`, () => changeQty(name, -1)), number = document.createElement('span'); number.textContent = item.quantity; const plus = makeBtn('+', `Add one ${name}`, () => changeQty(name, 1)), remove = makeBtn('Remove', `Remove ${name} from bag`, () => { cart.delete(name); renderCart() }, 'remove-line'); controls.append(minus, number, plus, remove); info.append(title, price, controls); const lineTotal = document.createElement('strong'); lineTotal.className = 'cart-line-total'; lineTotal.textContent = money(item.price * item.quantity); row.append(img, info, lineTotal); cartLines.append(row) }) }
function changeQty(name, delta) { const item = cart.get(name); if (!item) return; item.quantity += delta; if (item.quantity <= 0) cart.delete(name); renderCart() }
function toast(msg) { toastMessage.textContent = msg; bagToast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => bagToast.classList.remove('show'), 2300) }
document.querySelectorAll('.quick-add').forEach(btn => btn.addEventListener('click', () => { const card = btn.closest('.menu-item'), name = btn.dataset.name, price = Number(card.querySelector('.food-meta span:last-child').textContent.replace(/[^\d]/g, '')), image = card.querySelector('.food-image img').src; const item = cart.get(name); if (item) item.quantity++; else cart.set(name, { price, image, quantity: 1 }); renderCart(); toast(`${name} added to your bag`) }));
function openCart() { cartDrawer.classList.add('is-open'); cartDrawer.setAttribute('aria-hidden', 'false'); cartBackdrop.hidden = false; bagCounter.setAttribute('aria-expanded', 'true'); document.body.classList.add('cart-open'); $('closeCart').focus() }
function closeCart() { cartDrawer.classList.remove('is-open'); cartDrawer.setAttribute('aria-hidden', 'true'); cartBackdrop.hidden = true; bagCounter.setAttribute('aria-expanded', 'false'); document.body.classList.remove('cart-open') }
bagCounter.addEventListener('click', openCart); $('closeCart').addEventListener('click', closeCart); cartBackdrop.addEventListener('click', closeCart); $('continueShopping').addEventListener('click', () => { closeCart(); $('menu').scrollIntoView({ behavior: 'smooth' }) }); $('keepShopping').addEventListener('click', closeCart);
$('checkoutButton').addEventListener('click', () => { if (!cart.size) return; $('checkoutTotal').textContent = money(total()); $('checkoutBackdrop').hidden = false; $('customerName').focus() }); function closeCheckout() { $('checkoutBackdrop').hidden = true } $('closeCheckout').addEventListener('click', closeCheckout); $('checkoutBackdrop').addEventListener('click', e => { if (e.target === $('checkoutBackdrop')) closeCheckout() });
// Set this to your WhatsApp Business number in international format, digits only.
// Bangladesh example: 8801XXXXXXXXX (do not include +, spaces, or dashes).
const WHATSAPP_BUSINESS_NUMBER = '8801951848572';

$('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity() || !cart.size) return;

    if (!/^\d{8,15}$/.test(WHATSAPP_BUSINESS_NUMBER)) {
        $('checkoutFeedback').textContent = 'Please add your WhatsApp Business number in script.js first (WHATSAPP_BUSINESS_NUMBER).';
        return;
    }

    const order = {
        id: `VRD-${Date.now().toString().slice(-7)}`,
        customer: form.elements.customerName.value.trim(),
        phone: form.elements.customerPhone.value.trim(),
        address: form.elements.deliveryAddress.value.trim(),
        payment: form.elements.paymentMethod.value,
        items: [...cart].map(([name, item]) => ({ name, quantity: item.quantity, price: item.price })),
        total: total()
    };
    const lines = [
        '*NEW VERDANT ORDER*',
        `Order: ${order.id}`,
        '',
        `*Name:* ${order.customer}`,
        `*Customer phone:* ${order.phone}`,
        `*Delivery address:* ${order.address}`,
        `*Preferred payment:* ${order.payment}`,
        '',
        '*ORDER ITEMS*',
        ...order.items.map(item => `• ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`),
        '',
        `*Subtotal: ${money(order.total)}*`,
        '',
        'Please confirm availability, delivery fee, and final total. Thank you!'
    ];
    const url = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    $('checkoutFeedback').textContent = 'WhatsApp is opening with your order. Press Send in WhatsApp to submit it to us.';
    cart.clear();
    renderCart();
    form.reset();
    setTimeout(() => { closeCheckout(); closeCart() }, 1800);
});
const newsletterForm = $('newsletterForm'), formFeedback = $('formFeedback'); newsletterForm.addEventListener('submit', e => { e.preventDefault(); const email = $('emailInput'); if (!email.checkValidity()) { email.reportValidity(); return } formFeedback.textContent = 'You’re on the list. A little goodness is headed your way!'; newsletterForm.reset() });
document.querySelectorAll('#mainNav .nav-link,#mainNav .nav-cta').forEach(link => link.addEventListener('click', () => { const nav = $('mainNav'); if (nav.classList.contains('show') && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(nav).hide() }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('checkoutBackdrop').hidden) closeCheckout(); else if (cartDrawer.classList.contains('is-open')) closeCart() } }); renderCart();
