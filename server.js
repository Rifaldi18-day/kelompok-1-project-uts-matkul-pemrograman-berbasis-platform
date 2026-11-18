const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e7
});

const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// DATA KELOMPOK 1 - KELAS TI25G
// ==========================================
let members = [
  {
    nim: '20250040181',
    nama: 'ABDUL WAHAB ROHMATULLAH',
    username: 'Abdul Wahab',
    kelas: 'TI25G',
    alamat: 'Jl. Pelabuhan II, Lembursitu, Sukabumi',
    ig: '@abdulwahab_r',
    wa: '62 857-9851-4687',
    foto: '/img/abdul.jpg',
    role: 'Ketua Kelompok 1',
    devTag: null
  },
  {
    nim: '20220040223',
    nama: 'ABU NUR AL-FARUQ',
    username: 'Abu Al-Faruq',
    kelas: 'TI25G',
    alamat: 'Jl. Raya Cisaat No. 45, Sukabumi',
    ig: '@abunur_alfaruq',
    wa: '+62 812-3683-8129',
    foto: '/img/abu.jpg',
    role: 'Anggota',
    devTag: null
  },
  {
    nim: '20250040134',
    nama: 'ADAM RIFALDI',
    username: 'Adam Rifaldi',
    kelas: 'TI25G',
    alamat: 'Jl. Bhayangkara No. 12, Gunungpuyuh, Sukabumi',
    ig: '@adamrifaldi_',
    wa: '089503405700',
    foto: '/img/kucing.jpg',
    role: 'Anggota',
    devTag: 'WEB DEVELOPER'
  },
  {
    nim: '20250040014',
    nama: 'ADINDA ANGGRAENA SAPUTRI',
    username: 'Adinda Saputri',
    kelas: 'TI25G',
    alamat: 'Newyork, Cibadak',
    ig: '@adinda.anggraena',
    wa: '62 857-9873-4531',
    foto: '/img/dinda.jpg',
    role: 'Anggota',
    devTag: null
  }
];

// ==========================================
// DATA 7 MATA KULIAH TI25G
// ==========================================
const courses = [
  {
    id: 'pbp',
    kode: 'TIF-301',
    nama: 'Pemrograman Berbasis Komputer',
    dosen: 'Shinta Ayuningtias, S.Kom., M.Kom.',
    genderDosen: 'F',
    sks: 3,
    hari: 'Kamis',
    sesi: 'Sesi 1',
    jam: '07:30 - 10:00 WIB',
    mode: 'Offline',
    lokasi: 'Offline - Lab Komputer B4B',
    deskripsi: 'Pengembangan aplikasi web modern sisi klien dan server menggunakan JavaScript, Node.js, Express, REST API, serta WebSocket.'
  },
  {
    id: 'kompleksitas',
    kode: 'TIF-302',
    nama: 'Kompleksitas Algoritma',
    dosen: 'Dr. Hendra Wijaya, S.Kom., M.T.',
    genderDosen: 'M',
    sks: 3,
    hari: 'Senin',
    sesi: 'Sesi 2',
    jam: '09:30 - 12:00 WIB',
    mode: 'Offline',
    lokasi: 'Offline - Ruang A3A',
    deskripsi: 'Analisis efisiensi waktu dan memori algoritma menggunakan notasi asimtotik Big-O, rekurensi, divide and conquer, dan dynamic programming.'
  },
  {
    id: 'bindo',
    kode: 'UNI-104',
    nama: 'Bahasa Indonesia dan Budaya',
    dosen: 'Dra. Ratna Sari Dewi, M.Hum.',
    genderDosen: 'F',
    sks: 2,
    hari: 'Selasa',
    sesi: 'Sesi 4',
    jam: '13:00 - 14:40 WIB',
    mode: 'Online',
    lokasi: 'Online - Zoom Meeting TI25G',
    deskripsi: 'Penulisan karya ilmiah akademik, tata bahasa baku EYD V, komunikasi efektif, dan pemahaman keberagaman budaya Nusantara.'
  },
  {
    id: 'sister',
    kode: 'TIF-303',
    nama: 'Sistem Paralel dan Terdistribusi',
    dosen: 'Budi Santoso, S.T., M.Kom.',
    genderDosen: 'M',
    sks: 3,
    hari: 'Rabu',
    sesi: 'Sesi 6',
    jam: '13:00 - 16:20 WIB',
    mode: 'Offline',
    lokasi: 'Offline - Ruang B4B',
    deskripsi: 'Arsitektur komputasi terdistribusi, sinkronisasi proses, komunikasi antar-node, replikasi data, dan fault tolerance.'
  },
  {
    id: 'imk',
    kode: 'TIF-304',
    nama: 'Interaksi Manusia dan Komputer',
    dosen: 'Nadia Putri Maharani, S.Kom., M.Ds.',
    genderDosen: 'F',
    sks: 3,
    hari: 'Jumat',
    sesi: 'Sesi 1',
    jam: '08:00 - 10:30 WIB',
    mode: 'Online',
    lokasi: 'Online - Google Meet Kelas',
    deskripsi: 'Perancangan antarmuka pengguna (UI/UX), prinsip usability, prototyping interaktif, dan evaluasi pengalaman pengguna.'
  },
  {
    id: 'jarkom',
    kode: 'TIF-305',
    nama: 'Jaringan Komputer dan Keamanan Informasi',
    dosen: 'Rizky Ramadhan, S.Kom., M.Kom.',
    genderDosen: 'M',
    sks: 3,
    hari: 'Sabtu',
    sesi: 'Sesi 3',
    jam: '10:00 - 12:30 WIB',
    mode: 'Offline',
    lokasi: 'Offline - Lab Jaringan C2',
    deskripsi: 'Protokol TCP/IP, routing, subnetting, kriptografi dasar, konfigurasi firewall, serta mitigasi serangan siber.'
  },
  {
    id: 'metnum',
    kode: 'TIF-306',
    nama: 'Metode Numerik',
    dosen: 'Ir. Bambang Sutrisno, M.Sc.',
    genderDosen: 'M',
    sks: 3,
    hari: 'Kamis',
    sesi: 'Sesi 6',
    jam: '13:00 - 15:30 WIB',
    mode: 'Offline',
    lokasi: 'Offline - Ruang B2A',
    deskripsi: 'Penyelesaian persamaan non-linear, interpolasi polinomial, integrasi numerik, dan sistem persamaan linear berbasis komputasi.'
  }
];

