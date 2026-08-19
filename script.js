const quoteEl     = document.getElementById('quote');
const music       = document.getElementById('music');
const coordEl     = document.getElementById('coord');
const clockEl     = document.getElementById('clock');
const radarLabel  = document.getElementById('radarLabel');
const canvas      = document.getElementById('radar');
const toast       = document.getElementById('toast');
const musicStatus = document.getElementById('musicStatus');
const bootScreen  = document.getElementById('bootScreen');
const device      = document.getElementById('device');
const led         = document.getElementById('led');
const ctx         = canvas.getContext('2d');

const quotes = [
  "I wondered if you would notice the quiet.",
  "I stopped reaching out. Not because I stopped caring, but because I was tired of being the only one who did.",
  "You never asked where I went. That told me everything.",
  "I kept showing up. Eventually I had to ask myself why.",
  "It is strange to miss someone who is still here.",
  "I did not leave to make you chase me. I left because standing still was hurting me.",
  "Maybe I was always a background character in a story you never thought to tell.",
  "I got so used to being an option that I forgot I deserved to be a priority.",
  "The silence between us was not peaceful. It was just what was left.",
  "I think what hurt most was how easy it seemed for you.",
  "I kept my distance so you would not see how much yours affected me.",
  "I smiled through most of it. No one noticed that either.",
  "I am not angry. I am just quietly done.",
  "You were comfortable. I confused comfortable for chosen.",
  "There is a version of me that waited too long. I am trying not to be her anymore.",
  "I gave you soft words when I should have given myself an exit.",
  "I think I loved the idea of us more than you ever did.",
  "I disappeared before you could confirm what I already suspected.",
  "Location unknown. Even to myself, most days.",
  "I am somewhere between healing and still checking if you noticed I am gone."
];

let idx        = 0;
let sweep      = 0;
let sweepSpeed = 0.03;
let scanning   = true;
let toastTimer;
let booted     = false;

function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function updateMusicStatus() {
  if (music.paused) {
    musicStatus.textContent = '\u266A OFF';
    musicStatus.style.color = '#3a4050';
  } else {
    musicStatus.textContent = '\u266A ON';
    musicStatus.style.color = 'var(--g)';
  }
}
music.addEventListener('play',  updateMusicStatus);
music.addEventListener('pause', updateMusicStatus);

bootScreen.addEventListener('click', boot);

function boot() {
  if (booted) return;
  booted = true;
  bootScreen.classList.add('hiding');
  setTimeout(() => { bootScreen.style.display = 'none'; }, 620);
  device.classList.add('on');
  led.classList.add('on');
  music.volume = 0.6;
  music.play().then(updateMusicStatus).catch(() => {});
  startRuntime();
}

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

function tick() {
  const d = new Date(), p = v => String(v).padStart(2,'0');
  clockEl.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function updateCoord() {
  if (!scanning) return;
  const lat = (Math.random()*180-90).toFixed(4);
  const lng = (Math.random()*360-180).toFixed(4);
  coordEl.textContent = `LAT ${lat} / LNG ${lng}`;
}

function showQuote(dir) {
  if (dir !== 0) idx = (idx + dir + quotes.length) % quotes.length;
  quoteEl.classList.remove('show');
  setTimeout(() => {
    quoteEl.textContent = '> ' + quotes[idx];
    quoteEl.classList.add('show');
  }, 500);
}

function startRuntime() {
  drawRadar();
  setInterval(tick, 1000); tick();
  setInterval(updateCoord, 2400);
  showQuote(0);
  setInterval(() => showQuote(1), 7000);
}

document.getElementById('dpUp').addEventListener('click',    () => { showQuote(-1); showToast('PREV SIGNAL'); });
document.getElementById('dpDown').addEventListener('click',  () => { showQuote(1);  showToast('NEXT SIGNAL'); });
document.getElementById('dpLeft').addEventListener('click',  () => {
  music.volume = Math.max(0, parseFloat((music.volume-.1).toFixed(1)));
  showToast(`VOL ${Math.round(music.volume*10)}/10`);
});
document.getElementById('dpRight').addEventListener('click', () => {
  music.volume = Math.min(1, parseFloat((music.volume+.1).toFixed(1)));
  showToast(`VOL ${Math.round(music.volume*10)}/10`);
});
document.getElementById('btnA').addEventListener('click', () => { showQuote(1); showToast('NEXT SIGNAL'); });
document.getElementById('btnB').addEventListener('click', () => {
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
