import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('lapangan.db');

// --- HELPER BENTROK ---
// Cek bentrok hanya jika TANGGAL SAMA & JAM TABRAKAN
function cekBentrok(tanggal, mulai, selesai, abaikanId = null) {
  const bookings = db.prepare('SELECT * FROM bookings WHERE tanggal = ?').all(tanggal);
  
  for (const b of bookings) {
    if (abaikanId && b.id === abaikanId) continue;
    
    // Logika Tabrakan
    if (mulai < b.jam_selesai && selesai > b.jam_mulai) {
      return true; 
    }
  }
  return false;
}

export async function GET(req) {
  // Ambil parameter tanggal dari URL (misal: ?date=2023-10-25)
  const { searchParams } = new URL(req.url);
  const filterTanggal = searchParams.get('date');

  // Kalau ada filter tanggal, ambil tanggal itu saja. Kalau tidak, ambil semua.
  let query = 'SELECT * FROM bookings ORDER BY tanggal ASC, jam_mulai ASC';
  let params = [];

  if (filterTanggal) {
    query = 'SELECT * FROM bookings WHERE tanggal = ? ORDER BY jam_mulai ASC';
    params = [filterTanggal];
  }

  const bookings = db.prepare(query).all(...params);
  
  // --- LOGIKA STATUS REAL-TIME ---
  const now = new Date();
  // Format tanggal hari ini jadi YYYY-MM-DD (sesuai format input HTML)
  const todayStr = now.toISOString().split('T')[0]; 
  const menitSekarang = (now.getHours() * 60) + now.getMinutes();

  const hasil = bookings.map((b) => {
    let status = "AKAN DATANG"; // Default
    let warna = "blue";         // Biru (Future)

    // 1. Cek apakah ini jadwal masa lalu?
    if (b.tanggal < todayStr || (b.tanggal === todayStr && b.jam_selesai <= menitSekarang)) {
      status = "SELESAI";
      warna = "gray"; // Abu-abu (History)
    }
    // 2. Cek apakah SEDANG MAIN sekarang?
    else if (b.tanggal === todayStr && menitSekarang >= b.jam_mulai && menitSekarang < b.jam_selesai) {
      status = "SEDANG MAIN";
      warna = "red";  // Merah (Busy)
    }
    // 3. Sisanya berarti "AKAN DATANG" (Hijau/Biru)
    else {
      status = "BOOKED";
      warna = "green"; 
    }

    return { ...b, status, warna };
  });

  return NextResponse.json(hasil);
}

export async function POST(req) {
  const { nama, tanggal, mulai, selesai } = await req.json();

  if (cekBentrok(tanggal, mulai, selesai)) {
    return NextResponse.json({ error: "Jadwal BENTROK di tanggal tersebut!" }, { status: 400 });
  }

  const stmt = db.prepare('INSERT INTO bookings (nama_lapangan, tanggal, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?)');
  stmt.run(nama, tanggal, mulai, selesai);
  return NextResponse.json({ message: "Sukses" });
}

export async function PUT(req) {
  const { id, nama, tanggal, mulai, selesai } = await req.json();

  if (cekBentrok(tanggal, mulai, selesai, id)) {
    return NextResponse.json({ error: "Gagal Edit: Jadwal BENTROK!" }, { status: 400 });
  }

  const stmt = db.prepare('UPDATE bookings SET nama_lapangan=?, tanggal=?, jam_mulai=?, jam_selesai=? WHERE id=?');
  stmt.run(nama, tanggal, mulai, selesai, id);
  return NextResponse.json({ message: "Update Sukses" });
}

export async function DELETE(req) {
  const { id } = await req.json();
  db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  return NextResponse.json({ message: "Dihapus" });
}