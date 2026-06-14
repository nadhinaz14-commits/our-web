/* ============================================================
   script.js — Bee & Bee 🐝💕
   ============================================================ */

/* ════════════════════════════════════════════════════════════
   🎵 KONFIGURASI MUSIK
   ════════════════════════════════════════════════════════════

   Cara menambahkan musik:
   1. Letakkan file musik (.mp3 / .ogg / .wav) di folder yang
      sama dengan index.html, atau di subfolder misal: music/

   2. Tambahkan objek ke dalam array TRACKS di bawah ini.
      Setiap objek punya 3 properti:
        - title  : judul lagu yang ditampilkan di player
        - artist : nama artis / keterangan singkat
        - src    : path ke file musiknya

   CONTOH:
   ─────────────────────────────────────────────────────────
   {
     title:  "Perfect",
     artist: "Ed Sheeran",
     src:    "music/perfect.mp3"    ← file ada di folder music/
   },
   {
     title:  "Lagu Kita",
     artist: "Fourtwnty",
     src:    "lagu-kita.mp3"        ← file di folder yang sama
   }
   ─────────────────────────────────────────────────────────

   ⚠️  Pastikan nama file tidak ada spasi, gunakan tanda hubung
       atau underscore. Contoh: "our-song.mp3", "lagu_kita.mp3"

   ════════════════════════════════════════════════════════════ */
const TRACKS = [

  /* ── TRACK 1 — ganti dengan lagu pertama kamu ── */
  {
    title:  "one less lonely girl",          /* ← ganti judul lagu */
    artist: "justine beriber",           /* ← ganti nama artis */
    src:    "one_less.mp3"       /* ← ganti path file  */
  },

  /* ── TRACK 2 — tambah / hapus sesuai kebutuhan ── */
  {
    title:  "Nama Lagu 2",
    artist: "Nama Artis",
    src:    "music/lagu2.mp3"
  },

  /* ── TRACK 3 ── */
  {
    title:  "Nama Lagu 3",
    artist: "Nama Artis",
    src:    "music/lagu3.mp3"
  },

  /*
    Untuk menambah lagu baru, copy blok di bawah ini
    dan isi datanya:

    {
      title:  "...",
      artist: "...",
      src:    "music/....mp3"
    },
  */

];
/* ════════════════════════════════════════════════════════════
   akhir konfigurasi musik — tidak perlu ubah kode di bawah
   ════════════════════════════════════════════════════════════ */



/* ════════════════════════════════════════════════════════════
   PARTICLES
   ════════════════════════════════════════════════════════════ */
(function spawnParticles() {
  const emojis = ['🌸','💕','🌹','✨','💖','🐝','🌺','💗','⭐','🌼','💘','🌷'];
  const container = document.getElementById('particles');
  for (let i = 0; i < 38; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left              = Math.random() * 100 + 'vw';
    p.style.animationDuration = (8 + Math.random() * 14) + 's';
    p.style.animationDelay    = (Math.random() * 12) + 's';
    container.appendChild(p);
  }
})();

/* ════════════════════════════════════════════════════════════
   SCROLL FADE-IN
   ════════════════════════════════════════════════════════════ */
const io = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));



/* ════════════════════════════════════════════════════════════
   MUSIC PLAYER
   ════════════════════════════════════════════════════════════ */
let currentTrack = 0;
let isPlaying    = false;
const audio      = new Audio();

/** Muat satu track ke player */
function loadTrack(idx) {
  currentTrack = idx;
  const t = TRACKS[idx];

  audio.src = t.src;
  document.getElementById('music-title').textContent  = t.title;
  document.getElementById('music-artist').textContent = '🎵 ' + t.artist + ' · ' + (idx + 1) + '/' + TRACKS.length;
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('time-current').textContent = '0:00';
  document.getElementById('time-total').textContent   = '0:00';

  highlightPlaylist(idx);
  if (isPlaying) audio.play();
}

