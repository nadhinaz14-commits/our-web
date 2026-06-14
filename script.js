/* ============================================================
   script.js — Bee & Bee 🐝💕
   Foto      → Cloudinary (upload & hosting gambar)
   Data      → Firebase Firestore (notes, reasons, foto URLs)
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
    title:  "Nama Lagu 1",          /* ← ganti judul lagu */
    artist: "Nama Artis",           /* ← ganti nama artis */
    src:    "music/lagu1.mp3"       /* ← ganti path file  */
  },

  /* ── TRACK 2 — tambah / hapus sesuai kebutuhan ── */
  {
    title:  "Nama Lagu 2",
    artist: "Nama Artis",
    src:    "music/lagu2.mp3"
  },

  /*
    Untuk menambah lagu baru, copy blok ini dan isi datanya:

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
   🔥 FIREBASE CONFIG
   ════════════════════════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, orderBy, query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyA2rgoUpmkmSXldk5Mjh5X_pclwqy2emzc",
  authDomain:        "our-web-153a2.firebaseapp.com",
  projectId:         "our-web-153a2",
  storageBucket:     "our-web-153a2.firebasestorage.app",
  messagingSenderId: "982399570088",
  appId:             "1:982399570088:web:c7bbb6528878c78837f29d"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ════════════════════════════════════════════════════════════
   ☁️  CLOUDINARY CONFIG
   ════════════════════════════════════════════════════════════ */
const CLOUDINARY_CLOUD  = "db1gy2cxm";
const CLOUDINARY_PRESET = "our_web";
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;


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
    item.onclick = () => { loadTrack(i); audio.play(); isPlaying = true; spinCover(true); updatePlayBtn(); };
    pl.appendChild(item);
  });
}

