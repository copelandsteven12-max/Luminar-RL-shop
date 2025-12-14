// Neon particle background
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let w, h, particles;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function makeParticles(count = 110) {
  particles = new Array(count).fill().map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2 + 0.8,
    a: Math.random() * Math.PI * 2,
    spd: Math.random() * 0.7 + 0.2,
    hue: Math.random() > 0.5 ? 170 : 310 // teal or magenta
  }));
}
makeParticles();

function draw() {
  // subtle trail
  ctx.fillStyle = 'rgba(13,13,13,0.22)';
  ctx.fillRect(0,0,w,h);

  particles.forEach(p => {
    p.a += 0.012 * p.spd;
    p.x += Math.cos(p.a) * p.spd * 2;
    p.y += Math.sin(p.a) * p.spd * 2;

    // wrap
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10;
    if (p.y > h + 10) p.y = -10;

    const color = `hsla(${p.hue}, 100%, 60%, 0.9)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fill();
  });

  requestAnimationFrame(draw);
}
draw();

// Simple cart/basket logic
const basket = [];
const basketList = document.getElementById('basketList');
const basketTotalEl = document.getElementById('basketTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const donateBtn = document.getElementById('donateBtn'); // present only on donate page

function addonPrice(value) {
  switch (value) {
    case 'stream': return 3;
    case 'priority': return 5;
    case 'coaching': return 10;
    case 'vpn': return 0;
    default: return 0;
  }
}

function addToBasket(itemId, basePrice, addonLabel, addonValue) {
  const price = basePrice + addonPrice(addonValue);
  basket.push({ itemId, basePrice, addonLabel, addonValue, price });
  renderBasket();
}

function renderBasket() {
  if (!basketList || !basketTotalEl) return;
  basketList.innerHTML = '';
  let total = 0;
  basket.forEach((it, idx) => {
    total += it.price;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${it.itemId}${it.addonLabel ? ' + ' + it.addonLabel : ''}</span>
      <span>£${it.price.toFixed(2)}</span>
      <button class="btn ghost" data-remove="${idx}">Remove</button>
    `;
    basketList.appendChild(li);
  });
  basketTotalEl.textContent = total.toFixed(2);

  basketList.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.getAttribute('data-remove'), 10);
      basket.splice(i, 1);
      renderBasket();
    });
  });
}

function wireShop() {
  document.querySelectorAll('.actions').forEach(act => {
    const addonSelect = act.querySelector('select.addon');
    const addBtn = act.querySelector('button.add');
    const buyBtn = act.querySelector('button.buy');

    function getAddon() {
      const val = addonSelect ? addonSelect.value : '';
      let label = '';
      if (val === 'stream') label = 'Streaming +£3';
      if (val === 'priority') label = 'Priority +£5';
      if (val === 'coaching') label = 'Coaching (1h) £10';
      if (val === 'vpn') label = 'VPN/offline Free';
      return { val, label };
    }

    addBtn?.addEventListener('click', () => {
      const itemId = addBtn.getAttribute('data-item');
      const price = parseFloat(addBtn.getAttribute('data-price'));
      const { val, label } = getAddon();
      addToBasket(itemId, price, label, val);
    });

    buyBtn?.addEventListener('click', () => {
      const itemId = buyBtn.getAttribute('data-item');
      const price = parseFloat(buyBtn.getAttribute('data-price'));
      const { val, label } = getAddon();
      addToBasket(itemId, price, label, val);
      alert('Proceed to checkout — connect Stripe/PayPal here.');
    });
  });
}
wireShop();

checkoutBtn?.addEventListener('click', () => {
  alert('Checkout — connect to your payment processor.');
});

donateBtn?.addEventListener('click', () => {
  alert('Donate — hook up to Stripe/PayPal or a tip link.');
});