// Helper membuat ISO date mendatang untuk data awal
function makeFutureISO(daysAhead, hourStr) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hourStr}`;
}

// ==========================================
// DATA TUGAS KELOMPOK (DENGAN TANGGAL + JAM ISO)
// ==========================================
let tasks = [
  {
    id: 1,
    matkulId: 'pbp',
    matkulNama: 'Pemrograman Berbasis Komputer',
    judul: 'UTS Webserver Kelompok & Routing Express',
    deadlineISO: makeFutureISO(1, '07:30')
  },
  {
    id: 2,
    matkulId: 'imk',
    matkulNama: 'Interaksi Manusia dan Komputer',
    judul: 'Prototipe UI Frutiger Aero',
    deadlineISO: makeFutureISO(2, '23:59')
  },
  {
    id: 3,
    matkulId: 'jarkom',
    matkulNama: 'Jaringan Komputer dan Keamanan Informasi',
    judul: 'Konfigurasi Subnetting & Firewall',
    deadlineISO: makeFutureISO(3, '10:00')
  },
  {
    id: 4,
    matkulId: 'kompleksitas',
    matkulNama: 'Kompleksitas Algoritma',
    judul: 'Analisis Big-O Sorting Rekursif',
    deadlineISO: makeFutureISO(5, '09:30')
  },
  {
    id: 5,
    matkulId: 'sister',
    matkulNama: 'Sistem Paralel dan Terdistribusi',
    judul: 'Laporan Simulasi Client-Server',
    deadlineISO: makeFutureISO(7, '16:20')
  }
];

let trashedTasks = [];

function getSortedTasks() {
  return [...tasks].sort((a, b) => new Date(a.deadlineISO) - new Date(b.deadlineISO));
}

// ==========================================
// ENDPOINT / ROUTE WAJIB (URUTAN A, B, C DULU)
// ==========================================

// a. Halaman beranda: /beranda
app.get('/beranda', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'beranda.html'));
});

// b. Halaman identitas: /identitas
app.get('/identitas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'identitas.html'));
});

// c. Halaman matakuliah: /matkul & /matkul/:id
app.get('/matkul', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'matkul.html'));
});

app.get('/matkul/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'matkul-detail.html'));
});

// d. Halaman anggota: /anggota
app.get('/anggota', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'anggota.html'));
});

// e. Halaman obrolan: /obrolan
app.get('/obrolan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'obrolan.html'));
});

// f. Halaman profil: /profil
app.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'profil.html'));
});

// Gerbang utama localhost:3000 -> Login NIM
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

// ==========================================
// REST API
// ==========================================
app.post('/api/login', (req, res) => {
  const cleanNim = String(req.body.nim || '').trim();
  const user = members.find((m) => m.nim === cleanNim);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'KAMU BUKAN KELOMPOK 1'
    });
  }

  return res.json({ success: true, user });
});

app.get('/api/data', (req, res) => {
  res.json({
    members,
    courses,
    tasks: getSortedTasks(),
    trashedTasks
  });
});

app.post('/api/profile/update', (req, res) => {
  const { nim, username, foto } = req.body;
  const idx = members.findIndex((m) => m.nim === nim);
  if (idx === -1) {
    return res.status(404).json({ success: false });
  }

  if (username && username.trim()) {
    members[idx].username = username.trim();
  }
  if (foto) {
    members[idx].foto = foto;
  }

  io.emit('membersUpdated', members);
  res.json({ success: true, user: members[idx] });
});

// Tambah Tugas Baru (dengan Tanggal & Jam ISO)
app.post('/api/tasks', (req, res) => {
  const { matkulId, judul, deadlineISO } = req.body;
  const matkul = courses.find((c) => c.id === matkulId);
  if (!matkul || !judul || !deadlineISO) {
    return res.status(400).json({ success: false });
  }

  const newTask = {
    id: Date.now(),
    matkulId: matkul.id,
    matkulNama: matkul.nama,
    judul: judul.trim(),
    deadlineISO
  };

  tasks.push(newTask);
  const sorted = getSortedTasks();
  io.emit('tasksUpdated', { tasks: sorted, trashedTasks });
  res.json({ success: true, task: newTask, tasks: sorted });
});

// Selesaikan tugas -> Lempar ke Tong Sampah (Recycle Bin)
app.delete('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    const [removed] = tasks.splice(idx, 1);
    trashedTasks.unshift(removed);
  }
  const sorted = getSortedTasks();
  io.emit('tasksUpdated', { tasks: sorted, trashedTasks });
  res.json({ success: true, tasks: sorted, trashedTasks });
});

// Restore tugas dari Tong Sampah
app.post('/api/trash/restore/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const idx = trashedTasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    const [restored] = trashedTasks.splice(idx, 1);
    tasks.push(restored);
  }
  const sorted = getSortedTasks();
  io.emit('tasksUpdated', { tasks: sorted, trashedTasks });
  res.json({ success: true, tasks: sorted, trashedTasks });
});

// Kosongkan Tong Sampah
app.delete('/api/trash', (req, res) => {
  trashedTasks = [];
  const sorted = getSortedTasks();
  io.emit('tasksUpdated', { tasks: sorted, trashedTasks });
  res.json({ success: true, tasks: sorted, trashedTasks });
});

// ==========================================
// WEBSOCKET OBROLAN REALTIME
// ==========================================
const chatHistory = {
  grup_kelompok_1: [
    {
      id: 101,
      room: 'grup_kelompok_1',
      senderNim: '20250040134',
      senderName: 'Adam Rifaldi',
      senderFoto: '/img/kucing.jpg',
      text: 'Server Kelompok 1 TI25G aktif.',
      image: null,
      time: '08:00'
    }
  ]
};

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('registerOnline', (nim) => {
    onlineUsers.set(socket.id, nim);
    io.emit('onlineList', Array.from(new Set(onlineUsers.values())));
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    if (!chatHistory[room]) chatHistory[room] = [];
    socket.emit('roomHistory', { room, messages: chatHistory[room] });
  });

  socket.on('sendMessage', (payload) => {
    const { room, senderNim, text, image } = payload;
    const sender = members.find((m) => m.nim === senderNim);
    if (!sender || (!text && !image)) return;

    const timeStr = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const msgObj = {
      id: Date.now() + Math.random(),
      room,
      senderNim: sender.nim,
      senderName: sender.username,
      senderFoto: sender.foto,
      text: text || '',
      image: image || null,
      time: timeStr
    };

    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(msgObj);
    if (chatHistory[room].length > 100) chatHistory[room].shift();

    io.to(room).emit('newMessage', msgObj);
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('onlineList', Array.from(new Set(onlineUsers.values())));
  });
});

server.listen(PORT, () => {
  console.log(`Server Kelompok 1 TI25G aktif di http://localhost:${PORT}`);
});