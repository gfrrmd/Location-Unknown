const quotes = [
  "I wondered if you would notice the quiet.",
  "I disappeared before I could say I was disappointed.",
  "Maybe this is what distance feels like when only one person is trying.",
  "I am not asking you to chase me. I just wanted to know if you would look.",
  "Somewhere between missing you and missing who we were, I lost my way.",
  "If you ever wondered where I went — I was waiting to feel wanted without having to ask.",
  "I left the room quietly. I was tired of feeling alone in it with you."
];

const quoteEl = document.getElementById('quote');
const music   = document.getElementById('music');
const coordEl = document.getElementById('coord');
const clockEl = document.getElementById('clock');
let   idx     = 0;

// ── Clock ───────────────────────────────────────────
function updateClock() {
  const n = new Date();
  const pad = v => String(v).padStart(2,'0');
  clockEl.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── Coordinates ─────────────────────────────────────
function updateCoord() {
  const lat = (Math.random()*180-90).toFixed(4);
  const lng = (Math.random()*360-180).toFixed(4);
  coordEl.textContent = `LAT ${lat} / LNG ${lng}`;
}
setInterval(updateCoord, 2200);

// ── Radar canvas ────────────────────────────────────
const canvas = document.getElementById('radar');
const ctx    = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const cx = W/2, cy = H/2, R = W/2 - 4;
let   sweep = 0;
const dots  = [];

// generate random blips
for (let i = 0; i < 5; i++) {
  const angle = Math.random() * Math.PI * 2;
  const dist  = Math.random() * R * .82;
  dots.push({ x: cx + Math.cos(angle)*dist, y: cy + Math.sin(angle)*dist, alpha: 0 });
}

function drawRadar() {
  ctx.clearRect(0, 0, W, H);

  // bg
  ctx.fillStyle = '#061008';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

  // grid rings
  [.33, .66, 1].forEach(f => {
    ctx.beginPath();
    ctx.arc(cx, cy, R*f, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(57,255,138,.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // crosshairs
  ctx.strokeStyle = 'rgba(57,255,138,.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-R, cy); ctx.lineTo(cx+R, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy-R); ctx.lineTo(cx, cy+R); ctx.stroke();

  // sweep trail
  const trail = ctx.createConicalGradient
    ? null : null; // fallback below
  for (let t = 0; t < 60; t++) {
    const a = sweep - (t * Math.PI/180);
    const alpha = (1 - t/60) * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a, a + Math.PI/180);
    ctx.closePath();
    ctx.fillStyle = `rgba(57,255,138,${alpha})`;
    ctx.fill();
  }

  // sweep line
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sweep)*R, cy + Math.sin(sweep)*R);
  ctx.strokeStyle = 'rgba(57,255,138,.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // blips — light up when sweep passes near
  dots.forEach(d => {
    const angle = Math.atan2(d.y - cy, d.x - cx);
    const diff  = ((sweep - angle) % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
    if (diff < 0.15) d.alpha = 1;
    else d.alpha = Math.max(0, d.alpha - 0.012);

    if (d.alpha > 0) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 3, 0, Math.PI*2);
      ctx.fillStyle = `rgba(57,255,138,${d.alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(d.x, d.y, 6, 0, Math.PI*2);
      ctx.fillStyle = `rgba(57,255,138,${d.alpha * .25})`;
      ctx.fill();
    }
  });

  // center dot
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2);
  ctx.fillStyle = '#39ff8a'; ctx.fill();

  sweep += 0.03;
  requestAnimationFrame(drawRadar);
}
drawRadar();

// ── Quotes ──────────────────────────────────────────
function showQuote() {
  quoteEl.classList.remove('show');
  setTimeout(() => {
    quoteEl.textContent = '> ' + quotes[idx];
    quoteEl.classList.add('show');
    idx = (idx + 1) % quotes.length;
  }, 600);
}
showQuote();
setInterval(showQuote, 7000);

// ── Autoplay ─────────────────────────────────────────
function tryPlay() {
  music.volume = 0.6;
  music.play().catch(() => {});
}
tryPlay();
document.addEventListener('click',      tryPlay, { once: true });
document.addEventListener('touchstart', tryPlay, { once: true });
document.addEventListener('keydown',    tryPlay, { once: true });

// ── Button interactions ──────────────────────────────
document.getElementById('btnA').addEventListener('click', () => { showQuote(); });
document.getElementById('btnB').addEventListener('click', () => {
  music.paused ? music.play() : music.pause();
});
document.getElementById('btnStart').addEventListener('click', () => {
  document.querySelector('.radar-label').textContent =
    document.querySelector('.radar-label').textContent === 'SIGNAL LOST' ? 'CONNECTING...' : 'SIGNAL LOST';
});