/** Render daftar playlist */
function renderPlaylist() {
  const pl = document.getElementById('playlist');
  pl.innerHTML = '';

  if (TRACKS.length === 0) {
    pl.innerHTML = '<p style="font-size:.8rem;color:var(--muted);padding:12px 0;">Belum ada lagu — tambahkan di script.js</p>';
    return;
  }

  TRACKS.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (i === currentTrack ? ' active' : '');
    item.innerHTML = `<span class="playlist-num">${i + 1}</span>${t.title}`;
    item.onclick = () => {
      loadTrack(i);
      audio.play();
      isPlaying = true;
      spinCover(true);
      updatePlayBtn();
    };
    pl.appendChild(item);
  });
}

function highlightPlaylist(idx) {
  document.querySelectorAll('.playlist-item')
    .forEach((el, i) => el.classList.toggle('active', i === idx));
}

/** Toggle play / pause */
function togglePlay() {
  if (TRACKS.length === 0) return;
  if (isPlaying) { audio.pause(); spinCover(false); }
  else           { audio.play();  spinCover(true);  }
  isPlaying = !isPlaying;
  updatePlayBtn();
}

function updatePlayBtn() {
  document.getElementById('play-btn').textContent = isPlaying ? '⏸' : '▶';
}

function prevTrack() {
  if (TRACKS.length === 0) return;
  loadTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length);
  if (isPlaying) { audio.play(); spinCover(true); }
}

function nextTrack() {
  if (TRACKS.length === 0) return;
  loadTrack((currentTrack + 1) % TRACKS.length);
  if (isPlaying) { audio.play(); spinCover(true); }
}

function spinCover(on) {
  document.getElementById('music-cover').classList.toggle('spinning', on);
}

function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

/** Klik progress bar untuk seek */
function seekMusic(e) {
  if (!audio.duration) return;
  const rect  = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  audio.currentTime = ratio * audio.duration;
}

/* Event audio */
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('time-current').textContent = formatTime(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
  document.getElementById('time-total').textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => {
  nextTrack();
  audio.play();
  isPlaying = true;
  spinCover(true);
  updatePlayBtn();
});

/* Init player saat halaman dimuat */
if (TRACKS.length > 0) loadTrack(0);
renderPlaylist();



/* ════════════════════════════════════════════════════════════
   GALERI FOTO + CROP
   ════════════════════════════════════════════════════════════ */
let photos = [];           /* array { url: string }  */
const PHOTO_SLOTS = 12;    /* jumlah slot placeholder */

/* ── State crop ── */
let cropImgEl    = null;
let cropScale    = 1;
let cropOffsetX  = 0;
let cropOffsetY  = 0;
let cropDragStart = null;
let rawImageURL  = null;

