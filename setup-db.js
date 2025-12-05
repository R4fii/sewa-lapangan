const Database = require('better-sqlite3');
const db = new Database('lapangan.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lapangan TEXT,
    tanggal TEXT,
    jam_mulai INTEGER,
    jam_selesai INTEGER
  )
`);

// Hapus data lama
db.exec('DELETE FROM bookings');

// Fungsi konversi jam:menit ke Total Menit
const toMin = (jam, menit) => (jam * 60) + menit;

// Masukkan Data Sepak Bola
const insert = db.prepare('INSERT INTO bookings (nama_lapangan, jam_mulai, jam_selesai) VALUES (?, ?, ?)');

// Contoh: Lapangan Utara
insert.run('Lapangan Utara', 14, 17);

// Contoh: Lapangan Selatan
insert.run('Lapangan Selatan', 16, 18);

console.log("Database berhasil dibuat");