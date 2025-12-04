import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('lapangan.db');

// --- Cek Bentrok ---
function cekBentrok(mulaiBaru, selesaiBaru, abaikanId = null) {
  const bookings = db.prepare('SELECT * FROM bookings').all();
  
  for (const b of bookings) {
    // Kalau sedang edit, jangan cek bentrok dengan diri sendiri
    if (abaikanId && b.id === abaikanId) continue;

    // Logika Matematika Tabrakan Jadwal
    if (mulaiBaru < b.jam_selesai && selesaiBaru > b.jam_mulai) {
      return true; // Bentrok
    }
  }
  return false; // Aman
}

// 1. GET (Ambil Data & Hitung Status Real-time)
export async function GET() {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY jam_mulai ASC').all();
  
  // Ambil waktu sekarang dalam MENIT juga
  const now = new Date();
  const menitSekarang = (now.getHours() * 60) + now.getMinutes();

  const hasil = bookings.map((b) => {
    // Decision Tree: Apakah menit sekarang ada di antara jadwal?
    const sedangMain = menitSekarang >= b.jam_mulai && menitSekarang < b.jam_selesai;

    return {
      ...b,
      status: sedangMain ? "SEDANG DISEWA" : "TERSEDIA",
      warna: sedangMain ? "red" : "green"
    };
  });

  return NextResponse.json(hasil);
}

// 2. POST (Tambah Baru dengan Cek Bentrok)
export async function POST(req) {
  const { nama, mulai, selesai } = await req.json();

  if (cekBentrok(mulai, selesai)) {
    return NextResponse.json({ error: "Jadwal BENTROK dengan tim lain!" }, { status: 400 });
  }

  const stmt = db.prepare('INSERT INTO bookings (nama_lapangan, jam_mulai, jam_selesai) VALUES (?, ?, ?)');
  stmt.run(nama, mulai, selesai);
  return NextResponse.json({ message: "Sukses" });
}

// 3. PUT (Edit Jadwal)
export async function PUT(req) {
  const { id, nama, mulai, selesai } = await req.json();

  // Cek bentrok, tapi kecualikan ID diri sendiri (karena mau mereplace data lama)
  if (cekBentrok(mulai, selesai, id)) {
    return NextResponse.json({ error: "Gagal Edit: Jadwal baru BENTROK!" }, { status: 400 });
  }

  const stmt = db.prepare('UPDATE bookings SET nama_lapangan=?, jam_mulai=?, jam_selesai=? WHERE id=?');
  stmt.run(nama, mulai, selesai, id);
  return NextResponse.json({ message: "Update Sukses" });
}

// 4. DELETE (Hapus)
export async function DELETE(req) {
  const { id } = await req.json();
  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  return NextResponse.json({ message: "Dihapus" });
}