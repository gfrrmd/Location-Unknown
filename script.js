const quoteEl    = document.getElementById('quote');
const music      = document.getElementById('music');
const coordEl    = document.getElementById('coord');
const clockEl    = document.getElementById('clock');
const radarLabel = document.getElementById('radarLabel');
const canvas     = document.getElementById('radar');
const toast      = document.getElementById('toast');
const musicStatus = document.getElementById('musicStatus');
const tapBanner  = document.getElementById('tapBanner');
const ctx        = canvas.getContext('2d');

const quotes = [
  "I wondered if you would notice the quiet.",
  "I disappeared before I could say I was disappointed.",
  "Maybe this is what distance feels like when only one person is trying.",
  "I am not asking you to chase me. I just wanted to know if you would look.",
  "Somewhere between missing you and missing who we were, I lost my way.",
  "If you ever wondered where I went \u2014 I was waiting to feel wanted without having to ask.",
  "I left the room quietly. I was tired of feeling alone in it with you."
];

let idx        = 0;
let sweep      = 0;
let sweepSpeed = 0.03;
let scanning   = true;
let toastTimer;
let musicUnlocked = false;

// ─ Toast
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ─ Music status indicator
function updateMusicStatus() {
  if (!musicStatus) return;
  if (music.paused) {
    musicStatus.textContent = '\u266A OFF';
    musicStatus.style.color = '#3a4050';
  } else {
    musicStatus.textContent = '\u266A ON';
    musicStatus.style.color = 'var(--g)';
  }
}

// ─ Unlock + play audio (requires user gesture)
function unlockAudio() {
  if (musicUnlocked) return;
  musicUnlocked = true;
  music.volume = 0.6;
  music.play().then(() => {
    if (tapBanner) tapBanner.style.display = 'none';
    updateMusicStatus();
  }).catch(() => {});
}

// Listen for any first interaction
['click','touchstart','keydown'].forEach(ev => {
  document.addEventListener(ev, unlockAudio, { once: true });
});

music.addEventListener('play',  updateMusicStatus);
music.addEventListener('pause', updateMusicStatus);

// ─ Radar
function resizeCanvas() {
  const size = Math.min(200, Math.floor(window.innerWidth * 0.55));
  canvas.width  = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const blips = [
  { nx:.62, ny:.28 }, { nx:.38, ny:.72 },
  { nx:.74, ny:.61 }, { nx:.22, ny:.44 }, { nx:.55, ny:.58 }
].map(b => ({ ...b, alpha: 0 }));

function drawRadar() {
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = W/2 - 3;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#050f07';
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();
  [.33,.66,1].forEach(f => {
    ctx.beginPath(); ctx.arc(cx, cy, R*f, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(61,255,143,.13)'; ctx.lineWidth = 1; ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(61,255,143,.13)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-R,cy); ctx.lineTo(cx+R,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-R); ctx.lineTo(cx,cy+R); ctx.stroke();
  if (scanning) {
    for (let t = 0; t < 55; t++) {
      const a = sweep - t*(Math.PI/180);
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.arc(cx, cy, R, a, a+Math.PI/180); ctx.closePath();
      ctx.fillStyle = `rgba(61,255,143,${(1-t/55)*0.22})`; ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(sweep)*R, cy+Math.sin(sweep)*R);
    ctx.strokeStyle = 'rgba(61,255,143,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  blips.forEach(b => {
    const bx = b.nx*W, by = b.ny*H;
    const angle = Math.atan2(by-cy, bx-cx);
    const diff  = ((sweep-angle)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    if (scanning && diff < 0.12) b.alpha = 1;
    else b.alpha = Math.max(0, b.alpha - 0.013);
    if (b.alpha > 0) {
      ctx.beginPath(); ctx.arc(bx,by,3,0,Math.PI*2);
      ctx.fillStyle = `rgba(61,255,143,${b.alpha})`; ctx.fill();
      ctx.beginPath(); ctx.arc(bx,by,7,0,Math.PI*2);
      ctx.fillStyle = `rgba(61,255,143,${b.alpha*.2})`; ctx.fill();
    }
  });
  ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2);
  ctx.fillStyle = '#3dff8f'; ctx.fill();
  sweep += sweepSpeed;
  requestAnimationFrame(drawRadar);
}
drawRadar();

// ─ Clock
function tick() {
  const d = new Date(), p = v => String(v).padStart(2,'0');
  clockEl.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
setInterval(tick, 1000); tick();

// ─ Coordinates
function updateCoord() {
  if (!scanning) return;
  const lat = (Math.random()*180-90).toFixed(4);
  const lng = (Math.random()*360-180).toFixed(4);
  coordEl.textContent = `LAT ${lat} / LNG ${lng}`;
}
setInterval(updateCoord, 2400);

// ─ Quotes
function showQuote(dir) {
  if (dir !== 0) idx = (idx + dir + quotes.length) % quotes.length;
  quoteEl.classList.remove('show');
  setTimeout(() => {
    quoteEl.textContent = '> ' + quotes[idx];
    quoteEl.classList.add('show');
  }, 500);
}
showQuote(0);
setInterval(() => showQuote(1), 7000);

// ─ Buttons
document.getElementById('dpUp').addEventListener('click', () => { showQuote(-1); showToast('PREV SIGNAL'); });
document.getElementById('dpDown').addEventListener('click', () => { showQuote(1); showToast('NEXT SIGNAL'); });
document.getElementById('dpLeft').addEventListener('click', () => {
  music.volume = Math.max(0, parseFloat((music.volume-.1).toFixed(1)));
  showToast(`VOL ${Math.round(music.volume*10)}/10`);
});
document.getElementById('dpRight').addEventListener('click', () => {
  music.volume = Math.min(1, parseFloat((music.volume+.1).toFixed(1)));
  showToast(`VOL ${Math.round(music.volume*10)}/10`);
});
document.getElementById('btnA').addEventListener('click', () => { showQuote(1); showToast('NEXT SIGNAL'); });
document.getElementById('btnB').addEventListener('click', () => {
  unlockAudio();
  if (music.paused) {
    music.play().then(updateMusicStatus).catch(()=>{});
    showToast('\u25B6 PLAYING');
  } else {
    music.pause();
    showToast('\u23F8 PAUSED');
  }
});
document.getElementById('btnX').addEventListener('click', () => {
  sweepSpeed = sweepSpeed === 0.03 ? 0.09 : 0.03;
  showToast(sweepSpeed > 0.03 ? 'SCAN FAST' : 'SCAN NORMAL');
});
document.getElementById('btnY').addEventListener('click', () => {
  scanning = !scanning;
  radarLabel.textContent = scanning ? 'SIGNAL LOST' : 'RADAR OFF';
  radarLabel.style.color = scanning ? 'var(--red)' : '#3a4050';
  showToast(scanning ? 'SCANNING ON' : 'SCANNING OFF');
});
document.getElementById('btnSelect').addEventListener('click', () => {
  idx = 0; showQuote(0); showToast('RESET SIGNAL');
});
document.getElementById('btnStart').addEventListener('click', () => {
  const l = radarLabel;
  if (l.textContent === 'SIGNAL LOST' || l.textContent === 'RADAR OFF') {
    l.textContent = 'CONNECTING...'; l.style.color = '#f5c542'; showToast('CONNECTING...');
  } else {
    l.textContent = 'SIGNAL LOST'; l.style.color = 'var(--red)'; showToast('CONNECTION FAILED');
  }
});