function highlightPlaylist(idx) {
  document.querySelectorAll('.playlist-item').forEach((el, i) => el.classList.toggle('active', i === idx));
}

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
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function seekMusic(e) {
  if (!audio.duration) return;
  const rect  = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  document.getElementById('progress-bar').style.width = (audio.currentTime / audio.duration * 100) + '%';
  document.getElementById('time-current').textContent = formatTime(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
  document.getElementById('time-total').textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => { nextTrack(); audio.play(); isPlaying = true; spinCover(true); updatePlayBtn(); });

if (TRACKS.length > 0) loadTrack(0);
renderPlaylist();


/* ════════════════════════════════════════════════════════════
   GALERI FOTO — Cloudinary upload + Firestore simpan URL
   ════════════════════════════════════════════════════════════ */
let photos       = [];   /* [{ id: firestoreDocId, url: string }] */
const PHOTO_SLOTS = 12;

/* ── State crop ── */
let cropImgEl = null, cropScale = 1, cropOffsetX = 0, cropOffsetY = 0;
let cropDragStart = null, pendingBlob = null;

/* Muat foto dari Firestore saat halaman dibuka */
async function loadPhotosFromDB() {
  showGalleryLoading(true);
  try {
    const q   = query(collection(db, "photos"), orderBy("createdAt"));
    const snap = await getDocs(q);
    photos = snap.docs.map(d => ({ id: d.id, url: d.data().url }));
  } catch (e) {
    console.error("Gagal load foto:", e);
  }
  showGalleryLoading(false);
  renderGallery();
}

function showGalleryLoading(on) {
  let el = document.getElementById('gallery-loading');
  if (on) {
    if (!el) {
      el = document.createElement('p');
      el.id = 'gallery-loading';
      el.style.cssText = 'text-align:center;color:var(--muted);font-size:.9rem;padding:20px 0;';
      el.textContent = '⏳ Memuat foto...';
      document.getElementById('gallery-grid').before(el);
    }
  } else {
    if (el) el.remove();
  }
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  photos.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${p.url}" alt="Memory ${i + 1}" loading="lazy" />
      <div class="photo-caption-overlay">Memory #${i + 1} 💕</div>
      <button class="delete-btn" title="Hapus foto ini" onclick="deletePhoto(event, '${p.id}', ${i})">✕</button>
    `;
    card.querySelector('img').addEventListener('click', () => openLightbox(p.url));
    grid.appendChild(card);
  });

  /* Slot placeholder kosong */
  const remaining = Math.max(0, PHOTO_SLOTS - photos.length);
  for (let i = 0; i < remaining; i++) {
    const ph = document.createElement('div');
    ph.className = 'gallery-card';
    ph.innerHTML = `<div class="placeholder-icon">📷<span>Foto ${photos.length + i + 1}</span></div>`;
    grid.appendChild(ph);
  }
}

/* Hapus foto — dari Firestore & array lokal */
async function deletePhoto(e, docId, idx) {
  e.stopPropagation();
  if (!confirm('Hapus foto ini?')) return;
  try {
    await deleteDoc(doc(db, "photos", docId));
    photos.splice(idx, 1);
    renderGallery();
  } catch (err) {
    console.error("Gagal hapus foto:", err);
    alert("Gagal menghapus foto. Coba lagi.");
  }
}

/* ── Upload flow: pilih file → crop → upload ke Cloudinary → simpan URL di Firestore ── */
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (photos.length >= 20) { alert('Maksimal 20 foto!'); return; }
  const url = URL.createObjectURL(file);
  openCropModal(url);
  e.target.value = '';
}

function openCropModal(src) {
  cropImgEl = document.getElementById('crop-img');
  cropScale = 1; cropOffsetX = 0; cropOffsetY = 0;
  document.getElementById('crop-zoom').value = 1;
  cropImgEl.src = src;
  cropImgEl.onload = () => { applyCropZoom(); centerCropImage(); };
  document.getElementById('crop-modal').classList.add('open');
  bindCropDrag();
}

function cancelCrop() {
  document.getElementById('crop-modal').classList.remove('open');
  pendingBlob = null;
  unbindCropDrag();
}

function applyCropZoom() {
  cropScale = parseFloat(document.getElementById('crop-zoom').value);
  applyCropTransform();
}

function centerCropImage() {
  const vp = document.getElementById('crop-viewport');
  cropOffsetX = (vp.offsetWidth  - cropImgEl.naturalWidth  * cropScale) / 2;
  cropOffsetY = (vp.offsetHeight - cropImgEl.naturalHeight * cropScale) / 2;
  applyCropTransform();
}

function applyCropTransform() {
  if (!cropImgEl) return;
  const vp   = document.getElementById('crop-viewport');
  const imgW = cropImgEl.naturalWidth  * cropScale;
  const imgH = cropImgEl.naturalHeight * cropScale;
  cropOffsetX = Math.min(0, Math.max(vp.offsetWidth  - imgW, cropOffsetX));
  cropOffsetY = Math.min(0, Math.max(vp.offsetHeight - imgH, cropOffsetY));
  cropImgEl.style.transformOrigin = '0 0';
  cropImgEl.style.width  = cropImgEl.naturalWidth  + 'px';
  cropImgEl.style.height = cropImgEl.naturalHeight + 'px';
  cropImgEl.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropScale})`;
}

function bindCropDrag() {
  const vp = document.getElementById('crop-viewport');
  vp.addEventListener('mousedown',  onCropDragStart);
  vp.addEventListener('touchstart', onCropDragStart, { passive: true });
  window.addEventListener('mousemove', onCropDragMove);
  window.addEventListener('touchmove', onCropDragMove, { passive: false });
  window.addEventListener('mouseup',   onCropDragEnd);
  window.addEventListener('touchend',  onCropDragEnd);
}

function unbindCropDrag() {
  const vp = document.getElementById('crop-viewport');
  vp.removeEventListener('mousedown',  onCropDragStart);
  vp.removeEventListener('touchstart', onCropDragStart);
  window.removeEventListener('mousemove', onCropDragMove);
  window.removeEventListener('touchmove', onCropDragMove);
  window.removeEventListener('mouseup',   onCropDragEnd);
  window.removeEventListener('touchend',  onCropDragEnd);
}

function getXY(e) {
  return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
}

function onCropDragStart(e) {
  const { x, y } = getXY(e);
  cropDragStart = { x, y, ox: cropOffsetX, oy: cropOffsetY };
}

function onCropDragMove(e) {
  if (!cropDragStart) return;
  if (e.cancelable) e.preventDefault();
  const { x, y } = getXY(e);
  cropOffsetX = cropDragStart.ox + (x - cropDragStart.x);
  cropOffsetY = cropDragStart.oy + (y - cropDragStart.y);
  applyCropTransform();
}

function onCropDragEnd() { cropDragStart = null; }

/* Konfirmasi crop → upload ke Cloudinary → simpan URL ke Firestore */
async function confirmCrop() {
  const vp     = document.getElementById('crop-viewport');
  const canvas = document.createElement('canvas');
  canvas.width  = vp.offsetWidth;
  canvas.height = vp.offsetHeight;
  canvas.getContext('2d').drawImage(
    cropImgEl,
    cropOffsetX, cropOffsetY,
    cropImgEl.naturalWidth  * cropScale,
    cropImgEl.naturalHeight * cropScale
  );

  /* Tutup modal & tampilkan loading */
  document.getElementById('crop-modal').classList.remove('open');
  unbindCropDrag();

  const confirmBtn = document.querySelector('.crop-actions .btn-primary');
  const origText   = confirmBtn ? confirmBtn.textContent : '';

  /* Konversi canvas ke Blob untuk upload */
  canvas.toBlob(async (blob) => {
    /* Tampilkan status upload di tombol upload */
    const uploadLabel = document.querySelector('.upload-label');
    const origLabel   = uploadLabel ? uploadLabel.innerHTML : '';
    if (uploadLabel) uploadLabel.innerHTML = '⏳ Mengupload...';

    try {
      /* 1. Upload ke Cloudinary */
      const formData = new FormData();
      formData.append('file',          blob);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      const res  = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await res.json();

      if (!data.secure_url) throw new Error('Upload gagal: ' + JSON.stringify(data));

      /* 2. Simpan URL ke Firestore */
      const docRef = await addDoc(collection(db, "photos"), {
        url:       data.secure_url,
        createdAt: Date.now()
      });

      /* 3. Tambahkan ke array lokal & render */
      photos.push({ id: docRef.id, url: data.secure_url });
      renderGallery();

    } catch (err) {
      console.error("Upload gagal:", err);
      alert("Upload foto gagal. Pastikan koneksi internet stabil dan coba lagi.");
    } finally {
      if (uploadLabel) uploadLabel.innerHTML = origLabel;
    }
  }, 'image/jpeg', 0.92);
}

/* ── Lightbox ── */
function openLightbox(url) {
  document.getElementById('lightbox-img').src = url;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

/* Init galeri */
loadPhotosFromDB();


/* ════════════════════════════════════════════════════════════
   LOVE NOTES — disimpan di Firestore, sinkron antar device
   ════════════════════════════════════════════════════════════ */
let notes = [];

async function loadNotesFromDB() {
  try {
    const q    = query(collection(db, "notes"), orderBy("createdAt"));
    const snap = await getDocs(q);
    notes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    /* Jika koleksi masih kosong, pakai default */
    notes = [
      { text: 'Kamu adalah alasan aku tersenyum di setiap pagi. Setiap hari bersamamu terasa seperti hadiah.', tag: 'Sayang' },
      { text: "With you, every moment becomes a memory I never want to forget. You're my favorite person.", tag: 'Always' },
      { text: 'Kalau aku bisa memilih lagi, aku akan selalu memilih kamu. Berulang kali, selamanya.', tag: 'Forever' },
      { text: "You make ordinary days feel extraordinary, Bee. I love you more than words can say.", tag: 'My Bee' },
    ];
  }
  renderNotes();
}

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
  document.getElementById('note-toggle-btn').textContent = isOpen ? 'Tutup ✕' : '+ Tambah Pesan Baru';
}

function cancelNote() {
  document.getElementById('note-text-input').value = '';
  document.getElementById('note-tag-input').value  = '';
  document.getElementById('notes-editor').classList.remove('open');
  document.getElementById('note-toggle-btn').textContent = '+ Tambah Pesan Baru';
}

async function saveNote() {
  const text = document.getElementById('note-text-input').value.trim();
  const tag  = document.getElementById('note-tag-input').value.trim() || 'Love';
  if (!text) return;
  try {
    const docRef = await addDoc(collection(db, "notes"), { text, tag, createdAt: Date.now() });
    notes.push({ id: docRef.id, text, tag });
    renderNotes();
    cancelNote();
  } catch (err) {
    console.error("Gagal simpan note:", err);
    alert("Gagal menyimpan pesan. Coba lagi.");
  }
}

loadNotesFromDB();


/* ════════════════════════════════════════════════════════════
   REASONS — disimpan di Firestore, sinkron antar device
   ════════════════════════════════════════════════════════════ */
let reasons = [];

async function loadReasonsFromDB() {
  try {
    const q    = query(collection(db, "reasons"), orderBy("createdAt"));
    const snap = await getDocs(q);
    reasons = snap.docs.map(d => ({ id: d.id, text: d.data().text }));
  } catch (e) {
    /* Default jika koleksi masih kosong */
    reasons = [
      { text: 'Senyummu bisa bikin hari yang paling buruk sekalipun jadi indah.' },
      { text: 'Kamu selalu ada, bahkan saat aku nggak minta.' },
      { text: 'Your laugh is my favorite sound in the whole world.' },
      { text: 'Cara kamu peduli sama orang-orang di sekitarmu bikin aku makin sayang.' },
      { text: 'You make me want to be a better person every single day.' },
      { text: 'Matamu menyimpan dunia yang selalu ingin aku jelajahi.' },
    ];
  }
  renderReasons();
}

function renderReasons() {
  const list = document.getElementById('reasons-list');
  list.innerHTML = '';
  reasons.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'reason-item';
    item.innerHTML = `
      <div class="reason-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="reason-text">${r.text}</div>
    `;
    list.appendChild(item);
  });
}

