/* ==========================================================================
   FRUTIGER AERO DESKTOP ENGINE & PORTAL KELOMPOK 1 TI25G
   ========================================================================== */

let currentUser = null;
let appData = { members: [], courses: [], tasks: [], trashedTasks: [] };
let socket = null;
let currentRoom = 'grup_kelompok_1';
let cameraStream = null;
let audioCtx = null;
let synthTimer = null;
let isMusicPlaying = false;

const HARI_INDO = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_INDO = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Format Deadline Lengkap: Hari, Tanggal Bulan Tahun • Jam WIB
function formatFullDeadline(isoStr) {
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;

  const hari = HARI_INDO[d.getDay()];
  const tgl = String(d.getDate()).padStart(2, '0');
  const bln = BULAN_INDO[d.getMonth()];
  const thn = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, '0');
  const mnt = String(d.getMinutes()).padStart(2, '0');

  return `${hari}, ${tgl} ${bln} ${thn} • ${jam}:${mnt} WIB`;
}

function getUrgencyLabel(isoStr) {
  const now = new Date();
  const target = new Date(isoStr);
  const diffMs = target - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return { text: 'Terlewat', urgent: true };
  if (diffHours <= 24) return { text: 'Hari Ini / Besok!', urgent: true };
  const diffDays = Math.ceil(diffHours / 24);
  return { text: `${diffDays} hari lagi`, urgent: diffDays <= 2 };
}

function sortTasksByNearest() {
  appData.tasks.sort((a, b) => new Date(a.deadlineISO) - new Date(b.deadlineISO));
}

// ==========================================================================
// 1. REALISTIC 3D IRIDESCENT BUBBLE ENGINE
// ==========================================================================
function initBubbleEngine() {
  let layer = document.getElementById('bubbleLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'bubbleLayer';
    document.body.appendChild(layer);
  }

  const bubbles = [];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'water-bubble';
    const size = 28 + Math.random() * 68;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    layer.appendChild(el);

    const b = {
      el,
      size,
      baseX: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speedY: 0.45 + Math.random() * 0.85,
      swayAmp: 18 + Math.random() * 34,
      swayFreq: 0.0012 + Math.random() * 0.0015,
      wobbleFreq: 0.003 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2
    };

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      popBubble(b, e.clientX, e.clientY);
    });

    bubbles.push(b);
  }

  function popBubble(b, clientX, clientY) {
    playBubblePopSound();
    for (let d = 0; d < 7; d++) {
      const drop = document.createElement('div');
      drop.className = 'bubble-droplet';
      const angle = (Math.PI * 2 * d) / 7;
      const dist = 24 + Math.random() * 26;
      drop.style.left = `${clientX}px`;
      drop.style.top = `${clientY}px`;
      drop.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      drop.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(drop);
      setTimeout(() => drop.remove(), 580);
    }
    b.y = -b.size - 40;
    b.baseX = Math.random() * window.innerWidth;
  }

  function animate(now) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      b.y += b.speedY;
      if (b.y > vh + b.size + 40) {
        b.y = -b.size - 30;
        b.baseX = Math.random() * vw;
      }

      const xOffset = Math.sin(now * b.swayFreq + b.phase) * b.swayAmp;
      const scaleX = 1 + Math.sin(now * b.wobbleFreq + b.phase) * 0.07;
      const scaleY = 1 - Math.sin(now * b.wobbleFreq + b.phase) * 0.07;

      b.el.style.transform = `translate3d(${b.baseX + xOffset}px, ${-b.y}px, 0) scale(${scaleX}, ${scaleY})`;
    }
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function playBubblePopSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(860, audioCtx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
}

function playTrashSwallowSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } catch (e) {}
}