/** Render ulang seluruh grid galeri */
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  /* Card foto yang sudah diupload */
  photos.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${p.url}" alt="Memory ${i + 1}" loading="lazy" />
      <div class="photo-caption-overlay">Memory #${i + 1} 💕</div>
      <button
        class="delete-btn"
        title="Hapus foto ini"
        onclick="deletePhoto(event, ${i})"
      >✕</button>
    `;
    card.querySelector('img').addEventListener('click', () => openLightbox(p.url));
    grid.appendChild(card);
  });

  /* Slot placeholder kosong */
  const remaining = PHOTO_SLOTS - photos.length;
  for (let i = 0; i < remaining; i++) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-card';
    placeholder.innerHTML = `
      <div class="placeholder-icon">
        📷<span>Foto ${photos.length + i + 1}</span>
      </div>
    `;
    grid.appendChild(placeholder);
  }
}

/** Hapus foto dari galeri */
function deletePhoto(e, idx) {
  e.stopPropagation();              /* jangan buka lightbox */
  photos.splice(idx, 1);
  renderGallery();
}

/* ── Upload & buka modal crop ── */
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (photos.length >= 20) { alert('Maksimal 20 foto!'); return; }

  rawImageURL = URL.createObjectURL(file);
  openCropModal(rawImageURL);
  e.target.value = '';              /* reset input agar bisa pilih file sama lagi */
}

/* ── Modal Crop ── */
function openCropModal(src) {
  const modal = document.getElementById('crop-modal');
  cropImgEl   = document.getElementById('crop-img');

  cropScale   = 1;
  cropOffsetX = 0;
  cropOffsetY = 0;
  document.getElementById('crop-zoom').value = 1;

  cropImgEl.src = src;
  cropImgEl.onload = () => {
    applyCropZoom();
    centerCropImage();
  };

  modal.classList.add('open');
  bindCropDrag();
}

function cancelCrop() {
  document.getElementById('crop-modal').classList.remove('open');
  rawImageURL = null;
  unbindCropDrag();
}

function applyCropZoom() {
  cropScale = parseFloat(document.getElementById('crop-zoom').value);
  applyCropTransform();
}

function centerCropImage() {
  const vp   = document.getElementById('crop-viewport');
  const img  = cropImgEl;
  const vpW  = vp.offsetWidth;
  const vpH  = vp.offsetHeight;
  const imgW = img.naturalWidth  * cropScale;
  const imgH = img.naturalHeight * cropScale;
  cropOffsetX = (vpW - imgW) / 2;
  cropOffsetY = (vpH - imgH) / 2;
  applyCropTransform();
}

function applyCropTransform() {
  if (!cropImgEl) return;
  const vp   = document.getElementById('crop-viewport');
  const vpW  = vp.offsetWidth;
  const vpH  = vp.offsetHeight;
  const imgW = cropImgEl.naturalWidth  * cropScale;
  const imgH = cropImgEl.naturalHeight * cropScale;

  /* Batas geser agar gambar tidak keluar viewport */
  const minX = vpW - imgW;
  const minY = vpH - imgH;
  cropOffsetX = Math.min(0, Math.max(minX, cropOffsetX));
  cropOffsetY = Math.min(0, Math.max(minY, cropOffsetY));

  cropImgEl.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropScale})`;
  cropImgEl.style.transformOrigin = '0 0';
  cropImgEl.style.width  = cropImgEl.naturalWidth  + 'px';
  cropImgEl.style.height = cropImgEl.naturalHeight + 'px';
}

/* Drag gambar di dalam viewport */
function bindCropDrag() {
  const vp = document.getElementById('crop-viewport');
  vp.addEventListener('mousedown',  onCropDragStart);
  vp.addEventListener('touchstart', onCropDragStart, { passive: true });
  window.addEventListener('mousemove',  onCropDragMove);
  window.addEventListener('touchmove',  onCropDragMove, { passive: false });
  window.addEventListener('mouseup',   onCropDragEnd);
  window.addEventListener('touchend',  onCropDragEnd);
}

function unbindCropDrag() {
  const vp = document.getElementById('crop-viewport');
  vp.removeEventListener('mousedown',  onCropDragStart);
  vp.removeEventListener('touchstart', onCropDragStart);
  window.removeEventListener('mousemove',  onCropDragMove);
  window.removeEventListener('touchmove',  onCropDragMove);
  window.removeEventListener('mouseup',   onCropDragEnd);
  window.removeEventListener('touchend',  onCropDragEnd);
}

function getEventXY(e) {
  return e.touches
    ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
    : { x: e.clientX,            y: e.clientY };
}

function onCropDragStart(e) {
  const { x, y } = getEventXY(e);
  cropDragStart = { x, y, ox: cropOffsetX, oy: cropOffsetY };
}

function onCropDragMove(e) {
  if (!cropDragStart) return;
  if (e.cancelable) e.preventDefault();
  const { x, y } = getEventXY(e);
  cropOffsetX = cropDragStart.ox + (x - cropDragStart.x);
  cropOffsetY = cropDragStart.oy + (y - cropDragStart.y);
  applyCropTransform();
}

function onCropDragEnd() { cropDragStart = null; }

/** Konfirmasi crop — ambil gambar dari canvas dan simpan */
function confirmCrop() {
  const vp   = document.getElementById('crop-viewport');
  const vpW  = vp.offsetWidth;
  const vpH  = vp.offsetHeight;

  const canvas = document.createElement('canvas');
  canvas.width  = vpW;
  canvas.height = vpH;
  const ctx = canvas.getContext('2d');

  const img    = cropImgEl;
  const drawX  = cropOffsetX;
  const drawY  = cropOffsetY;
  const drawW  = img.naturalWidth  * cropScale;
  const drawH  = img.naturalHeight * cropScale;

  ctx.drawImage(img, drawX, drawY, drawW, drawH);

  const croppedURL = canvas.toDataURL('image/jpeg', 0.92);
  photos.push({ url: croppedURL });
  renderGallery();
  document.getElementById('crop-modal').classList.remove('open');
  unbindCropDrag();
  rawImageURL = null;
}

