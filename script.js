const quotes = [
  "I wondered if you would notice the quiet.",
  "I disappeared before I could say I was disappointed.",
  "Maybe this is what distance feels like when only one person is trying.",
  "I am not asking you to chase me. I just wanted to know if you would look.",
  "Somewhere between missing you and missing who we were, I lost my way.",
  "If you ever wondered where I went — I was waiting to feel wanted without having to ask.",
  "I left the room quietly. I was tired of feeling alone in it with you."
];

const quote = document.getElementById('quote');
const music  = document.getElementById('music');
let idx = 0;

function showQuote() {
  quote.classList.remove('show');
  setTimeout(() => {
    quote.textContent = '\u201c' + quotes[idx] + '\u201d';
    quote.classList.add('show');
    idx = (idx + 1) % quotes.length;
  }, 600);
}

showQuote();
setInterval(showQuote, 6800);

function tryPlay() {
  music.volume = 0.65;
  music.play().catch(() => {});
}

tryPlay();
document.addEventListener('click',     tryPlay, { once: true });
document.addEventListener('touchstart', tryPlay, { once: true });
document.addEventListener('keydown',    tryPlay, { once: true });