// ==========================================================================
// 2. DESKTOP COLLAGE WIDGETS, RECYCLE BIN & WMP CAPSULE PLAYER
// ==========================================================================
function injectDesktopCollage(isLoggedIn) {
  const scenery = document.createElement('div');
  scenery.className = 'aero-scenery';
  scenery.innerHTML = `
    <div class="aero-sunburst"></div>
    <div class="aero-aurora"></div>
    <svg class="eco-horizon-svg" viewBox="0 0 1440 420" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rainbowArc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff595e" stop-opacity="0.28"/>
          <stop offset="25%" stop-color="#ffca3a" stop-opacity="0.28"/>
          <stop offset="50%" stop-color="#8ac926" stop-opacity="0.28"/>
          <stop offset="75%" stop-color="#1982c4" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#6a4c93" stop-opacity="0.22"/>
        </linearGradient>
        <linearGradient id="glassTower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#0088ff" stop-opacity="0.3"/>
        </linearGradient>
      </defs>
      <path d="M 120 340 Q 720 -80 1320 340" fill="none" stroke="url(#rainbowArc)" stroke-width="34"/>
      <path d="M -80 260 Q 650 30 1520 190" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="3"/>
      <path d="M -60 300 Q 720 90 1500 240" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
      <rect x="240" y="165" width="42" height="170" rx="6" fill="url(#glassTower)" stroke="rgba(255,255,255,0.6)"/>
      <rect x="292" y="130" width="54" height="205" rx="8" fill="url(#glassTower)" stroke="rgba(255,255,255,0.7)"/>
      <rect x="356" y="185" width="38" height="150" rx="5" fill="url(#glassTower)" stroke="rgba(255,255,255,0.5)"/>
      <g stroke="rgba(255,255,255,0.85)" stroke-width="3" fill="rgba(255,255,255,0.7)">
        <line x1="1080" y1="310" x2="1080" y2="180"/>
        <polygon points="1080,180 1075,130 1085,130"/>
        <polygon points="1080,180 1122,205 1117,213"/>
        <polygon points="1080,180 1038,205 1043,213"/>
        <line x1="1175" y1="320" x2="1175" y2="210"/>
        <polygon points="1175,210 1171,170 1179,170"/>
        <polygon points="1175,210 1210,230 1206,236"/>
        <polygon points="1175,210 1140,230 1144,236"/>
      </g>
      <path d="M0,305 Q420,235 920,300 T1440,280 L1440,420 L0,420 Z" fill="rgba(158, 240, 26, 0.36)"/>
      <path d="M0,335 Q560,275 1120,330 T1440,315 L1440,420 L0,420 Z" fill="rgba(82, 208, 23, 0.48)"/>
    </svg>
  `;
  document.body.prepend(scenery);

  const crt = document.createElement('div');
  crt.className = 'crt-overlay';
  document.body.appendChild(crt);

  // Desktop Shortcut Icons (Recycle Bin selalu tampil untuk target lempar tugas!)
  const shortcuts = document.createElement('div');
  shortcuts.className = 'desktop-shortcuts';
  shortcuts.innerHTML = `
    <a href="${isLoggedIn ? '/anggota' : '/'}" class="desktop-icon hide-mobile-shortcut">
      <div class="desktop-icon-orb">💻</div>
      <span>My Computer</span>
    </a>
    <a href="${isLoggedIn ? '/matkul' : '/'}" class="desktop-icon hide-mobile-shortcut">
      <div class="desktop-icon-orb" style="background:linear-gradient(180deg,#fff 0%,#b8ff66 48%,#4fa800 52%,#7ED321 100%);">🌐</div>
      <span>Internet</span>
    </a>
    <a href="${isLoggedIn ? '/obrolan' : '/'}" class="desktop-icon hide-mobile-shortcut">
      <div class="desktop-icon-orb">🦋</div>
      <span>MSN Messenger</span>
    </a>
    <button type="button" id="shortcutMusicBtn" class="desktop-icon hide-mobile-shortcut">
      <div class="desktop-icon-orb" style="background:linear-gradient(180deg,#fff 0%,#ffc266 48%,#d45500 52%,#FF7A00 100%);">🎵</div>
      <span>Music</span>
    </button>
    <button type="button" id="desktopRecycleBin" class="desktop-icon" title="Klik untuk lihat tugas selesai">
      <span id="recycleBinBadge" class="bin-badge">0</span>
      <div class="desktop-icon-orb" id="recycleBinOrb">🗑️</div>
      <span>Recycle Bin</span>
    </button>
  `;
  document.body.appendChild(shortcuts);

  // Modal Recycle Bin (Isi Tugas yang Sudah Dibuang)
  const binModal = document.createElement('div');
  binModal.id = 'recycleBinModal';
  binModal.className = 'aero-modal-backdrop';
  binModal.innerHTML = `
    <div class="aero-window" style="max-width:480px;width:100%;">
      <div class="window-titlebar">
        <div class="titlebar-left">
          <span class="orb-icon">🗑️</span>
          <span>Recycle Bin — Tugas Selesai</span>
        </div>
        <button type="button" id="closeRecycleBinBtn" class="win-btn win-close">✕</button>
      </div>
      <div class="window-body">
        <div id="recycleBinList" style="max-height:280px;overflow-y:auto;"></div>
        <div style="display:flex;justify-content:flex-end;margin-top:12px;">
          <button type="button" id="emptyRecycleBinBtn" class="gel-pill gel-pill-orange" style="padding:6px 14px;font-size:0.82rem;">
            Kosongkan Tong Sampah
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(binModal);

  document.getElementById('desktopRecycleBin').addEventListener('click', () => {
    renderRecycleBinModal();
    binModal.style.display = 'flex';
  });
  document.getElementById('closeRecycleBinBtn').addEventListener('click', () => {
    binModal.style.display = 'none';
  });
  document.getElementById('emptyRecycleBinBtn').addEventListener('click', async () => {
    await fetch('/api/trash', { method: 'DELETE' });
  });

  // Cascading Classic Beveled Windows Trail
  const cascade = document.createElement('div');
  cascade.className = 'retro-cascade-stack';
  cascade.innerHTML = `
    <div class="retro-classic-win" style="top:0;left:0;opacity:0.85;">
      <div class="retro-classic-bar"><span>System Message</span><span>✕</span></div>
      <div class="retro-classic-body">TI25G-OS Kernel Ready.</div>
    </div>
    <div class="retro-classic-win" style="top:18px;left:14px;opacity:0.92;">
      <div class="retro-classic-bar"><span>Notepad - catatan.txt</span><span>✕</span></div>
      <div class="retro-classic-body">Kelompok 1 • Webserver</div>
    </div>
    <div class="retro-classic-win" style="top:36px;left:28px;">
      <div class="retro-classic-bar"><span>Loading...</span><span>✕</span></div>
      <div class="retro-classic-body">
        <div id="retroTrashStatus">Status: Ready | 0 object(s)</div>
        <div class="retro-progress-track"><div class="retro-progress-fill"></div></div>
      </div>
    </div>
  `;
  document.body.appendChild(cascade);

  // Floating Capsule Media Player (WMP Style)
  const wmp = document.createElement('div');
  wmp.className = 'wmp-capsule-player';
  wmp.id = 'wmpCapsulePlayer';
  wmp.innerHTML = `
    <button type="button" id="wmpPlayBtn" class="wmp-play-orb" title="Play/Pause">▶</button>
    <div class="wmp-screen">
      <div style="font-size:0.7rem;font-family:'Courier New',monospace;color:#9ef01a;font-weight:bold;">
        WMP • TI25G_AERO.WMA
      </div>
      <div class="wmp-viz">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="wmp-neon-bar"><div class="wmp-neon-fill"></div></div>
    </div>
  `;
  document.body.appendChild(wmp);

  // Die-Cut 3D Sticker pada Main Window
  const mainWin = document.querySelector('.aero-window');
  if (mainWin) {
    const stickerTop = document.createElement('div');
    stickerTop.className = 'diecut-sticker';
    stickerTop.style.top = '-16px';
    stickerTop.style.right = '95px';
    stickerTop.style.fontSize = '28px';
    stickerTop.textContent = '🐠';
    mainWin.parentElement.style.position = 'relative';
    mainWin.parentElement.appendChild(stickerTop);

    const stickerBottom = document.createElement('div');
    stickerBottom.className = 'diecut-sticker';
    stickerBottom.style.bottom = '-14px';
    stickerBottom.style.left = '24px';
    stickerBottom.style.fontSize = '26px';
    stickerBottom.textContent = '🪼';
    mainWin.parentElement.appendChild(stickerBottom);
  }

  document.getElementById('wmpPlayBtn').addEventListener('click', toggleY2kMusic);
  document.getElementById('shortcutMusicBtn').addEventListener('click', toggleY2kMusic);
}

function updateRecycleBinBadge() {
  const count = (appData.trashedTasks || []).length;
  const badge = document.getElementById('recycleBinBadge');
  const status = document.getElementById('retroTrashStatus');
  if (badge) badge.textContent = count;
  if (status) status.textContent = `Status: Ready | ${count} object(s)`;
}

function renderRecycleBinModal() {
  const list = document.getElementById('recycleBinList');
  if (!list) return;
  const items = appData.trashedTasks || [];

  if (items.length === 0) {
    list.innerHTML = `<p style="text-align:center;color:#0057A8;font-weight:700;padding:18px;">Tong sampah kosong.</p>`;
    return;
  }

  list.innerHTML = items
    .map(
      (t) => `
      <div class="task-row" style="opacity:0.88;">
        <div>
          <div style="font-weight:800;font-size:0.9rem;text-decoration:line-through;">${t.judul}</div>
          <div style="font-size:0.78rem;color:#0057A8;">${t.matkulNama}</div>
        </div>
        <button type="button" onclick="restoreTrashedTask(${t.id})" class="gel-pill gel-pill-lime" style="padding:4px 10px;font-size:0.76rem;">
          ↺ Kembalikan
        </button>
      </div>
    `
    )
    .join('');
}

async function restoreTrashedTask(id) {
  await fetch(`/api/trash/restore/${id}`, { method: 'POST' });
}

function toggleY2kMusic() {
  const player = document.getElementById('wmpCapsulePlayer');
  const btn = document.getElementById('wmpPlayBtn');

  if (isMusicPlaying) {
    isMusicPlaying = false;
    clearInterval(synthTimer);
    player.classList.remove('playing');
    btn.textContent = '▶';
    return;
  }

  isMusicPlaying = true;
  player.classList.add('playing');
  btn.textContent = '❚❚';

  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
  let idx = 0;

  const playChime = () => {
    if (!isMusicPlaying) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(notes[idx % notes.length], audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0008, audioCtx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
    idx++;
  };

  playChime();
  synthTimer = setInterval(playChime, 480);
}

// ==========================================================================
// 3. DRAGGABLE AERO WINDOW
// ==========================================================================
function initDraggableWindow() {
  const win = document.querySelector('.aero-window');
  const bar = document.querySelector('.window-titlebar');
  if (!win || !bar) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-controls')) return;
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    win.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// ==========================================================================
// AVATAR DOSEN SVG
// ==========================================================================
function getDosenAvatarSvg(gender) {
  const hairColor = gender === 'F' ? '#2c1b18' : '#1b263b';
  const shirtColor = gender === 'F' ? '#00C2BB' : '#0057A8';
  const hijabOrHair =
    gender === 'F'
      ? `<path d="M24 44 C24 18, 76 18, 76 44 L80 76 C65 82, 35 82, 20 76 Z" fill="#0088cc" stroke="#fff" stroke-width="2"/>`
      : `<path d="M28 38 C28 20, 72 20, 72 38 C65 28, 35 28, 28 38 Z" fill="${hairColor}"/>`;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="bgOrb" cx="35%" cy="25%" r="75%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="45%" stop-color="#8ce8ff"/>
        <stop offset="100%" stop-color="#0057A8"/>
      </radialGradient>
    </defs>
    <rect width="100" height="100" rx="18" fill="url(#bgOrb)"/>
    <path d="M18 96 C20 72, 80 72, 82 96 Z" fill="${shirtColor}" stroke="#fff" stroke-width="2"/>
    ${hijabOrHair}
    <circle cx="50" cy="46" r="19" fill="#ffe0c2" stroke="#fff" stroke-width="1.5"/>
    <circle cx="43" cy="44" r="2.3" fill="#042544"/>
    <circle cx="57" cy="44" r="2.3" fill="#042544"/>
    <path d="M44 53 Q50 58 56 53" stroke="#b84a39" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="32" cy="18" rx="18" ry="8" fill="#ffffff" opacity="0.55" transform="rotate(-20 32 18)"/>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ==========================================================================
// 4. INISIALISASI HALAMAN
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;

  const saved = sessionStorage.getItem('ti25g_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch (e) {
      sessionStorage.removeItem('ti25g_user');
    }
  }

  injectDesktopCollage(Boolean(currentUser));
  initBubbleEngine();
  initDraggableWindow();

  if (page === 'login') {
    if (currentUser) {
      window.location.href = '/beranda';
      return;
    }
    setupLoginPage();
    return;
  }

  if (!currentUser) {
    window.location.href = '/';
    return;
  }

  await fetchAppData();

  const freshMe = appData.members.find((m) => m.nim === currentUser.nim);
  if (freshMe) {
    currentUser = freshMe;
    sessionStorage.setItem('ti25g_user', JSON.stringify(currentUser));
  }

  setupNavbarAndClock();
  setupGlobalSocket();
  updateRecycleBinBadge();

  if (page === 'beranda') initBerandaPage();
  if (page === 'anggota') initAnggotaPage();
  if (page === 'identitas') initIdentitasPage();
  if (page === 'matkul') initMatkulPage();
  if (page === 'matkul-detail') initMatkulDetailPage();
  if (page === 'obrolan') initObrolanPage();
  if (page === 'profil') initProfilPage();
});

async function fetchAppData() {
  const res = await fetch('/api/data');
  appData = await res.json();
  sortTasksByNearest();
}

// ==========================================================================
// LOGIN PAGE (/)
// ==========================================================================
function setupLoginPage() {
  const form = document.getElementById('loginForm');
  const nimInput = document.getElementById('nimInput');
  const errorBanner = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.style.display = 'none';

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nim: nimInput.value })
    });

    const data = await res.json();
    if (!data.success) {
      errorBanner.textContent = data.message || 'KAMU BUKAN KELOMPOK 1';
      errorBanner.style.display = 'block';
      playRetroErrorSound();
      return;
    }

    sessionStorage.setItem('ti25g_user', JSON.stringify(data.user));
    window.location.href = '/beranda';
  });
}

function playRetroErrorSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(95, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.28);
  } catch (e) {}
}

// ==========================================================================
// NAVBAR & JAM REALTIME
// ==========================================================================
function setupNavbarAndClock() {
  const userChip = document.getElementById('navUserChip');
  if (userChip && currentUser) {
    userChip.innerHTML = `
      <img src="${currentUser.foto}" alt="Avatar" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1.5px solid #fff;">
      <span>${currentUser.username}</span>
    `;
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('ti25g_user');
      window.location.href = '/';
    });
  }

  const clockEl = document.getElementById('liveClockWidget');
  const updateClock = () => {
    const now = new Date();
    const hari = HARI_INDO[now.getDay()];
    const jam = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    if (clockEl) {
      clockEl.textContent = `● READY | ${hari}, ${jam} WIB`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);
}

function setupGlobalSocket() {
  if (typeof io === 'undefined') return;
  socket = io();
  socket.emit('registerOnline', currentUser.nim);

  socket.on('tasksUpdated', (payload) => {
    appData.tasks = payload.tasks || [];
    appData.trashedTasks = payload.trashedTasks || [];
    sortTasksByNearest();
    updateRecycleBinBadge();
    renderRecycleBinModal();

    if (document.body.dataset.page === 'beranda') renderBerandaTasks();
    if (document.body.dataset.page === 'matkul-detail') initMatkulDetailPage();
  });

  socket.on('membersUpdated', (updatedMembers) => {
    appData.members = updatedMembers;
    const me = appData.members.find((m) => m.nim === currentUser.nim);
    if (me) {
      currentUser = me;
      sessionStorage.setItem('ti25g_user', JSON.stringify(me));
      setupNavbarAndClock();
    }
    if (document.body.dataset.page === 'anggota') initAnggotaPage();
    if (document.body.dataset.page === 'identitas') initIdentitasPage();
  });
}

// ==========================================================================
// BERANDA (/beranda) + WIZARD TAMBAH TUGAS 3 LANGKAH + LEMPAR KE TONG SAMPAH
// ==========================================================================
function initBerandaPage() {
  const welcomeTitle = document.getElementById('welcomeHeroText');
  if (welcomeTitle) {
    welcomeTitle.textContent = `Selamat Datang, ${currentUser.username}`;
  }

  renderTodayCourses();
  renderBerandaTasks();
  setupTaskWizard();

  const dayFilter = document.getElementById('dayPreviewSelect');
  if (dayFilter) {
    const todayName = HARI_INDO[new Date().getDay()];
    dayFilter.value = todayName;
    dayFilter.addEventListener('change', () => {
      renderTodayCourses(dayFilter.value);
    });
  }
}

function setupTaskWizard() {
  const modal = document.getElementById('taskWizardModal');
  const openBtn = document.getElementById('openTaskWizardBtn');
  const closeBtn = document.getElementById('closeTaskWizardBtn');
  if (!modal || !openBtn) return;

  const step1 = document.getElementById('wizardStep1');
  const step2 = document.getElementById('wizardStep2');
  const step3 = document.getElementById('wizardStep3');
  const dot1 = document.getElementById('stepDot1');
  const dot2 = document.getElementById('stepDot2');
  const dot3 = document.getElementById('stepDot3');

  const choicesContainer = document.getElementById('wizardMatkulChoices');
  const taskNameInput = document.getElementById('wizardTaskNameInput');
  const dateInput = document.getElementById('wizardDateInput');
  const timeInput = document.getElementById('wizardTimeInput');
  const livePreview = document.getElementById('deadlineLivePreview');

  let chosenCourse = null;

  function showStep(n) {
    step1.style.display = n === 1 ? 'block' : 'none';
    step2.style.display = n === 2 ? 'block' : 'none';
    step3.style.display = n === 3 ? 'block' : 'none';
    dot1.classList.toggle('active', n === 1);
    dot2.classList.toggle('active', n === 2);
    dot3.classList.toggle('active', n === 3);
  }

  function updateDeadlinePreview() {
    if (!dateInput.value) {
      livePreview.textContent = 'Pilih tanggal pada kalender di atas';
      return;
    }
    const iso = `${dateInput.value}T${timeInput.value || '23:59'}`;
    livePreview.textContent = `Deadline: ${formatFullDeadline(iso)}`;
  }

  openBtn.addEventListener('click', () => {
    chosenCourse = null;
    taskNameInput.value = '';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    timeInput.value = '23:59';

    choicesContainer.innerHTML = appData.courses
      .map(
        (c) => `
        <button type="button" class="matkul-choice-btn" data-course-id="${c.id}">
          <span class="badge-orange">${c.hari} • ${c.sks} SKS</span>
          <strong style="color:#003b75;font-size:0.9rem;">${c.nama}</strong>
          <span style="font-size:0.75rem;color:#0057A8;">${c.dosen}</span>
        </button>
      `
      )
      .join('');

    choicesContainer.querySelectorAll('[data-course-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        chosenCourse = appData.courses.find((c) => c.id === btn.dataset.courseId);
        document.getElementById('selectedMatkulBanner').textContent = `📚 Matkul: ${chosenCourse.nama}`;
        showStep(2);
        taskNameInput.focus();
      });
    });

    showStep(1);
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('backToStep1Btn').addEventListener('click', () => showStep(1));
  document.getElementById('backToStep2Btn').addEventListener('click', () => showStep(2));

  document.getElementById('toStep3Btn').addEventListener('click', () => {
    if (!taskNameInput.value.trim()) {
      taskNameInput.focus();
      return;
    }
    document.getElementById('summaryStep3Banner').textContent = `📚 ${chosenCourse.nama} — 📝 ${taskNameInput.value.trim()}`;
    updateDeadlinePreview();
    showStep(3);
  });

  taskNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('toStep3Btn').click();
    }
  });

  dateInput.addEventListener('change', updateDeadlinePreview);
  timeInput.addEventListener('change', updateDeadlinePreview);

  document.getElementById('saveWizardTaskBtn').addEventListener('click', async () => {
    if (!chosenCourse || !taskNameInput.value.trim() || !dateInput.value) return;

    const deadlineISO = `${dateInput.value}T${timeInput.value || '23:59'}`;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matkulId: chosenCourse.id,
        judul: taskNameInput.value.trim(),
        deadlineISO
      })
    });

    modal.style.display = 'none';
  });
}

function renderTodayCourses(overrideDay) {
  const container = document.getElementById('todayMatkulContainer');
  const dayLabel = document.getElementById('todayDayLabel');
  if (!container) return;

  const targetDay = overrideDay || HARI_INDO[new Date().getDay()];
  if (dayLabel) dayLabel.textContent = targetDay;

  const todayList = appData.courses.filter(
    (c) => c.hari.toLowerCase() === targetDay.toLowerCase()
  );

  if (todayList.length === 0) {
    container.innerHTML = `
      <div class="matkul-today-item" style="text-align:center;">
        <p style="font-weight:700;color:#0057A8;">Tidak ada jadwal kuliah hari ${targetDay}.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = todayList
    .map((c) => {
      const modeIcon = c.mode === 'Offline' ? '🏢' : '📹';
      const orbColor = c.mode === 'Offline' ? 'orb-lime' : 'orb-orange';

      return `
        <div class="matkul-today-item clickable" onclick="window.location.href='/matkul/${c.id}'">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <h3 style="color:#004385;font-size:1.05rem;">${c.nama}</h3>
            <span class="badge-orange">${c.sks} SKS</span>
          </div>
          <p style="font-size:0.84rem;color:#1d4e7a;margin-top:3px;">${c.dosen}</p>
          <div class="matkul-meta-row">
            <span class="meta-chip"><span class="orb-icon" style="width:20px;height:20px;font-size:11px;">📘</span> ${c.sesi}</span>
            <span class="meta-chip"><span class="orb-icon orb-orange" style="width:20px;height:20px;font-size:11px;">⏰</span> ${c.jam}</span>
            <span class="meta-chip"><span class="orb-icon ${orbColor}" style="width:20px;height:20px;font-size:11px;">${modeIcon}</span> ${c.lokasi}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderBerandaTasks() {
  const container = document.getElementById('berandaTasksContainer');
  const countBadge = document.getElementById('taskAccumulationBadge');
  if (!container) return;

  sortTasksByNearest();
  if (countBadge) countBadge.textContent = `${appData.tasks.length} Tugas`;

  if (appData.tasks.length === 0) {
    container.innerHTML = `
      <div class="matkul-today-item" style="text-align:center;">
        <p style="font-weight:700;color:#0057A8;">Semua tugas beres! 🎉</p>
      </div>
    `;
    return;
  }

  container.innerHTML = appData.tasks
    .map((t, index) => {
      const urgency = getUrgencyLabel(t.deadlineISO);
      const isTopUrgent = index === 0 || urgency.urgent;
      return `
        <div class="task-row ${isTopUrgent ? 'urgent-task' : ''}" id="task-card-${t.id}">
          <div style="display:flex;align-items:center;gap:11px;min-width:0;">
            <button type="button" onclick="completeAndThrowToTrash(${t.id}, this)" class="task-check-btn" title="Centang selesai & buang ke tong sampah">
              ✓
            </button>
            <div style="min-width:0;">
              <div style="font-weight:800;color:#032b54;font-size:0.93rem;">${t.judul}</div>
              <div style="font-size:0.78rem;color:#0057A8;font-weight:700;">📚 ${t.matkulNama}</div>
              <div style="font-size:0.77rem;color:#b84500;font-weight:800;margin-top:2px;">
                📅 ${formatFullDeadline(t.deadlineISO)}
              </div>
            </div>
          </div>
          <span class="badge-orange">${urgency.text}</span>
        </div>
      `;
    })
    .join('');
}

// ==========================================================================
// ANIMASI CENTANG -> TUGAS MELEMPARKAN DIRI KE TONG SAMPAH
// ==========================================================================
async function completeAndThrowToTrash(taskId, checkBtn) {
  const card = document.getElementById(`task-card-${taskId}`);
  const binEl = document.getElementById('desktopRecycleBin');

  if (!card || !binEl) {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    return;
  }

  // 1. Centang kotak jadi hijau dengan tanda ✓
  checkBtn.classList.add('checked');
  checkBtn.disabled = true;
  card.style.textDecoration = 'line-through';

  // Jeda singkat agar user lihat centangnya dulu, lalu terbang ke tong sampah
  setTimeout(() => {
    const startRect = card.getBoundingClientRect();
    const binRect = binEl.getBoundingClientRect();

    const clone = card.cloneNode(true);
    clone.classList.add('flying-task-clone');
    clone.style.left = `${startRect.left}px`;
    clone.style.top = `${startRect.top}px`;
    clone.style.width = `${startRect.width}px`;
    document.body.appendChild(clone);

    // Sembunyikan kartu asli di list
    card.style.opacity = '0';
    card.style.transform = 'scale(0.85)';

    const targetX = binRect.left + binRect.width / 2 - (startRect.left + startRect.width / 2);
    const targetY = binRect.top + binRect.height / 2 - (startRect.top + startRect.height / 2);

    const anim = clone.animate(
      [
        {
          transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translate(${targetX * 0.45}px, ${Math.min(-75, targetY * 0.35)}px) scale(0.65) rotate(180deg)`,
          opacity: 0.95,
          offset: 0.45
        },
        {
          transform: `translate(${targetX}px, ${targetY}px) scale(0.08) rotate(540deg)`,
          opacity: 0.1
        }
      ],
      {
        duration: 680,
        easing: 'cubic-bezier(0.22, 0.9, 0.32, 1)',
        fill: 'forwards'
      }
    );

    anim.onfinish = async () => {
      clone.remove();
      playTrashSwallowSound();
      binEl.classList.remove('bin-receive-pop');
      void binEl.offsetWidth;
      binEl.classList.add('bin-receive-pop');

      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    };
  }, 220);
}

