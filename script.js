// ═══════════════════════════════════════
//  MANDTEKAD — shared site JS
// ═══════════════════════════════════════

// ── NAV active link ───────────────────
(function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') ||
        (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── NAV scroll shadow ─────────────────
const nav = document.querySelector('nav');
if (nav) window.addEventListener('scroll', () =>
  nav.classList.toggle('scrolled', window.scrollY > 60), {passive:true});

// ── HAMBURGER ─────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });
  // Close nav when a link is tapped on mobile
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ── THEME TOGGLE ──────────────────────
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    themeBtn.textContent = isLight ? '☀' : '☽';
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });
  // Restore saved theme
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    themeBtn.textContent = saved === 'light' ? '☽' : '☀';
  }
}

// ── REVEAL ON SCROLL ──────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, {threshold: 0.08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── LIGHTBOX ──────────────────────────
function openLightbox(img) {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  if (!lb || !lbImg) return;
  lbImg.src = img.src; lbImg.alt = img.alt || '';
  lb.classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ── CAROUSELS ─────────────────────────
function carouselGoto(id, idx) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const track = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dots = wrap.querySelectorAll('.carousel-dot');
  const cap = document.getElementById(id+'-cap');
  const caps = (wrap.dataset.captions||'').split('|');
  idx = ((idx % slides.length) + slides.length) % slides.length;
  wrap.dataset.idx = idx;
  track.style.transform = `translateX(-${idx*100}%)`;
  dots.forEach((d,i) => d.classList.toggle('active', i===idx));
  if (cap) cap.textContent = caps[idx] || '';
}
function carouselMove(id, dir) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  carouselGoto(id, parseInt(wrap.dataset.idx||0) + dir);
}
document.querySelectorAll('.carousel-wrap').forEach(wrap => {
  let sx = 0;
  wrap.addEventListener('touchstart', e => sx = e.touches[0].clientX, {passive:true});
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) carouselMove(wrap.id, dx < 0 ? 1 : -1);
  }, {passive:true});
});

// ── STATS (stories page only) ─────────
const FALLBACKS = {
  crucible:  {chapters:'17',  words:'91,325',  updated:'Apr 2026'},
  woe:       {chapters:'15',  words:'72,281',  updated:'Apr 2026'},
  shadow:    {chapters:'21',  words:'100,335', updated:'Apr 2026'},
  lightning: {chapters:'28',  words:'261,036', updated:'Apr 2026'},
  frost:     {chapters:'8',   words:'50,241',  updated:'Jul 2025'},
};
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el && val != null) el.textContent = val;
}
function applyStory(key, data) {
  const fb = FALLBACKS[key] || {};
  const d = data || {};
  // All stories now use individual ch/w/upd elements
  setEl(key+'-ch',  d.chapters || fb.chapters);
  setEl(key+'-w',   d.words    || fb.words);
  setEl(key+'-upd', d.updated  || fb.updated);
  // Legacy meta element support (in case old HTML version still present)
  const meta = document.getElementById(key+'-meta');
  if (meta) {
    const ch = d.chapters || fb.chapters;
    const w  = d.words    || fb.words;
    meta.textContent = ch && w ? ch + ' ch · ' + w + ' words · Active' : 'Active';
  }
}
async function loadStats() {
  const status = document.getElementById('liveStatus');
  try {
    const res = await fetch('stats.json', {cache:'no-cache', signal:AbortSignal.timeout(6000)});
    if (!res.ok) throw new Error('fetch failed');
    const json = await res.json();
    Object.entries(json.stories || {}).forEach(([k,v]) => applyStory(k,v));
    const date = json.fetched_at ? new Date(json.fetched_at).toLocaleDateString() : 'today';
    if (status) status.textContent = `Live data · last updated ${date}`;
  } catch {
    Object.keys(FALLBACKS).forEach(k => applyStory(k, null));
    if (status) status.textContent = 'Cached counts';
  }
}
if (document.getElementById('liveStatus')) loadStats();

// ── WAR SEATS ─────────────────────────
(function() {
  const seats = document.getElementById('warSeats');
  if (!seats) return;
  for (let i = 0; i < 13; i++) {
    const s = document.createElement('div');
    s.className = 'seat';
    seats.appendChild(s);
  }
})();

// ── EMAIL SUBSCRIBE ───────────────────
async function subscribe() {
  const input = document.getElementById('subEmail');
  const msg   = document.getElementById('subMsg');
  const btn   = document.getElementById('subBtn');
  if (!input || !input.value.includes('@')) {
    if (msg) msg.textContent = 'Enter a valid email.'; return;
  }
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
  try {
    await emailjs.send('service_xjmsgod','template_fysrzy9',
      {email:input.value},'c1HXsUXEakxSjzr6X');
    if (input) input.value = '';
    if (msg) { msg.textContent='Subscribed. Welcome to the cult.'; msg.style.color='var(--acc)'; }
    if (btn) btn.style.display='none';
  } catch {
    if (msg) msg.textContent='Something went wrong. Try again.';
    if (btn) { btn.textContent='Subscribe'; btn.disabled=false; }
  }
}

// ── CONTACT FORM ──────────────────────
async function sendContact(e) {
  e && e.preventDefault();
  const name  = document.getElementById('contactName')?.value;
  const email = document.getElementById('contactEmail')?.value;
  const msg   = document.getElementById('contactMsg')?.value;
  const status = document.getElementById('contactStatus');
  if (!name || !email || !msg) { if(status) status.textContent='Fill in all fields.'; return; }
  if(status) status.textContent='Sending…';
  try {
    await emailjs.send('service_xjmsgod','template_fysrzy9',
      {name,email,message:msg},'c1HXsUXEakxSjzr6X');
    if(status) { status.textContent="Message sent. I'll be in touch."; status.style.color='var(--acc)'; }
    document.getElementById('contactName').value='';
    document.getElementById('contactEmail').value='';
    document.getElementById('contactMsg').value='';
  } catch {
    if(status) status.textContent='Something went wrong. Email me directly.';
  }
}
const contactForm = document.getElementById('contactForm');
if (contactForm) contactForm.addEventListener('submit', sendContact);