/* ── Lightbox ── */
function openLightbox(url) {
  document.getElementById('lightbox-img').src = url;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

/* Init galeri saat halaman dimuat */
renderGallery();



/* ════════════════════════════════════════════════════════════
   LOVE NOTES (kata-kata cinta)
   ════════════════════════════════════════════════════════════ */
let notes = [
  {
    text: 'Kamu adalah alasan aku tersenyum di setiap pagi. Setiap hari bersamamu terasa seperti hadiah.',
    tag:  ''
  },
  {
    text: "With you, every moment becomes a memory I never want to forget. You're my favorite person.",
    tag:  ''
  },
  {
    text: 'Kalau aku bisa memilih lagi, aku akan selalu memilih kamu. Berulang kali, selamanya.',
    tag:  ''
  },
  {
    text: "You make ordinary days feel extraordinary, Bee. I love you more than words can say.",
    tag:  ' '
  },
];

function renderNotes() {
  const grid = document.getElementById('notes-grid');
  grid.innerHTML = '';
  notes.forEach(n => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `<p class="note-text">${n.text}</p><span class="note-tag">${n.tag}</span>`;
    grid.appendChild(card);
  });
}

function toggleNoteEditor() {
  const ed     = document.getElementById('notes-editor');
  const isOpen = ed.classList.toggle('open');
  document.getElementById('note-toggle-btn').textContent =
    isOpen ? 'Tutup ✕' : '+ Tambah Pesan Baru';
}

function cancelNote() {
  document.getElementById('note-text-input').value = '';
  document.getElementById('note-tag-input').value  = '';
  document.getElementById('notes-editor').classList.remove('open');
  document.getElementById('note-toggle-btn').textContent = '+ Tambah Pesan Baru';
}

function saveNote() {
  const text = document.getElementById('note-text-input').value.trim();
  const tag  = document.getElementById('note-tag-input').value.trim() || 'Love';
  if (!text) return;
  notes.push({ text, tag });
  renderNotes();
  cancelNote();
}

renderNotes();



/* ════════════════════════════════════════════════════════════
   REASONS (alasan kenapa kamu)
   ════════════════════════════════════════════════════════════ */
let reasons = [
  'Senyummu bisa bikin hari yang paling buruk sekalipun jadi indah.',
  'Kamu selalu ada, bahkan saat aku nggak minta.',
  'Your laugh is my favorite sound in the whole world.',
  'Cara kamu peduli sama orang-orang di sekitarmu bikin aku makin sayang.',
  'You make me want to be a better person every single day.',
  'Matamu menyimpan dunia yang selalu ingin aku jelajahi.',
];

function renderReasons() {
  const list = document.getElementById('reasons-list');
  list.innerHTML = '';
  reasons.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'reason-item';
    item.innerHTML = `
      <div class="reason-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="reason-text">${r}</div>
    `;
    list.appendChild(item);
  });
}

function toggleReasonInput() {
  const inp    = document.getElementById('reason-input');
  const btns   = document.getElementById('reason-input-btns');
  const isOpen = inp.classList.toggle('open');
  btns.style.display = isOpen ? 'block' : 'none';
  document.getElementById('reason-toggle-btn').textContent =
    isOpen ? 'Tutup ✕' : '+ Tambah Alasan Baru';
  if (isOpen) inp.focus();
}

function cancelReason() {
  document.getElementById('reason-input').value = '';
  document.getElementById('reason-input').classList.remove('open');
  document.getElementById('reason-input-btns').style.display = 'none';
  document.getElementById('reason-toggle-btn').textContent = '+ Tambah Alasan Baru';
}

function saveReason() {
  const val = document.getElementById('reason-input').value.trim();
  if (!val) return;
  reasons.push(val);
  renderReasons();
  cancelReason();
}

renderReasons();