// ==========================================================================
// ANGGOTA (/anggota)
// ==========================================================================
function initAnggotaPage() {
  const grid = document.getElementById('anggotaGridContainer');
  if (!grid) return;

  grid.innerHTML = appData.members
    .map(
      (m) => `
      <div class="aero-card clickable member-box" onclick="window.location.href='/identitas?nim=${m.nim}'">
        <img src="${m.foto}" alt="${m.nama}" class="glossy-avatar">
        <div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
            <span class="badge-orange">${m.role}</span>
            ${m.devTag ? `<span class="badge-dev">💻 ${m.devTag}</span>` : ''}
          </div>
          <h3 style="color:#003b75;font-size:1.04rem;">${m.nama}</h3>
          <p style="font-size:0.84rem;color:#0057A8;font-weight:700;margin-top:2px;">NIM: ${m.nim}</p>
        </div>
      </div>
    `
    )
    .join('');
}

// ==========================================================================
// IDENTITAS (/identitas)
// ==========================================================================
function initIdentitasPage() {
  const params = new URLSearchParams(window.location.search);
  const targetNim = params.get('nim') || currentUser.nim;
  const member = appData.members.find((m) => m.nim === targetNim) || appData.members[0];

  const switcher = document.getElementById('memberSwitcherBar');
  if (switcher) {
    switcher.innerHTML = appData.members
      .map(
        (m) => `
        <a href="/identitas?nim=${m.nim}" class="gel-pill ${m.nim === member.nim ? 'gel-pill-lime' : ''}" style="padding:6px 14px;font-size:0.82rem;">
          ${m.username}
        </a>
      `
      )
      .join('');
  }

  const cardContainer = document.getElementById('idCardContainer');
  if (!cardContainer) return;

  const waClean = member.wa.replace(/[^0-9]/g, '');

  cardContainer.innerHTML = `
    <div class="id-card-container">
      <div class="id-card-header">
        <div>
          <div style="font-size:0.74rem;letter-spacing:1.4px;opacity:0.9;">ID CARD • KELOMPOK 1</div>
          <div style="font-size:1.12rem;font-weight:900;">KELAS ${member.kelas}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${member.devTag ? `<span class="badge-dev">💻 ${member.devTag}</span>` : ''}
          <span class="orb-icon orb-lime">🪪</span>
        </div>
      </div>
      <div class="id-card-body">
        <div style="text-align:center;">
          <img src="${member.foto}" alt="${member.nama}" class="id-card-photo">
          <div class="retro-bevel-box" style="margin-top:9px;font-weight:bold;">
            ${member.role}${member.devTag ? ` • ${member.devTag}` : ''}
          </div>
        </div>
        <div>
          <table class="id-field-table">
            <tr>
              <td class="id-field-label">Nama</td>
              <td><strong>${member.nama}</strong></td>
            </tr>
            <tr>
              <td class="id-field-label">NIM</td>
              <td><span class="badge-orange">${member.nim}</span></td>
            </tr>
            <tr>
              <td class="id-field-label">Kelas</td>
              <td><strong>${member.kelas}</strong></td>
            </tr>
            <tr>
              <td class="id-field-label">Alamat</td>
              <td>${member.alamat}</td>
            </tr>
            <tr>
              <td class="id-field-label">Instagram</td>
              <td><a href="https://instagram.com/${member.ig.replace('@', '')}" target="_blank" style="color:#0057A8;font-weight:700;">${member.ig}</a></td>
            </tr>
            <tr>
              <td class="id-field-label">WhatsApp</td>
              <td><a href="https://wa.me/${waClean}" target="_blank" style="color:#2b7a00;font-weight:800;">${member.wa}</a></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// MATA KULIAH LIST (/matkul) -> KLIK MASUK KE /matkul/:id
// ==========================================================================
function initMatkulPage() {
  const grid = document.getElementById('matkulGridContainer');
  if (!grid) return;

  grid.innerHTML = appData.courses
    .map(
      (c) => `
      <div class="aero-card clickable" onclick="window.location.href='/matkul/${c.id}'">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${getDosenAvatarSvg(c.genderDosen)}" alt="${c.dosen}" style="width:58px;height:58px;border-radius:14px;border:2px solid #fff;">
          <div>
            <span class="badge-orange">${c.hari} • ${c.sks} SKS</span>
            <h4 style="color:#003b75;margin-top:4px;font-size:1rem;">${c.nama}</h4>
            <p style="font-size:0.81rem;color:#0057A8;margin-top:2px;">${c.dosen}</p>
          </div>
        </div>
      </div>
    `
    )
    .join('');
}

// ==========================================================================
// DETAIL MATA KULIAH (/matkul/:id)
// ==========================================================================
function initMatkulDetailPage() {
  const container = document.getElementById('matkulDetailPageContainer');
  if (!container) return;

  sortTasksByNearest();
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const matkulId = pathParts[pathParts.length - 1];
  const c = appData.courses.find((item) => item.id === matkulId) || appData.courses[0];
  const matkulTasks = appData.tasks.filter((t) => t.matkulId === c.id);
  const modeIcon = c.mode === 'Offline' ? '🏢' : '📹';

  container.innerHTML = `
    <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <a href="/matkul" class="gel-pill">← Daftar Mata Kuliah</a>
      <span class="retro-bevel-box">KODE: ${c.kode} • ${c.sks} SKS</span>
    </div>

    <div class="aero-card" style="background:linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(195,240,255,0.75) 100%);">
      <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;">
        <img src="${getDosenAvatarSvg(c.genderDosen)}" alt="${c.dosen}" style="width:115px;height:115px;border-radius:18px;border:3px solid #ffffff;box-shadow:0 6px 16px rgba(0,65,130,0.3);">
        <div style="flex:1;min-width:240px;">
          <h1 class="hero-chrome-title" style="font-size:1.75rem;">${c.nama}</h1>
          <p style="font-size:1rem;color:#004385;margin-top:4px;">Dosen: <strong>${c.dosen}</strong></p>
          <p style="font-size:0.9rem;color:#1d4e7a;margin-top:8px;">${c.deskripsi}</p>
        </div>
      </div>

      <div class="matkul-meta-row" style="margin-top:16px;padding-top:14px;border-top:1.5px dashed rgba(0,87,168,0.28);">
        <span class="meta-chip">📅 Hari: ${c.hari}</span>
        <span class="meta-chip">📘 ${c.sesi}</span>
        <span class="meta-chip">⏰ ${c.jam}</span>
        <span class="meta-chip">🎓 ${c.sks} SKS</span>
        <span class="meta-chip">${modeIcon} ${c.lokasi}</span>
      </div>

      <div style="margin-top:18px;padding-top:14px;border-top:1.5px dashed rgba(0,87,168,0.28);">
        <div class="section-bar">
          <span>📋 Tugas Mata Kuliah Ini</span>
          <span>${matkulTasks.length} Tugas</span>
        </div>
        ${
          matkulTasks.length === 0
            ? `<p style="font-size:0.9rem;color:#2b5d8a;">Tidak ada tugas aktif.</p>`
            : matkulTasks
                .map(
                  (t) => `
                <div class="task-row" id="task-card-${t.id}">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <button type="button" onclick="completeAndThrowToTrash(${t.id}, this)" class="task-check-btn" title="Selesai">
                      ✓
                    </button>
                    <div>
                      <strong>${t.judul}</strong>
                      <div style="font-size:0.78rem;color:#b84500;font-weight:700;">📅 ${formatFullDeadline(t.deadlineISO)}</div>
                    </div>
                  </div>
                  <span class="badge-orange">${getUrgencyLabel(t.deadlineISO).text}</span>
                </div>
              `
                )
                .join('')
        }
      </div>
    </div>
  `;
}

// ==========================================================================
// OBROLAN REALTIME (/obrolan)
// ==========================================================================
function initObrolanPage() {
  renderChatSidebar([]);
  joinChatRoom('grup_kelompok_1', 'Grup Kelompok 1 (TI25G)');

  if (socket) {
    socket.on('onlineList', (onlineNims) => {
      renderChatSidebar(onlineNims);
    });

    socket.on('roomHistory', ({ room, messages }) => {
      if (room !== currentRoom) return;
      const box = document.getElementById('chatMessagesBox');
      box.innerHTML = '';
      messages.forEach((m) => appendChatMessage(m));
    });

    socket.on('newMessage', (msg) => {
      if (msg.room !== currentRoom) return;
      appendChatMessage(msg);
    });
  }

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    socket.emit('sendMessage', {
      room: currentRoom,
      senderNim: currentUser.nim,
      text,
      image: null
    });
    chatInput.value = '';
  });

  const emojis = ['😀', '😂', '🥰', '😎', '🔥', '✨', '👍', '🙌', '💻', '📚', '🎉', '💧', '🌐', '🐠', '🍀', '🚀'];
  const emojiPanel = document.getElementById('emojiPickerPanel');
  emojiPanel.innerHTML = emojis
    .map((em) => `<button type="button" class="emoji-btn" onclick="insertEmoji('${em}')">${em}</button>`)
    .join('');

  document.getElementById('toggleEmojiBtn').addEventListener('click', () => {
    emojiPanel.style.display = emojiPanel.style.display === 'flex' ? 'none' : 'flex';
  });

  const fileInput = document.getElementById('chatImageFile');
  document.getElementById('uploadPhotoBtn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('sendMessage', {
        room: currentRoom,
        senderNim: currentUser.nim,
        text: '📷 Foto',
        image: reader.result
      });
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  });

  const camModal = document.getElementById('cameraModal');
  const videoEl = document.getElementById('webcamVideo');
  const canvasEl = document.getElementById('webcamCanvas');

  document.getElementById('openCameraBtn').addEventListener('click', async () => {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = cameraStream;
      camModal.style.display = 'flex';
    } catch (err) {
      alert('Kamera tidak tersedia.');
    }
  });

  document.getElementById('closeCameraBtn').addEventListener('click', stopWebcam);

  document.getElementById('capturePhotoBtn').addEventListener('click', () => {
    canvasEl.width = videoEl.videoWidth || 480;
    canvasEl.height = videoEl.videoHeight || 360;
    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.8);

    socket.emit('sendMessage', {
      room: currentRoom,
      senderNim: currentUser.nim,
      text: '📸 Kamera',
      image: dataUrl
    });

    stopWebcam();
  });

  function stopWebcam() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
    camModal.style.display = 'none';
  }
}

function insertEmoji(em) {
  const input = document.getElementById('chatInput');
  input.value += em;
  input.focus();
}

function renderChatSidebar(onlineNims) {
  const listEl = document.getElementById('chatRoomsList');
  if (!listEl) return;

  const others = appData.members.filter((m) => m.nim !== currentUser.nim);

  let html = `
    <button type="button" class="chat-room-btn ${currentRoom === 'grup_kelompok_1' ? 'active-room' : ''}"
      onclick="joinChatRoom('grup_kelompok_1', 'Grup Kelompok 1 (TI25G)')">
      <span class="orb-icon orb-lime">🌐</span>
      <div>
        <div>Grup Kelompok 1</div>
        <div style="font-size:0.74rem;opacity:0.85;">Semua Anggota</div>
      </div>
    </button>
    <div style="font-size:0.76rem;font-weight:800;color:#004385;margin:10px 0 6px;">CHAT 1:1</div>
  `;

  html += others
    .map((m) => {
      const dmRoom = ['dm', ...[currentUser.nim, m.nim].sort()].join('_');
      const isOnline = onlineNims.includes(m.nim);
      return `
        <button type="button" class="chat-room-btn ${currentRoom === dmRoom ? 'active-room' : ''}"
          onclick="joinChatRoom('${dmRoom}', 'Chat: ${m.username}')">
          <img src="${m.foto}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid #fff;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span>${m.username}</span>
              <span class="status-dot ${isOnline ? 'online' : ''}"></span>
            </div>
            <div style="font-size:0.72rem;opacity:0.8;">${isOnline ? 'Online' : 'Offline'}</div>
          </div>
        </button>
      `;
    })
    .join('');

  listEl.innerHTML = html;
}

function joinChatRoom(room, title) {
  currentRoom = room;
  const header = document.getElementById('activeRoomTitle');
  if (header) header.textContent = title;
  if (socket) socket.emit('joinRoom', room);
  renderChatSidebar([]);
}

function appendChatMessage(msg) {
  const box = document.getElementById('chatMessagesBox');
  if (!box) return;

  const isMine = msg.senderNim === currentUser.nim;
  const div = document.createElement('div');
  div.className = `msg-bubble ${isMine ? 'mine' : ''}`;
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
      <img src="${msg.senderFoto}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid #fff;">
      <strong style="font-size:0.8rem;color:#004385;">${isMine ? 'Kamu' : msg.senderName}</strong>
      <span style="font-size:0.72rem;color:#4a6b8c;margin-left:auto;">${msg.time}</span>
    </div>
    ${msg.text ? `<div style="font-size:0.91rem;word-break:break-word;">${escapeHtml(msg.text)}</div>` : ''}
    ${msg.image ? `<img src="${msg.image}" class="msg-img" alt="Foto">` : ''}
  `;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
}

// ==========================================================================
// EDIT PROFIL (/profil)
// ==========================================================================
function initProfilPage() {
  const previewImg = document.getElementById('profilPreviewImg');
  const usernameInput = document.getElementById('profilUsernameInput');
  const fullNameEl = document.getElementById('profilFullName');
  const nimEl = document.getElementById('profilNim');
  const photoInput = document.getElementById('profilPhotoInput');
  const statusMsg = document.getElementById('profilSaveStatus');

  let pendingPhotoBase64 = null;

  previewImg.src = currentUser.foto;
  usernameInput.value = currentUser.username;
  fullNameEl.textContent = currentUser.nama;
  nimEl.textContent = `NIM: ${currentUser.nim} • ${currentUser.kelas}`;

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingPhotoBase64 = reader.result;
      previewImg.src = pendingPhotoBase64;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('profilForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nim: currentUser.nim,
        username: usernameInput.value,
        foto: pendingPhotoBase64
      })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      sessionStorage.setItem('ti25g_user', JSON.stringify(currentUser));
      setupNavbarAndClock();
      statusMsg.style.display = 'block';
      setTimeout(() => (statusMsg.style.display = 'none'), 2500);
    }
  });
}