function toggleReasonInput() {
  const inp    = document.getElementById('reason-input');
  const btns   = document.getElementById('reason-input-btns');
  const isOpen = inp.classList.toggle('open');
  btns.style.display = isOpen ? 'block' : 'none';
  document.getElementById('reason-toggle-btn').textContent = isOpen ? 'Tutup ✕' : '+ Tambah Alasan Baru';
  if (isOpen) inp.focus();
}

function cancelReason() {
  document.getElementById('reason-input').value = '';
  document.getElementById('reason-input').classList.remove('open');
  document.getElementById('reason-input-btns').style.display = 'none';
  document.getElementById('reason-toggle-btn').textContent = '+ Tambah Alasan Baru';
}

async function saveReason() {
  const val = document.getElementById('reason-input').value.trim();
  if (!val) return;
  try {
    const docRef = await addDoc(collection(db, "reasons"), { text: val, createdAt: Date.now() });
    reasons.push({ id: docRef.id, text: val });
    renderReasons();
    cancelReason();
  } catch (err) {
    console.error("Gagal simpan reason:", err);
    alert("Gagal menyimpan. Coba lagi.");
  }
}

loadReasonsFromDB();


/* ════════════════════════════════════════════════════════════
   EKSPOS FUNGSI KE GLOBAL (diperlukan karena ES module)
   Tidak perlu diubah.
   ════════════════════════════════════════════════════════════ */
window._mod = {
  togglePlay, prevTrack, nextTrack, seekMusic,
  handlePhotoUpload, cancelCrop, confirmCrop, applyCropZoom,
  openLightbox, closeLightbox, deletePhoto,
  toggleNoteEditor, cancelNote, saveNote,
  toggleReasonInput, cancelReason, saveReason
};
